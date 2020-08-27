"""This module implements the EMAC REV 0 for water quality
variables.

"""
import datetime

from django.db.models import Count, Q

from etl.exceptions import ETLError
from etl.executors.base import ETLPipeline
from etl.executors.emac_utils import ionic_balance
from etl.models import (
    ETLCleanedValue,
    ETLConformedValue,
)
from etl.parser import parse_numeric as etl_parse_numeric
from etl.parser import parse_timestamp as etl_parse_timestamp
from targets.models import Timeseries, DataSource, DataSourceGroup


class Pipeline(ETLPipeline):

    default_context = {
        "sheet_name_keyphrase": "DATOS",
        "group": "monitoreo-aguas",
        "first_line": 8,  # 1-based indexing
    }

    # Constants that are part of the standard
    source_column = 0  # 0-based
    timestamp_column = 3
    first_variable_column = 6

    series_translations = {
        "Sulfatos": "SO4",
        "CO3\nó\nNO3": "CO3",
    }

    def validate_context(self, target, context, data_file):
        """Validates the context for this ETL process. It may include a
        non-null 'group' value.

        """
        group = {**self.default_context, **context}.get("group")
        if not group:
            raise ETLError("context doesn't specify a 'group' value")
        if not DataSourceGroup.objects.filter(
                target=target,
                canonical_name=group,
        ).exists():
            raise ETLError(f"context variable 'group' {group} doesn't match an existing group")

    def should_extract_sheet(self, ctx, sheet_number, sheet):
        """A sheet will be extracted if it's name contains the determined key
        phrase.

        """
        return (
            not sheet["name"] or  # it's a CSV
            ctx["sheet_name_keyphrase"].strip() == sheet["name"].strip()
        )

    def parse_timestamp(self, value):
        """Parses a timestamp for the accepted format for this executor
        (ddmmyyyy).

        """
        if value["value"] is None:
            return None
        if value["type"] == "datetime":
            return etl_parse_timestamp(value["value"])
        s = (
            value["value"]
            if value["type"] == "string"
            else str(value["value"])
        ).zfill(8)
        if len(s) > 8:
            return None
        try:
            day, month, year = map(int, (s[0:2], s[2:4], s[4:]))
            return datetime.datetime(year, month, day)
        except ValueError:
            return None

    def parse_numeric(self, value):
        """Parses a numeric value given the accepted formats for this
        standard. Floats use comma as a separator and numbers may be
        prefixed with a less-than symbol ('<').

        """
        if value["value"] is None:
            return None
        if value["type"] == "number":
            return etl_parse_numeric(value["value"])
        if value["type"] == "string":
            try:
                return float(
                    (
                        value["value"].strip()[1:]
                        if (value["value"] or "").strip().startswith("<")
                        else value["value"]
                    ).strip().replace(",", "."),
                )
            except Exception:
                return None
        return None

    def clean(self, operation):
        """Cleans up extracted values following a transposed layout, where
        each row represents a timestamp and columns hold values for
        different series.

        """
        for header_row in operation.extracted_values.filter(
                linenumber=operation.initial_context["first_line"] + 1
        ).iterator():
            # column index -> variable name
            header = {
                index: cell["value"]
                for index, cell in enumerate(header_row.data)
                if index >= self.first_variable_column
                if (index - self.first_variable_column) % 3 == 0
            }
            for extracted in operation.extracted_values.filter(
                    linenumber__gte=operation.initial_context["first_line"] + 3,
                    sheet_number=header_row.sheet_number,
            ).iterator():
                data = [*extracted.data]
                if not data or all(cell["type"] == "string" and not cell["value"] for cell in data):
                    # empty row, ignore it
                    continue
                if len(data) < self.first_variable_column:
                    # 'empty' row, also ignored
                    continue
                parsed_timestamp = self.parse_timestamp(data[self.timestamp_column])
                if parsed_timestamp is None:
                    operation.add_error(extracted.make_error(
                        "invalid-timestamp",
                        "The row contains an invalid timestamp",
                    ))
                    continue
                for index, series in header.items():
                    value = data[index]
                    if value["type"] == "string" and not value["value"]:
                        continue
                    parsed_value = self.parse_numeric(value)
                    if parsed_value is None:
                        operation.add_error(extracted.make_error(
                            "invalid-value",
                            f"The row contains an invalid numeric value at column {index}",
                        ))
                        continue
                    meta = {"originalValue": value["value"]}
                    cleaned = ETLCleanedValue.create_from_extracted(
                        extracted,
                        value=parsed_value,
                        timestamp=parsed_timestamp,
                        group=operation.initial_context.get("group"),
                        source=data[self.source_column]["value"],
                        series=self.series_translations.get(series, series),
                        meta=meta,
                    )
                    # prevent different values for the same series
                    cleaned.refresh_from_db()
                    previous = ETLCleanedValue.objects.filter(
                        operation=operation,
                        timestamp=cleaned.timestamp,
                        group=cleaned.group,
                        source=cleaned.source,
                        series=cleaned.series,
                    ).exclude(pk=cleaned.pk).first()
                    if previous is not None and previous.value != cleaned.value:
                        operation.add_error(extracted.make_error(
                            "value-mismatch",
                            "The row contains mismatched values",
                            source=data[self.source_column]["value"],
                            series=series,
                        ))
                        continue

    def conform(self, operation):
        """Conforms values attempting to map the combination of (group,
        source, series) to single time series.

        """
        for cleaned in operation.cleaned_values.iterator():
            data_source = DataSource.objects.filter(
                target=operation.target,
                groups__canonical_name=operation.initial_context["group"],
                name=cleaned.source,
            ).first()
            if not data_source:
                operation.add_error(cleaned.make_error(
                    "missing-source",
                    f"The row specifies a non-existent data source: {cleaned.source}",
                ))
                continue
            timeseries = Timeseries.objects.filter(
                target=operation.target,
                data_source=data_source,
            ).annotate(Count('inputs')).filter(
                inputs__count=0,
            ).filter(
                # consider variables or ionic-balance inputs
                Q(template_name__startswith="emac-mvp.variables.") |
                Q(template_name__startswith="emac-mvp.ionic-balance.")
            ).filter(
                # add a space to distinguish same-prefix variables
                # (e.g. B and Be)
                Q(name__startswith=f"{cleaned.series} ") |
                Q(name__exact=cleaned.series)
            ).first()
            if not timeseries:
                operation.add_error(cleaned.make_error(
                    "missing-series",
                    f"The row specifies a non-existent time series: {cleaned.series}",
                    variable=cleaned.series,
                ))
                continue
            ETLConformedValue.create_from_cleaned(
                cleaned,
                series=timeseries,
            )

    def validate(self, operation):
        super().validate(operation)
        if operation.errors:
            return
        for source, ib in ionic_balance(operation):
            if ib is None:
                operation.add_error({
                    "code": "invalid-ionic-balance",
                    "message": "Couldn't compute ionic balance",
                    "source": source.name,
                })
            elif ib > 10:
                operation.add_error({
                    "code": "invalid-ionic-balance",
                    "message": "The ionic balance is above 10",
                    "source": source.name,
                    "ionicBalance": float(ib),
                })

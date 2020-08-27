"""This module implements the EMAC REV 1 for water quality variables.

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
        "group": "monitoreo-aguas",
    }

    points_sheet = "RESUMEN PUNTOS MONITOREO"
    points_first_line = 8
    data_sheet = "CARGA DATOS"
    data_first_line = 9

    date_column = 4  # 0-based
    series_translations = {
        "Sulfatos": "SO4",
        "CO3\nó\nNO3": "CO3",
    }

    def validate_context(self, target, context, data_file):
        """Validates the context for this ETL process. It may include a
        non-null 'group' value. Also, the data file can only be of
        excel format.

        """
        group = {**self.default_context, **context}.get("group")
        if not group:
            raise ETLError("context doesn't specify a 'group' value")
        if not DataSourceGroup.objects.filter(
                target=target,
                canonical_name=group,
        ).exists():
            raise ETLError(f"context variable 'group' {group} doesn't match an existing group")
        if not data_file.filename.endswith(".xls") and \
           not data_file.filename.endswith(".xlsx"):
            raise ETLError(f"data file may only be of excel format (.xls or .xlsx)")

    def should_extract_sheet(self, ctx, sheet_number, sheet):
        """A sheet will be extracted if it's name contains the determined key
        phrase.

        """
        return (
            sheet["name"].strip() == self.points_sheet or
            sheet["name"].strip() == self.data_sheet
        )

    def should_extract_line(self, ctx, sheet_number, sheet, linenumber, row):
        """First line depends on the sheet's name.

        """
        return (
            (sheet["name"].strip() == self.points_sheet and
             linenumber >= self.points_first_line)
            or
            (sheet["name"].strip() == self.data_sheet and
             linenumber >= self.data_first_line)
        )

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

    def parse_timestamp(self, value):
        """Parses a timestamp for the accepted format for this executor
        (dd/mm/yyyy).

        """
        if value["value"] is None:
            return None
        if value["type"] == "datetime":
            return etl_parse_timestamp(value["value"])
        s = (
            value["value"]
            if value["type"] == "string"
            else str(value["value"])
        )
        try:
            day, month, year = map(int, s.split("/"))
            return datetime.datetime(year, month, day)
        except Exception:
            return None

    def clean_points(self, operation):
        """Read points and dates from the points sheet.

        """
        points = {}
        for point_row in operation.extracted_values.filter(
                sheet_name__contains=self.points_sheet,
        ).iterator():
            data = [*point_row.data]
            if len(data) < self.date_column or not data[self.date_column]["value"]:
                # empty, ignore
                continue
            if not data[0]["value"]:
                # no data source, ignore
                continue
            timestamp = self.parse_timestamp(data[self.date_column])
            if timestamp is None:
                operation.add_error(point_row.make_error(
                    "invalid-timestamp",
                    "The row contains an invalid timestamp",
                ))
                continue
            points[data[0]["value"]] = timestamp
        return points

    def clean_data(self, operation, points):
        """Read data and cross-reference it with point data.

        """
        header = {
            index: cell["value"]
            for header_row in operation.extracted_values.filter(
                    sheet_name__contains=self.data_sheet,
                    linenumber=self.data_first_line,
            ).iterator()
            for index, cell in enumerate(header_row.data)
            if index > 0
        }

        for extracted in operation.extracted_values.filter(
                sheet_name__contains=self.data_sheet,
                linenumber__gte=self.data_first_line + 2,
        ).iterator():
            data = [*extracted.data]
            if not data or all(cell["type"] == "string" and not cell["value"] for cell in data):
                # empty row, ignore it
                continue
            if len(data) < 1:
                # 'empty' row, also ignored
                continue
            if not data[0]["value"]:
                # something not point-like
                continue
            parsed_timestamp = points.get(data[0]["value"])
            if parsed_timestamp is None:
                operation.add_error(extracted.make_error(
                    "invalid-data-source",
                    "The row contains an invalid data source reference",
                    data_source=data[0]["value"],
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
                        value=value["value"],
                    ))
                    continue
                meta = {"originalValue": value["value"]}
                cleaned = ETLCleanedValue.create_from_extracted(
                    extracted,
                    value=parsed_value,
                    timestamp=parsed_timestamp,
                    group=operation.initial_context["group"],
                    source=data[0]["value"],
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

    def clean(self, operation):
        """Cleans up extracted values following a transposed layout, where
        each row represents a data point and columns hold values for
        different series.

        """
        points = self.clean_points(operation)
        if operation.errors:
            return
        self.clean_data(operation, points)

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
                    data_source=cleaned.source,
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

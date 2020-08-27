"""This module implements the SMA standard V1-2019 for water quality
variables.

"""
import datetime

from django.db.models import Count, Q

from base.fields import StringEnum
from etl.exceptions import ETLError
from etl.executors.base import ETLPipeline
from etl.models import (
    ETLCleanedValue,
    ETLConformedValue,
)
from etl.parser import parse_numeric, parse_timestamp as etl_parse_timestamp
from targets.models import DataSourceGroup


class Pipeline(ETLPipeline):

    default_context = {
        "sheet_name_keyphrase": "DATOS CALIDAD",
        "group": "monitoreo-aguas",
        "first_line": 8,  # 1-based indexing
    }

    error_codes = ETLPipeline.error_codes | StringEnum(
        INVALID_TIMESTAMP="invalid-timestamp",
        INVALID_VALUE="invalid-value",
        MISSING_SOURCE="missing-source",
        MISSING_SERIES="missing-series",
    )

    sample_files = (
        "etl/samples/PlanillaSMAV12019.xlsx",
    )

    # Constants that are part of the standard
    source_column = 0  # 0-based
    timestamp_column = 2
    first_variable_column = 5

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
            ctx["sheet_name_keyphrase"].lower() in sheet["name"].lower()
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
                        self.error_codes.INVALID_TIMESTAMP,
                        "The row contains an invalid timestamp",
                    ))
                    continue
                for index, series in header.items():
                    value = data[index]
                    if value["type"] == "string" and not value["value"]:
                        continue
                    parsed_value = parse_numeric(value["value"])
                    if parsed_value is None:
                        operation.add_error(extracted.make_error(
                            self.error_codes.INVALID_VALUE,
                            f"The row contains an invalid numeric value at column {index}",
                        ))
                        continue
                    ETLCleanedValue.create_from_extracted(
                        extracted,
                        value=parsed_value,
                        timestamp=parsed_timestamp,
                        group=operation.initial_context.get("group"),
                        source=data[self.source_column]["value"],
                        series=series,
                    )

    def conform_group_queryset(self, context, target, **_):
        return super().conform_group_queryset(context, target).filter(
            canonical_name=context["group"]
        )

    # Don't override conform_source_queryset(self, context, target, groups=None, **_)

    def conform_series_queryset(self, context, target, sources=None, **_):
        return super().conform_series_queryset(context, target, sources=sources).filter(
            template_name__startswith="emac-mvp.variables.",
        ).annotate(Count('inputs')).filter(
            inputs__count=0,
        )

    def conform_parameter_queryset(self, context, target, **_):
        return super().conform_parameter_queryset(context, target).none()

    def conform(self, operation):
        """Conforms values attempting to map the combination of (group,
        source, series) to single time series.

        """
        for cleaned in operation.cleaned_values.iterator():
            data_source = self.conform_source_queryset(operation.initial_context, operation.target).filter(
                groups__canonical_name=operation.initial_context["group"],
                name=cleaned.source,
            ).first()
            if not data_source:
                operation.add_error(cleaned.make_error(
                    self.error_codes.MISSING_SOURCE,
                    f"The row specifies a non-existent data source: {cleaned.source}",
                ))
                continue
            timeseries = self.conform_series_queryset(operation.initial_context, operation.target).filter(
                data_source=data_source,
            ).filter(
                # add a space to distinguish same-prefix variables
                # (e.g. B and Be)
                Q(name__startswith=f"{cleaned.series} ") |
                Q(name__exact=cleaned.series)
            ).first()
            if not timeseries:
                operation.add_error(cleaned.make_error(
                    self.error_codes.MISSING_SERIES,
                    f"The row specifies a non-existent time series: {cleaned.series}",
                    variable=cleaned.series,
                ))
                continue
            ETLConformedValue.create_from_cleaned(
                cleaned,
                series=timeseries,
            )

"""A fully timeseries-agnostic module for the ETL process. The module
assumes a data file of at most 9 columns: timestamp, series name,
value, xyz coordinates, label, metadata (JSON-encoded), sequence
number.

"""
from base.fields import StringEnum
from etl.executors.base import ETLPipeline
from etl.models import (
    ETLCleanedValue,
    ETLConformedValue,
)
from etl.parser import parse_timestamp, parse_numeric, parse_integer, parse_json


class Pipeline(ETLPipeline):

    error_codes = ETLPipeline.error_codes | StringEnum(
        INVALID_ROW="invalid-row",
        INVALID_TIMESTAMP="invalid-timestamp",
        MISSING_SERIES="missing-series",
        INVALID_VALUE="invalid-value",
    )

    def clean(self, operation):
        """Assume data is laid out in 8 columns:
        - timestamp
        - series name
        - value
        - x (optional)
        - y (optional)
        - z (optional)
        - label (optional)
        - meta (optional)
        - sequence (optional)

        """
        for extracted in operation.extracted_values.iterator():
            data = [*extracted.data]
            if not data or all(cell["type"] == "string" and not cell["value"] for cell in data):
                # empty row, ignore it
                continue
            if len(data) < 3:
                operation.add_error(extracted.make_error(
                    self.error_codes.INVALID_ROW,
                    "The row has insufficient cells",
                ))
                continue
            timestamp = parse_timestamp(data[0]["value"])
            if timestamp is None:
                operation.add_error(extracted.make_error(
                    self.error_codes.INVALID_TIMESTAMP,
                    "The row contains an invalid timestamp",
                ))
                continue
            series = data[1]["value"]
            if not series:
                operation.add_error(extracted.make_error(
                    self.error_codes.MISSING_SERIES,
                    "The row is missing a time series name",
                ))
                continue
            value = parse_numeric(data[2]["value"])
            if value is None:
                operation.add_error(extracted.make_error(
                    self.error_cods.INVALID_VALUE,
                    "The row contains an invalid numeric value",
                ))
                continue
            meta = None
            if len(data) >= 8:
                meta = parse_json(data[7]["value"])
            sequence = None
            if len(data) >= 9:
                sequence = parse_integer(data[8]["value"])
            ETLCleanedValue.create_from_extracted(
                extracted,
                series=series,
                value=value,
                timestamp=timestamp,
                **{
                    field: parse_numeric(value["value"])
                    for field, value in zip(
                        ("x_coord", "y_coord", "z_coord"),
                        data[3:],
                    )
                },
                **{
                    "label": "" if len(data) < 7 else (data[6]["value"] or ""),
                    "meta": meta,
                    "sequence": sequence,
                },
            )

    def conform_group_queryset(self, context, target, **_):
        return super().conform_group_queryset(context, target).none()

    def conform_source_queryset(self, context, target, **_):
        return super().conform_source_queryset(context, target).none()

    def conform_series_queryset(self, context, target, **_):
        return super().conform_series_queryset(context, target)

    def conform_parameter_queryset(self, context, target, **_):
        return super().conform_parameter_queryset(context, target).none()

    def conform(self, operation):
        for cleaned in operation.cleaned_values.iterator():
            timeseries = self.conform_series_queryset(operation.initial_context, operation.target).filter(
                canonical_name=cleaned.series
            ).first()
            if timeseries is None:
                operation.add_error(cleaned.make_error(
                    self.error_codes.MISSING_SERIES,
                    "The row specifies a non-existent time series",
                ))
                continue
            ETLConformedValue.create_from_cleaned(
                cleaned,
                series=timeseries,
            )

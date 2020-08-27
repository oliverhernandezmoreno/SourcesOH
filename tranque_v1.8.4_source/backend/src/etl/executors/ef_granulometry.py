"""This module implements  parameter for physical stability.

"""

from base.fields import StringEnum
from etl.executors.base import ETLPipeline
from etl.models import (
    ETLCleanedValue,
    ETLConformedValue,
)
from etl.parser import parse_numeric, parse_timestamp, parse_text


class Pipeline(ETLPipeline):

    default_context = {
        "first_line": 3,  # 1-based indexing
    }

    error_codes = ETLPipeline.error_codes | StringEnum(
        MISSING_SERIES="missing-series",
        INVALID_SERIES="invalid-series",
        INVALID_TIMESTAMP="invalid-timestamp",
        INVALID_VALUE="invalid-value",
        INVALID_META_MESH="invalid-meta-mesh",
        INVALID_META_SAMPLE="invalid-meta-sample",
        INVALID_META_APERTURE="invalid-meta-aperture",
    )

    sample_files = (
        "etl/samples/Planilla-Granulometria.xlsx",
    )

    # This dict represent a mapping from ETL fields to shape {(column, field) -> (index, parser, error_code)}
    shape = {
        ("series",): (None, "ef-mvp.m2.parameters.granulometria", error_codes.INVALID_SERIES),
        ("timestamp",): (3, parse_timestamp, error_codes.INVALID_TIMESTAMP),
        ("value",): (4, parse_numeric, error_codes.INVALID_VALUE),
        ("meta", "malla"): (1, parse_text, error_codes.INVALID_META_MESH),
        ("meta", "muestra"): (2, parse_text, error_codes.INVALID_META_SAMPLE),
        ("meta", "abertura"): (5, parse_numeric, error_codes.INVALID_META_APERTURE),
    }

    def should_extract_sheet(self, ctx, sheet_number, sheet):
        return sheet_number == 0

    def clean(self, operation):
        for index, extracted in enumerate(operation.extracted_values.iterator()):
            data = [*extracted.data]
            cleaned_arguments = {"sequence": index}
            if not data or all(cell["type"] == "string" and not cell["value"] for cell in data):
                # empty row, ignore it
                continue
            for field, (column, parser, error_code) in self.shape.items():
                value = (
                    (
                        parser(data[column]["value"])
                        if len(data) > column else None
                    )
                    if column is not None
                    else parser
                )
                if value is None or (isinstance(value, str) and not value):
                    operation.add_error(extracted.make_error(
                        error_code,
                        f"The row is missing a {'.'.join(field)} or it is invalid",
                        **{".".join(field): data[column]["value"]},
                    ))
                    continue
                cleaned_state = cleaned_arguments
                for term in field[:-1]:
                    cleaned_state[term] = cleaned_state.get(term, {})
                    cleaned_state = cleaned_state[term]
                cleaned_state[field[-1]] = value
            ETLCleanedValue.create_from_extracted(
                extracted,
                **cleaned_arguments,
            )

    def conform_group_queryset(self, context, target, **_):
        return super().conform_group_queryset(context, target).none()

    def conform_source_queryset(self, context, target, **_):
        return super().conform_source_queryset(context, target).none()

    def conform_series_queryset(self, context, target, **_):
        return super().conform_series_queryset(context, target).filter(
            data_source_group__isnull=True,
            data_source__isnull=True,
            template_name__exact=self.shape[("series",)][1]
        )

    def conform_parameter_queryset(self, context, target, **_):
        return super().conform_parameter_queryset(context, target).none()

    def conform(self, operation):
        timeseries = self.conform_series_queryset(operation.initial_context, operation.target).first()
        if timeseries is None and operation.cleaned_values.count() > 0:
            operation.add_error({
                "code": self.error_codes.MISSING_SERIES,
                "message": "The row specifies a non-existent time series",
            })
            return
        for cleaned in operation.cleaned_values.iterator():
            ETLConformedValue.create_from_cleaned(
                cleaned,
                series=timeseries,
            )

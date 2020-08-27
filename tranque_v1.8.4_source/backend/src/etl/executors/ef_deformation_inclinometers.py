"""This module implements deformation parameter (inclinometers) for physical
stability.

"""

from base.fields import StringEnum
from etl.executors.base import ETLPipeline
from etl.models import (
    ETLCleanedValue,
    ETLConformedValue,
)
from etl.parser import parse_numeric, parse_timestamp


class Pipeline(ETLPipeline):

    default_context = {
        "first_line": 2,  # 1-based indexing
    }

    error_codes = ETLPipeline.error_codes | StringEnum(
        INVALID_TIMESTAMP="invalid-timestamp",
        INVALID_SOURCE="invalid-source",
        INVALID_SERIES="invalid-series",
        INVALID_VALUE="invalid-value",
        INVALID_GROUP="invalid-group",
        MISSING_GROUP="missing-group",
        MISSING_SOURCE="missing-source",
        MISSING_SERIES="missing-series",
    )

    sample_files = (
        "etl/samples/Planilla-Inclinometro_manual-deformaciones.xlsx",
    )

    # This dict represent a mapping from ETL fields to shape that
    # contains: {column -> (index, parser, required_flag, error_code)}
    shapes = {
        "inclinometer-axis-x": {
            "timestamp": (0, parse_timestamp, False, error_codes.INVALID_TIMESTAMP),
            "source": (1, parse_numeric, False, error_codes.INVALID_SOURCE),
            "series": (
                None,
                "ef-mvp.m2.parameters.deformacion-inclinometro-z-eje-x",
                False,
                error_codes.INVALID_SERIES,
            ),
            "value": (2, parse_numeric, True, error_codes.INVALID_VALUE),
        },
        "inclinometer-axis-y": {
            "timestamp": (0, parse_timestamp, False, error_codes.INVALID_TIMESTAMP),
            "source": (1, parse_numeric, False, error_codes.INVALID_SOURCE),
            "series": (
                None,
                "ef-mvp.m2.parameters.deformacion-inclinometro-z-eje-y",
                False,
                error_codes.INVALID_SERIES,
            ),
            "value": (3, parse_numeric, True, error_codes.INVALID_VALUE),
        },
        "inclinometer-axis-z": {
            "timestamp": (0, parse_timestamp, False, error_codes.INVALID_TIMESTAMP),
            "source": (1, parse_numeric, False, error_codes.INVALID_SOURCE),
            "series": (
                None,
                "ef-mvp.m2.parameters.deformacion-inclinometro-z-eje-z",
                False,
                error_codes.INVALID_SERIES,
            ),
            "value": (4, parse_numeric, True, error_codes.INVALID_VALUE),
        }
    }

    def should_extract_sheet(self, ctx, sheet_number, sheet):
        return sheet_number == 0

    def clean_instrument(self, operation):
        # extract the core value
        extracted_line = operation.extracted_values.filter(linenumber=2)
        instrument = next((row.data[1] for row in extracted_line if len(row.data) >= 2), {}).get("value")
        if instrument is None or (isinstance(instrument, str) and not instrument):
            operation.add_error({
                "code": self.error_codes.INVALID_GROUP,
                "message": "The global instrument reference is missing",
            })
            return None
        if not (
                self.conform_group_queryset(operation.initial_context, operation.target)
                .filter(name=instrument).exists()
        ):
            operation.add_error({
                "code": self.error_codes.MISSING_GROUP,
                "message": "The global instrument reference doesn't match any pre-existing one",
            })
            return None
        return instrument

    def clean(self, operation):
        instrument = None
        for shape_key, shape in self.shapes.items():
            for extracted in operation.extracted_values.filter(linenumber__gte=10).iterator():
                data = [*extracted.data]
                columns_needed = set(
                    col
                    for col, _, needed, __ in shape.values()
                    if needed
                )
                if not data or all(
                        cell["type"] == "string" and not cell["value"]
                        for index, cell in enumerate(data)
                        if index in columns_needed
                ):
                    # empty row, ignore it
                    continue

                if instrument is None:
                    instrument = self.clean_instrument(operation)
                    if instrument is None:
                        return
                cleaned_arguments = {"group": instrument, "meta": {}}
                for field, (column, parser, _, error_code) in shape.items():
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
                            f"The row is missing a {field} or it is invalid",
                            **{field: data[column]["value"], "shape": shape_key},
                        ))
                        continue
                    cleaned_arguments[field] = value

                ETLCleanedValue.create_from_extracted(
                    extracted,
                    **cleaned_arguments,
                )

    def conform_group_queryset(self, context, target, **_):
        return super().conform_group_queryset(context, target).filter(
            parents__canonical_name="inclinometros"
        )

    # Don't override conform_source_queryset(self, context, target, groups=None, **_)

    def conform_series_queryset(self, context, target, sources=None, **_):
        return super().conform_series_queryset(context, target, sources=sources).filter(
            template_name__in=[shape.get("series")[1] for shape in self.shapes.values()]
        )

    def conform_parameter_queryset(self, context, target, **_):
        return super().conform_parameter_queryset(context, target).none()

    def conform(self, operation):
        for cleaned in operation.cleaned_values.iterator():
            data_source_group = self.conform_group_queryset(operation.initial_context, operation.target).filter(
                name=cleaned.group,
            ).first()
            if data_source_group is None:
                operation.add_error(cleaned.make_error(
                    self.error_codes.MISSING_GROUP,
                    "The row specifies a non-existent DataSourceGroup",
                    name=cleaned.group,
                ))
                continue

            data_source = self.conform_source_queryset(operation.initial_context, operation.target).filter(
                groups__pk=data_source_group.pk,
                hardware_id__endswith=f'-z-{cleaned.source}',
            ).first()

            if data_source is None:
                operation.add_error(cleaned.make_error(
                    self.error_codes.MISSING_SOURCE,
                    "The row specifies a non-existent DataSource",
                    source=f'Punto de {cleaned.group} cota {cleaned.source}',
                ))
                continue

            timeseries = self.conform_series_queryset(operation.initial_context, operation.target).filter(
                data_source=data_source,
                template_name__exact=cleaned.series
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

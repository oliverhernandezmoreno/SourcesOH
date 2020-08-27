"""This module implements topographic profiles parameter for physical
stability.

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
        "first_line": 4,  # 1-based indexing
    }

    error_codes = ETLPipeline.error_codes | StringEnum(
        INVALID_TIMESTAMP="invalid-timestamp",
        INVALID_SOURCE="invalid-source",
        INVALID_SERIES="invalid-series",
        INVALID_X_COORD="invalid-x-coord",
        INVALID_VALUE="invalid-value",
        INVALID_LABEL="invalid-label",
        DUPLICATE_COORDINATE="duplicate-coordinate",
        MISSING_COORDINATE="missing-coordinate",
        INVALID_COORDINATE="invalid-coordinate",
        MISSING_SOURCE="missing-source",
        MISSING_SERIES="missing-series",
    )

    sample_files = (
        "etl/samples/Planilla-Perfiles_topograficos.xlsx",
    )

    # This dict represent a mapping from ETL fields to shape that
    # contains: {column -> (index, parser, required_flag, error_code)}
    shapes = {
        "elevation": {
            "timestamp": (1, parse_timestamp, False, error_codes.INVALID_TIMESTAMP),
            "source": (2, parse_text, False, error_codes.INVALID_SOURCE),
            "series": (None, "ef-mvp.m2.parameters.variables.elevacion", False, error_codes.INVALID_SERIES),
            "x_coord": (3, parse_numeric, True, error_codes.INVALID_X_COORD),
            "value": (4, parse_numeric, True, error_codes.INVALID_VALUE),
            "label": (5, parse_text, True, error_codes.INVALID_LABEL),
        },
        "foundation": {
            "timestamp": (1, parse_timestamp, False, error_codes.INVALID_TIMESTAMP),
            "source": (2, parse_text, False, error_codes.INVALID_SOURCE),
            "series": (
                None,
                "ef-mvp.m2.parameters.variables.perfil-suelo-fundacion",
                False,
                error_codes.INVALID_SERIES,
            ),
            "x_coord": (6, parse_numeric, True, error_codes.INVALID_X_COORD),
            "value": (7, parse_numeric, True, error_codes.INVALID_VALUE),
        }
    }

    def should_extract_sheet(self, ctx, sheet_number, sheet):
        return sheet_number == 0 or sheet["name"].startswith("Coordenadas")

    def clean_coordinates(self, operation):
        # build a mapping of profile to coordinate 4-tuple (xi, yi, xf, yf)
        coordinates = {}
        for extracted in operation.extracted_values.filter(sheet_name__startswith="Coordenadas").iterator():
            data = [*extracted.data]
            if len(data) < 3:
                continue
            profile = parse_text(data[1]["value"])
            if profile is None or (isinstance(profile, str) and not profile):
                continue
            if profile in coordinates:
                operation.add_error(extracted.make_error(
                    self.error_codes.DUPLICATE_COORDINATE,
                    f"The row specifies coordinates for a profile which was already defined"
                ))
                continue
            if all(cell["type"] == "string" and not cell["value"] for cell in data[2:6]):
                continue
            values = tuple(parse_numeric(cell["value"]) for cell in data[2:6])
            if len(values) < 4:
                operation.add_error(extracted.make_error(
                    self.error_codes.MISSING_COORDINATE,
                    "The row is missing a coordinate"
                ))
                continue
            if any(v is None for v in values):
                operation.add_error(extracted.make_error(
                    self.error_codes.INVALID_COORDINATE,
                    f"The row specifies an invalid spatial coordinate"
                ))
                continue
            coordinates[profile] = {
                "source": profile,
                "values": values,
                "sheet_number": extracted.sheet_number,
                "sheet_name": extracted.sheet_name,
                "linenumber": extracted.linenumber
            }
        return coordinates

    def clean_profiles(self, operation, coordinates):
        profiles = set()
        # extract the core values
        for shape_key, shape in self.shapes.items():
            for extracted in operation.extracted_values.filter(sheet_number=0).iterator():
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
                cleaned_arguments = {}
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
                profiles.add(cleaned_arguments.get("source"))
                cleaned_arguments["meta"] = {
                    **cleaned_arguments.get("meta", {}),
                    "coordinates": coordinates.get(cleaned_arguments.get("source"), {}).get("values")
                }
                ETLCleanedValue.create_from_extracted(
                    extracted,
                    **cleaned_arguments,
                )

        for coordinate_profile, coordinate_set in coordinates.items():
            if coordinate_profile not in profiles:
                operation.add_error({
                    "code": self.error_codes.INVALID_SOURCE,
                    "message": "The coordinates profile doesn't match any of the ones given",
                    **coordinate_set,
                })

    def clean(self, operation):
        coordinates = self.clean_coordinates(operation)
        self.clean_profiles(operation, coordinates)

    def conform_group_queryset(self, context, target, **_):
        return super().conform_group_queryset(context, target).filter(
            parents__canonical_name="sectores",
        )

    def conform_source_queryset(self, context, target, groups=None, **_):
        return super().conform_source_queryset(context, target, groups=groups).filter(
            groups__canonical_name="perfil-transversal",
        )

    def conform_series_queryset(self, context, target, sources=None, **_):
        return super().conform_series_queryset(context, target, sources=sources).filter(
            template_name__in=[shape.get("series")[1] for shape in self.shapes.values()],
        )

    def conform_parameter_queryset(self, context, target, **_):
        from targets.profiling import MANIFESTS
        return super().conform_parameter_queryset(context, target).filter(
            canonical_name__in=[
                name
                for name in MANIFESTS.get("ef", {}).get("parameters", {})
                if name.startswith("label-vertice-")
                or name.startswith("label-segmento-")
            ],
        )

    def conform(self, operation):
        parameters = set(filter(
            bool,
            self.conform_parameter_queryset(operation.initial_context, operation.target)
            .values_list("value", flat=True)
        ))
        for cleaned in operation.cleaned_values.iterator():
            data_source = self.conform_source_queryset(operation.initial_context, operation.target).filter(
                name=cleaned.source,
            ).first()
            if data_source is None:
                operation.add_error(cleaned.make_error(
                    self.error_codes.MISSING_SOURCE,
                    "The row specifies a non-existent source",
                    source=cleaned.source,
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
            # at least one parameter is defined and the row doesn't
            # match any of them
            if parameters and \
               timeseries.template_name == self.shapes["elevation"]["series"][1] and \
               cleaned.label not in parameters:
                operation.add_error(cleaned.make_error(
                    self.error_codes.INVALID_LABEL,
                    "The row specifies an invalid label",
                    label=cleaned.label,
                    options=list(parameters),
                ))
                continue
            ETLConformedValue.create_from_cleaned(
                cleaned,
                series=timeseries,
            )

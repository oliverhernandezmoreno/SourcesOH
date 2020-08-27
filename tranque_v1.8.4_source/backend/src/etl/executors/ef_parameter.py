"""This module implements:

- density and fines percentage,
- distance from the dam to the lagoon,
- height of the lagoon's surface,
- total tailings mass,
- phreatic level,
- manual piezometry,
- height of the dam's wall
- height of tailings
- beach slope

parameters for physical stability.

"""
from django.db.models import Q

from base.fields import StringEnum
from etl.exceptions import ETLError
from etl.executors.base import ETLPipeline
from etl.models import (
    ETLCleanedValue,
    ETLConformedValue,
)
from etl.parser import parse_numeric, parse_timestamp, parse_text


class IntermediateError(Exception):
    "An error that ocurred internally during conform phase"
    pass


class Pipeline(ETLPipeline):

    error_codes = ETLPipeline.error_codes | StringEnum(
        INVALID_SERIES="invalid-series",
        INVALID_GROUP="invalid-group",
        INVALID_SOURCE="invalid-source",
        INVALID_TIMESTAMP="invalid-timestamp",
        INVALID_VALUE="invalid-value",
        MISSING_GROUP="missing-group",
        MISSING_SOURCE="missing-source",
        MISSING_SERIES="missing-series",
    )

    flavours = (
        "densidad",
        "muro_laguna",
        "cota_laguna",
        "volumen_relave",
        "nivel_freatico",
        "piezometria",
        "cota_coronamiento_muro",
        "cota_lamas",
        "pendiente_playa",
    )

    @property
    def sample_files(self):
        all_files = dict(zip(self.flavours, [
            "etl/samples/Planilla-Densidad_y_porcentaje_finos.xlsx",
            "etl/samples/Planilla-Distancia_muro_laguna.xlsx",
            "etl/samples/Planilla-Cota_espejo_agua.xlsx",
            "etl/samples/Planilla-Tonelaje_relaves_acumulados.xlsx",
            "etl/samples/Planilla-Nivel_freatico_en_cubeta.xlsx",
            "etl/samples/Planilla-Piezometria_manual.xlsx",
            "etl/samples/Planilla-Cota_coronamiento_muro.xlsx",
            "etl/samples/Planilla-Cota_lamas.xlsx",
            "etl/samples/Planilla-Pendiente_playa.xlsx",
        ]))
        if self.flavour is None:
            return list(all_files.values())
        return list(filter(bool, [all_files.get(self.flavour, None)]))

    # shape -> {column -> (index, parser, error_code)}
    shapes = {
        "parameter_sector": {
            "series": (0, parse_text, error_codes.INVALID_SERIES),
            "group": (1, parse_text, error_codes.INVALID_GROUP),
            "timestamp": (2, parse_timestamp, error_codes.INVALID_TIMESTAMP),
            "value": (3, parse_numeric, error_codes.INVALID_VALUE),
        },
        "only_parameter": {
            "series": (0, parse_text, error_codes.INVALID_SERIES),
            "timestamp": (1, parse_timestamp, error_codes.INVALID_TIMESTAMP),
            "value": (2, parse_numeric, error_codes.INVALID_VALUE),
        },
        "sector_instrument": {
            "group": (0, parse_text, error_codes.INVALID_GROUP),
            "source": (1, parse_text, error_codes.INVALID_SOURCE),
            "timestamp": (2, parse_timestamp, error_codes.INVALID_TIMESTAMP),
            "value": (3, parse_numeric, error_codes.INVALID_VALUE),
        }
    }

    @property
    def default_context(self):
        return {
            "first_line": 3,  # 1-based indexing
            **{
                "densidad": {"shape": "parameter_sector"},
                "muro_laguna": {"shape": "parameter_sector"},
                "cota_laguna": {"shape": "only_parameter"},
                "volumen_relave": {"shape": "only_parameter"},
                "nivel_freatico": {
                    "shape": "sector_instrument",
                    "series": "ef-mvp.m2.parameters.nivel-freatico-manual"
                },
                "piezometria": {
                    "shape": "sector_instrument",
                    "series": "ef-mvp.m2.parameters.presion-poros-manual"
                },
                "cota_coronamiento_muro": {
                    "shape": "sector_instrument",
                    "series": "ef-mvp.m2.parameters.altura-muro",
                },
                "cota_lamas": {
                    "shape": "sector_instrument",
                    "series": "ef-mvp.m2.parameters.variables.cota-lamas"
                },
                "pendiente_playa": {
                    "shape": "sector_instrument",
                    "series": "ef-mvp.m2.parameters.pendiente-playa"
                }
            }.get(self.flavour, {})
        }

    def should_extract_sheet(self, ctx, sheet_number, sheet):
        return sheet_number == 0

    def validate_context(self, target, context, data_file):
        if context.get("shape") is not None:
            if context.get("shape") not in self.shapes:
                raise ETLError("shape is invalid")

    def clean(self, operation):
        shape = self.shapes.get(operation.initial_context.get("shape"))
        for extracted in operation.extracted_values.iterator():
            data = [*extracted.data]
            cleaned_arguments = {}
            if not data or all(cell["type"] == "string" and not cell["value"] for cell in data):
                # empty row, ignore it
                continue
            for field, (column, parser, error_code) in shape.items():
                value = parser(data[column]["value"]) if len(data) > column else None
                if value is None or (isinstance(value, str) and not value):
                    operation.add_error(extracted.make_error(
                        error_code,
                        f"The row is missing a {field} or it is invalid",
                        **{field: data[column]["value"], "shape": operation.initial_context.get("shape")},
                    ))
                    continue
                cleaned_arguments[field] = value
            ETLCleanedValue.create_from_extracted(
                extracted,
                **cleaned_arguments,
            )

    # Conform queryset

    def conform_group_queryset(self, context, target, **_):
        qs = super().conform_group_queryset(context, target)
        if context.get("shape") in ("parameter_sector", "sector_instrument"):
            return qs.filter(parents__canonical_name="sectores")
        return qs.none()

    def conform_source_queryset(self, context, target, groups=None, **_):
        if context.get("shape") in ("parameter_sector", "only_parameter"):
            return super().conform_source_queryset(context, target).none()
        qs = super().conform_source_queryset(context, target, groups=groups)
        if self.flavour == "nivel_freatico":
            return qs.filter(groups__canonical_name="instrumentos-nivel-freatico")
        if self.flavour == "piezometria":
            return qs.filter(groups__canonical_name="piezometros")
        if self.flavour == "cota_coronamiento_muro":
            return qs.filter(groups__canonical_name="perfil-transversal")
        if self.flavour == "cota_lamas":
            return qs.filter(groups__canonical_name="perfil-transversal")
        if self.flavour == "pendiente_playa":
            return qs.filter(groups__canonical_name="perfil-transversal")
        return qs

    def conform_series_queryset(self, context, target, sources=None, groups=None, **_):
        qs = super().conform_series_queryset(context, target)
        if context.get("shape") == "parameter_sector":
            qs = super().conform_series_queryset(context, target, groups=groups).filter(data_source__isnull=True)
        if context.get("shape") == "sector_instrument":
            qs = super().conform_series_queryset(context, target, sources=sources)
        if context.get("shape") == "only_parameter":
            qs = qs.filter(data_source__isnull=True, data_source_group__isnull=True)
        # filter by template name according to each flavour
        templates = {
            "densidad": [
                "ef-mvp.m2.parameters.densidad",
                "ef-mvp.m2.parameters.porcentaje-finos"
            ],
            "muro_laguna": ["ef-mvp.m2.parameters.distancia-laguna"],
            "cota_laguna": ["ef-mvp.m2.parameters.variables.cota-laguna"],
            "volumen_relave": ["ef-mvp.m2.parameters.tonelaje"],
            "nivel_freatico": ["ef-mvp.m2.parameters.nivel-freatico-manual"],
            "piezometria": ["ef-mvp.m2.parameters.presion-poros-manual"],
            "cota_coronamiento_muro": ["ef-mvp.m2.parameters.altura-muro"],
            "cota_lamas": ["ef-mvp.m2.parameters.variables.cota-lamas"],
            "pendiente_playa": ["ef-mvp.m2.parameters.pendiente-playa"],
        }
        if self.flavour in templates:
            return qs.filter(template_name__in=templates.get(self.flavour))
        return qs

    def conform_parameter_queryset(self, context, target, **_):
        return super().conform_parameter_queryset(context, target).none()

    # Resolver helper methods

    def resolve_parameter_sector(self, operation, cleaned):
        data_source_group = self.conform_group_queryset(operation.initial_context, operation.target).filter(
            name=cleaned.group,
        ).first()
        if data_source_group is None:
            operation.add_error(cleaned.make_error(
                self.error_codes.MISSING_GROUP,
                "The row specifies a non-existent group",
                group=cleaned.group,
            ))
            raise IntermediateError()
        return self.conform_series_queryset(operation.initial_context, operation.target).filter(
            data_source_group=data_source_group,
        ).filter(
            Q(name__startswith=f"{cleaned.series} ") |
            Q(name__exact=cleaned.series)
        ).first()

    def resolve_only_parameter(self, operation, cleaned):
        return self.conform_series_queryset(operation.initial_context, operation.target).filter(
            name__exact=cleaned.series
        ).first()

    def resolve_sector_instrument(self, operation, cleaned):
        data_source_group = self.conform_group_queryset(operation.initial_context, operation.target).filter(
            name=cleaned.group,
        ).first()
        if data_source_group is None:
            operation.add_error(cleaned.make_error(
                self.error_codes.MISSING_GROUP,
                "The row specifies a non-existent group",
                group=cleaned.group,
            ))
            raise IntermediateError()
        data_source = self.conform_source_queryset(operation.initial_context, operation.target).filter(
            groups=data_source_group,
            name=cleaned.source,
        ).first()
        if data_source is None:
            operation.add_error(cleaned.make_error(
                self.error_codes.MISSING_SOURCE,
                "The row specifies a non-existent source",
                source=cleaned.source,
            ))
            raise IntermediateError()
        return self.conform_series_queryset(operation.initial_context, operation.target).filter(
            data_source=data_source,
            template_name__exact=operation.initial_context.get('series')
        ).first()

    def resolve_timeseries(self, operation, cleaned):
        shape = operation.initial_context.get("shape")
        resolver = getattr(self, f"resolve_{shape}")
        return resolver(operation, cleaned)

    def conform(self, operation):
        for cleaned in operation.cleaned_values.iterator():
            try:
                timeseries = self.resolve_timeseries(operation, cleaned)
            except IntermediateError:
                continue
            if timeseries is None:
                operation.add_error(cleaned.make_error(
                    self.error_codes.MISSING_SERIES,
                    "The row specifies a non-existent time series",
                    variable=cleaned.series,
                ))
                continue
            ETLConformedValue.create_from_cleaned(
                cleaned,
                series=timeseries,
            )

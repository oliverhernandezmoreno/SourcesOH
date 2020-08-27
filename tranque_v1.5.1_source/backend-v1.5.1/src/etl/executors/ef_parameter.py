"""This module implements:
    - density and percentage of fines,
    - distance lagoon wall,
    - Water mirros conta,
    - accumulated tailings tonnage,
    - phreatic level,
    - manual piezometry,
    - dimension crown wall and
    - lamas cota
    parameters for physical stability.

"""
from django.db.models import Count, Q

from etl.exceptions import ETLError
from etl.executors.base import ETLPipeline
from etl.models import (
    ETLCleanedValue,
    ETLConformedValue,
)
from etl.parser import parse_numeric, parse_timestamp, parse_text
from targets.models import Timeseries, DataSourceGroup, DataSource


class IntermediateError(Exception):
    "An error that ocurred internally during conform phase"
    pass


class Pipeline(ETLPipeline):

    # shape -> {column -> (index, parser)}
    shapes = {
        "parameter_sector": {
            "series": (0, parse_text),
            "group": (1, parse_text),
            "timestamp": (2, parse_timestamp),
            "value": (3, parse_numeric),
        },
        "only_parameter": {
            "series": (0, parse_text),
            "timestamp": (1, parse_timestamp),
            "value": (2, parse_numeric),
        },
        "sector_instrument": {
            "group": (0, parse_text),
            "source": (1, parse_text),
            "timestamp": (2, parse_timestamp),
            "value": (3, parse_numeric),
        }
    }

    default_context = {
        "shape": None,
        "series": None,
        "first_line": 3,  # 1-based indexing
    }

    def validate_context(self, target, context, data_file):
        if context.get("shape") not in self.shapes:
            raise ETLError("executor's shape is not valid")
        if context.get("shape") == 'sector_instrument' and context.get("series") is None:
            raise ETLError("series is missing")

    def should_extract_sheet(self, ctx, sheet_number, sheet):
        return sheet_number == 0

    def clean(self, operation):
        shape = self.shapes.get(operation.initial_context.get("shape"))
        for extracted in operation.extracted_values.iterator():
            data = [*extracted.data]
            cleaned_arguments = {}
            if not data or all(cell["type"] == "string" and not cell["value"] for cell in data):
                # empty row, ignore it
                continue
            for field, (column, parser) in shape.items():
                value = parser(data[column]["value"])
                if value is None or (isinstance(value, str) and not value):
                    operation.add_error(extracted.make_error(
                        f"missing-{field}",
                        f"The row is missing a {field} or it is invalid",
                        **{field: data[column]["value"]},
                    ))
                    continue
                cleaned_arguments[field] = value
            ETLCleanedValue.create_from_extracted(
                extracted,
                **cleaned_arguments,
            )

    def resolve_parameter_sector(self, operation, cleaned):
        data_source_group = DataSourceGroup.objects.filter(
            target=operation.target,
            name=cleaned.group,
        ).first()
        if data_source_group is None:
            operation.add_error(cleaned.make_error(
                "missing-group",
                "The row specifies a non-existent group",
                group=cleaned.group,
            ))
            raise IntermediateError()
        return Timeseries.objects.filter(
            target=operation.target,
            data_source_group=data_source_group,
            data_source__isnull=True,
        ).filter(
            Q(name__startswith=f"{cleaned.series} ") |
            Q(name__exact=cleaned.series)
        ).annotate(Count('inputs')).filter(
            inputs__count=0,
        ).first()

    def resolve_only_parameter(self, operation, cleaned):
        return Timeseries.objects.filter(
            target=operation.target,
            data_source__isnull=True,
            data_source_group__isnull=True
        ).filter(
            name__exact=cleaned.series
        ).annotate(Count('inputs')).filter(
            inputs__count=0,
        ).first()

    def resolve_sector_instrument(self, operation, cleaned):
        data_source_group = DataSourceGroup.objects.filter(
            target=operation.target,
            name=cleaned.group,
        ).first()
        if data_source_group is None:
            operation.add_error(cleaned.make_error(
                "missing-group",
                "The row specifies a non-existent group",
                group=cleaned.group,
            ))
            raise IntermediateError()
        data_source = DataSource.objects.filter(
            target=operation.target,
            groups=data_source_group,
            name=cleaned.source,
        ).first()
        if data_source is None:
            operation.add_error(cleaned.make_error(
                "missing-source",
                "The row specifies a non-existent source",
                source=cleaned.source,
            ))
            raise IntermediateError()
        return Timeseries.objects.filter(
            target=operation.target,
            data_source=data_source,
        ).filter(
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
                    "missing-series",
                    "The row specifies a non-existent time series",
                    variable=cleaned.series,
                ))
                continue
            ETLConformedValue.create_from_cleaned(
                cleaned,
                series=timeseries,
            )

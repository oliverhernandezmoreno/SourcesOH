"""This module implements topographic profiles parameter for physical
stability.

"""

from etl.executors.base import ETLPipeline
from etl.models import (
    ETLCleanedValue,
    ETLConformedValue,
)
from etl.parser import parse_numeric, parse_timestamp, parse_text
from targets.models import Timeseries, DataSource, Parameter


class Pipeline(ETLPipeline):

    # This dict represent a mapping from ETL fields to shape that
    # contains: {column -> (index, parser, required_flag)}
    shapes = {
        "elevation": {
            "timestamp": (1, parse_timestamp, False),
            "source": (2, parse_text, False),
            "series": (None, "ef-mvp.m2.parameters.variables.elevacion", False),
            "x_coord": (3, parse_numeric, True),
            "value": (4, parse_numeric, True),
            "label": (5, parse_text, True),
        },
        "foundation": {
            "timestamp": (1, parse_timestamp, False),
            "source": (2, parse_text, False),
            "series": (None, "ef-mvp.m2.parameters.variables.perfil-suelo-fundacion", False),
            "x_coord": (6, parse_numeric, True),
            "value": (7, parse_numeric, True),
        }
    }

    default_context = {
        "first_line": 4,  # 1-based indexing
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
                    f"duplicate-coordinate",
                    f"The row specifies coordinates for a profile which was already defined"
                ))
                continue
            if all(cell["type"] == "string" and not cell["value"] for cell in data[2:6]):
                continue
            values = tuple(parse_numeric(cell["value"]) for cell in data[2:6])
            if len(values) < 4:
                operation.add_error(extracted.make_error(
                    "missing-coordinate",
                    "The row is missing a coordinate"
                ))
                continue
            if any(v is None for v in values):
                operation.add_error(extracted.make_error(
                    f"invalid-coordinate",
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
        for shape in self.shapes.values():
            for extracted in operation.extracted_values.filter(sheet_number=0).iterator():
                data = [*extracted.data]
                columns_needed = set(
                    col
                    for col, _, needed in shape.values()
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
                for field, (column, parser, _) in shape.items():
                    value = (
                        parser(data[column]["value"])
                        if column is not None
                        else parser
                    )
                    if value is None or (isinstance(value, str) and not value):
                        operation.add_error(extracted.make_error(
                            f"missing-{field}",
                            f"The row is missing a {field} or it is invalid",
                            **{field: data[column]["value"]},
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
                    "code": "invalid-source",
                    "message": "The coordinates profile doesn't match any of the ones given",
                    **coordinate_set,
                })

    def clean(self, operation):
        coordinates = self.clean_coordinates(operation)
        self.clean_profiles(operation, coordinates)

    def conform(self, operation):
        from targets.profiling import MANIFESTS
        parameters = set(filter(bool, Parameter.objects.filter(
            target=operation.target,
            canonical_name__in=[
                name
                for name in MANIFESTS.get("ef", {}).get("parameters", {})
                if name.startswith("label-vertice-")
                or name.startswith("label-segmento-")
            ],
        ).values_list("value", flat=True)))
        for cleaned in operation.cleaned_values.iterator():
            data_source = DataSource.objects.filter(
                target=operation.target,
                name=cleaned.source,
            ).first()
            if data_source is None:
                operation.add_error(cleaned.make_error(
                    "missing-source",
                    "The row specifies a non-existent source",
                    source=cleaned.source,
                ))
                continue
            timeseries = Timeseries.objects.filter(
                target=operation.target,
                data_source=data_source,
            ).filter(
                template_name__exact=cleaned.series
            ).first()
            if timeseries is None:
                operation.add_error(cleaned.make_error(
                    "missing-series",
                    "The row specifies a non-existent time series",
                ))
                continue
            # at least one parameter is defined and the row doesn't
            # match any of them
            if parameters and \
               timeseries.template_name == self.shapes["elevation"]["series"][1] and \
               cleaned.label not in parameters:
                operation.add_error(cleaned.make_error(
                    "invalid-label",
                    "The row specifies an invalid label",
                    label=cleaned.label,
                    options=list(parameters),
                ))
                continue
            ETLConformedValue.create_from_cleaned(
                cleaned,
                series=timeseries,
            )

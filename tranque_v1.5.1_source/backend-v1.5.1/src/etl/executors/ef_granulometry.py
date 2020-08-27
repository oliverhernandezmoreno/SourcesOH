"""This module implements  parameter for physical stability.

"""

from etl.executors.base import ETLPipeline
from etl.models import (
    ETLCleanedValue,
    ETLConformedValue,
)
from etl.parser import parse_numeric, parse_timestamp, parse_text
from targets.models import Timeseries


class Pipeline(ETLPipeline):

    # This dict represent a mapping from ETL fields to shape {(column, field) -> (index, parser)}
    shape = {
        ("series",): (None, "ef-mvp.m2.parameters.granulometria"),
        ("timestamp",): (3, parse_timestamp),
        ("value",): (4, parse_numeric),
        ("meta", "malla"): (1, parse_text),
        ("meta", "muestra"): (2, parse_text),
        ("meta", "abertura"): (5, parse_numeric),
    }

    default_context = {
        "first_line": 3,  # 1-based indexing
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
            for field, (column, parser) in self.shape.items():
                value = (
                    parser(data[column]["value"])
                    if column is not None
                    else parser
                )
                if value is None or (isinstance(value, str) and not value):
                    operation.add_error(extracted.make_error(
                        f"missing-{'.'.join(field)}",
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

    def conform(self, operation):
        for cleaned in operation.cleaned_values.iterator():
            timeseries = Timeseries.objects.filter(
                target=operation.target,
                data_source_group__isnull=True,
                data_source__isnull=True,
            ).filter(
                template_name__exact=cleaned.series
            ).first()
            if timeseries is None:
                operation.add_error(cleaned.make_error(
                    "missing-series",
                    "The row specifies a non-existent time series",
                ))
                continue
            ETLConformedValue.create_from_cleaned(
                cleaned,
                series=timeseries,
            )

"""The module assumes a data file of minimally two columns: timestamps
and values. The context fully defines the single timeseries to
populate in each operation, through the 'template' and appropriate
'group' or 'source' context values.

"""
from etl.exceptions import ETLError
from etl.executors.base import ETLPipeline
from etl.models import (
    ETLCleanedValue,
    ETLConformedValue,
)
from etl.parser import parse_timestamp, parse_numeric
from targets.models import Timeseries, DataSource, DataSourceGroup


class Pipeline(ETLPipeline):

    def timeseries_for_context(self, target, context):
        """Get a single time series for the given target and context.

        """
        from targets.profiling import FOREST
        template = next(
            (t for t in FOREST.values()
             if t.value.canonical_name == context.get("template")),
            None,
        )
        if template is None:
            return None
        qs = Timeseries.objects.filter(template_name=template.value.canonical_name, target=target)
        if template.value.scope is None:
            if qs.count() != 1:
                return None
            return qs.first()
        if template.value.scope == "group":
            group = DataSourceGroup.objects.filter(
                target=target,
                canonical_name=context.get("group"),
            ).first()
            qs = qs.filter(data_source_group=group)
            if qs.count() != 1:
                return None
            return qs.first()
        if template.value.scope == "spread":
            source = DataSource.objects.filter(
                target=target,
                hardware_id=context.get("source"),
            ).first()
            qs = qs.filter(data_source=source)
            if qs.count() != 1:
                return None
            return qs.first()
        return None

    def validate_context(self, target, context, data_file):
        """Validates the context for this ETL process. It should contain the
        `template` key and possibly a `group` key if the template is
        group-scoped, or a `source` key if the template is
        spread-scoped (or neither if it's global).

        """
        if self.timeseries_for_context(target, context) is None:
            raise ETLError("context doesn't identify a single time series")

    def clean(self, operation):
        """Performs the clean phase of ECCD. It assumes the first column is
        the timestamp and the second column is the value, and the rest
        is optional and matches (x, y, z, label).

        """
        for extracted in operation.extracted_values.iterator():
            data = [*extracted.data]
            if not data or all(cell["type"] == "string" and not cell["value"] for cell in data):
                # empty row, ignore it
                continue
            if len(data) < 2:
                operation.add_error(extracted.make_error(
                    "missing-value",
                    "The row is missing a value",
                ))
                continue
            timestamp_data = data[0]
            timestamp = parse_timestamp(timestamp_data["value"])
            if timestamp is None:
                operation.add_error(extracted.make_error(
                    "invalid-timestamp",
                    "The row contains an invalid timestamp",
                ))
                continue
            value_data = data[1]
            value = parse_numeric(value_data["value"])
            if value is None:
                operation.add_error(extracted.make_error(
                    "invalid-value",
                    "The row contains an invalid numeric value",
                ))
                continue
            ETLCleanedValue.create_from_extracted(
                extracted,
                value=value,
                timestamp=timestamp,
                **{
                    field: parse_numeric(value["value"])
                    for field, value in zip(
                        ("x_coord", "y_coord", "z_coord"),
                        data[2:],
                    )
                },
                **{"label": "" if len(data) < 6 else (data[5]["value"] or "")},
            )

    def conform(self, operation):
        """Performs the conform phase of ECCD validating referential integrity
        only in terms of the context.

        """
        timeseries = self.timeseries_for_context(operation.target, operation.initial_context)
        if timeseries is None:
            operation.add_error(operation.make_error(
                "reference-error",
                "The context doesn't identify a timeseries",
            ))
            return
        ETLConformedValue.objects.bulk_create([
            ETLConformedValue.make_from_cleaned(
                cleaned,
                series=timeseries,
            )
            for cleaned in operation.cleaned_values.iterator()
        ])

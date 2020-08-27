"""The modules assumes no data file and all data contained in the
context. This executor is intended to be used with forms that upload
small amounts of timeseries data.

"""
from django.utils import timezone
import jsonschema

from etl.exceptions import ETLError
from etl.executors.base import ETLPipeline
from etl.models import ETLConformedValue
from etl.parser import parse_timestamp
from targets.models import Timeseries


class Pipeline(ETLPipeline):

    default_context = {
        "batch": "all",
    }

    CONTEXT_SCHEMA = {
        "type": "object",
        "properties": {
            "events": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                        "value": {"type": "number"},
                        "timestamp": {"type": "string"},
                        "x": {"type": "number"},
                        "y": {"type": "number"},
                        "z": {"type": "number"},
                        "label": {"type": "string"},
                        "meta": {"type": "object"},
                    },
                    "required": ["name", "value"],
                },
            },
        },
        "required": ["events"],
    }

    def validate_context(self, target, context, data_file):
        """Validate the context using jsonschema."""
        try:
            jsonschema.validate(context, self.CONTEXT_SCHEMA)
        except jsonschema.ValidationError as e:
            raise ETLError(e.message)

    def extract(self, operation):
        """No datafile is needed, so nothing needs to be extracted."""
        pass

    def clean(self, operation):
        """Data comes properly enconded in the context, so nothing needs to be
        cleaned.

        """
        pass

    def conform(self, operation):
        """Build conformed values for this ETL process, extracting events
        solely from the context.

        """
        now = timezone.now()
        for linenumber, event in enumerate(operation.initial_context.get("events", []), start=1):
            defaults = {
                "linenumber": linenumber,
                "sheet_number": 0,
                "sheet_name": None,
            }
            series = Timeseries.objects.filter(
                target=operation.target,
                canonical_name=event.get("name"),
            ).first()
            if series is None:
                operation.add_error(operation.make_error(
                    "missing-series",
                    "The event doesn't match an existing time series",
                    **{**defaults, "name": event.get("name")},
                ))
                continue
            timestamp = (
                now
                if not event.get("timestamp")
                else parse_timestamp(event.get("timestamp"))
            )
            if timestamp is None:
                operation.add_error(operation.make_error(
                    "invalid-timestamp",
                    "The event contains an invalid timestamp",
                    **{**defaults, "timestamp": event.get("timestamp")},
                ))
                continue
            for coord in "xyz":
                if event.get(coord) is not None and coord not in (series.space_coords or ""):
                    operation.add_error(operation.make_error(
                        f"invalid-{coord}-coordenate",
                        f"The event contains an {coord} coordinate but the series doesn't allow one",
                        **defaults
                    ))
                    continue
            if operation.errors:
                continue
            ETLConformedValue.objects.create(
                operation=operation,
                series=series,
                value=event.get("value"),
                timestamp=timestamp,
                x_coord=event.get("x"),
                y_coord=event.get("y"),
                z_coord=event.get("z"),
                label=event.get("label") or "",
                meta=event.get("meta"),
                **defaults,
            )

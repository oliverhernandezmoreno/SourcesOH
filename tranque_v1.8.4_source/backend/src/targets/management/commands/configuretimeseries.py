from pathlib import Path
import sys

from django.conf import settings
from django.core.management.base import BaseCommand
import jsonschema
import yaml

import base.command_syntax as syntax
from targets.models import Frequency
from targets.models import MeasurementProtocol
from targets.models import Threshold
from targets.models import Timeseries


class Command(BaseCommand):
    help = """Configures the timeseries that match the given
    canonical names with thresholds and frequencies."""

    with open(Path(__file__).parent / "data" / "configuration.yml") as schema_file:
        SCHEMA = yaml.load(schema_file, Loader=yaml.FullLoader)

    # Example data file:

    # target: foobar
    # timeseries:
    #   - canonical_name: omg
    #     active: false
    #   - canonical_name: baz
    #     thresholds:
    #       - upper: 1.4
    #         lower: 1.2
    #       - lower: 2
    #         kind: serious
    #     frequencies:
    #       - minutes: 60
    #       - minutes: 20
    #         protocol: warning

    def load_data(self, data_file):
        if data_file == "-":
            return yaml.load(sys.stdin, Loader=yaml.FullLoader)
        filepath = Path(data_file if data_file.endswith(".yml") else f"{data_file}.yml")
        if not filepath.is_absolute():
            filepath = Path(settings.BASE_DIR) / filepath
        with open(filepath) as f:
            return yaml.load(f, Loader=yaml.FullLoader)

    def add_arguments(self, parser):
        parser.add_argument("file", help="Path to the YAML data file ('-' for stdin)")
        parser.add_argument("target", nargs="?", help="The target's canonical name")

    def handle(self, *args, **kwargs):
        verbosity = kwargs.get("verbosity", 1)

        spec = self.load_data(kwargs["file"])
        jsonschema.validate(spec, self.SCHEMA)
        target = kwargs.get("target") or spec["target"]
        for timeseries_spec in syntax.replaced_collection(
                spec.get("timeseries", []),
                extra={"target": [target]}
        ):
            canonical_name = timeseries_spec.get("canonical_name")
            ts = (
                Timeseries.objects
                .filter(target__canonical_name=target, canonical_name=canonical_name)
                .first()
            )
            if ts is None:
                if verbosity > 0:
                    self.stdout.write(self.style.ERROR(
                        f"Timeseries {canonical_name} at target {target} doesn't exist",
                    ))
                continue
            if "active" in timeseries_spec:
                ts.active = timeseries_spec.get("active")
                ts.save()
            if "thresholds" in timeseries_spec:
                thresholds = timeseries_spec.get("thresholds", [])
                Threshold.objects.filter(timeseries=ts).update(active=False)
                Threshold.objects.bulk_create([
                    Threshold(**{**th, "timeseries": ts})
                    for th in thresholds
                ])
                if verbosity > 0:
                    self.stdout.write(self.style.SUCCESS(
                        f"Created {len(thresholds)} thresholds for timeseries {canonical_name}",
                    ))
            if "frequencies" in timeseries_spec:
                frequencies = timeseries_spec.get("frequencies", [])
                for f in frequencies:
                    protocol, _ = (
                        MeasurementProtocol.objects.get_or_create(id=f["protocol"])
                        if f.get("protocol") is not None
                        else (None, False)
                    )
                    Frequency.objects.filter(timeseries=ts, protocol=protocol).delete()
                    Frequency.objects.create(timeseries=ts, **{**f, "protocol": protocol})
                if verbosity > 0:
                    self.stdout.write(self.style.SUCCESS(
                        f"Created {len(frequencies)} frequencies for timeseries {canonical_name}",
                    ))

from django.core.management.base import BaseCommand

from targets.models import Timeseries
from targets.profiling import MANIFESTS


class Command(BaseCommand):
    help = "Displays the manifest versions currently installed and available to use"

    def log(self, verbosity):
        if verbosity > 0:
            return lambda text: self.stdout.write(text)
        return lambda _: None

    def handle(self, *args, **kwargs):
        verbosity = kwargs.get("verbosity", 1)
        log = self.log(verbosity)
        log("AVAILABLE:")
        for version in sorted(map(lambda m: m["version"], MANIFESTS.values())):
            log(version)
        log("")
        log("INSTALLED:")
        for version in (
                Timeseries.objects
                .values_list("script_version", flat=True)
                .order_by("script_version")
                .distinct("script_version")
        ):
            log(version)

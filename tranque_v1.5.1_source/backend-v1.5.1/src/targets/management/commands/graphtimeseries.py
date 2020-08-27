import sys

from django.core.management.base import BaseCommand

from targets.graphs import graph
from targets.models import Timeseries


class Command(BaseCommand):
    help = "Builds an SVG dependency or influence graph for the given time series"

    def add_arguments(self, parser):
        parser.add_argument(
            "timeseries",
            help="The time series to base the graph on"
        )
        parser.add_argument(
            "--direction",
            dest="direction",
            help="The direction the graph should take (defaults to inputs)"
        )

    def handle(self, *args, **kwargs):
        canonical_name = kwargs.get("timeseries")
        timeseries = Timeseries.objects.filter(canonical_name=canonical_name).first()
        direction = kwargs.get("direction", "inputs") or "inputs"
        if timeseries is None:
            self.stderr.write(self.style.ERROR(f"Timeseries not found: {canonical_name}"))
        else:
            graph(timeseries, sys.stdout, direction=direction)

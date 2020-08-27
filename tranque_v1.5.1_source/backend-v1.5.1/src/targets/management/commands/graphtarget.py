import sys

from django.core.management.base import BaseCommand

from targets.graphs import target_graph
from targets.models import Target


class Command(BaseCommand):
    help = "Builds an SVG graph from the inventory in the given target"

    def add_arguments(self, parser):
        parser.add_argument(
            "target",
            help="The target (its canonical name) to generate the graph for"
        )

    def handle(self, *args, **kwargs):
        target = Target.objects.filter(canonical_name=kwargs.get("target")).first()
        if target is None:
            self.stderr.write(self.style.ERROR(f"Target not found: {kwargs.get('target')}"))
        else:
            target_graph(target, sys.stdout)

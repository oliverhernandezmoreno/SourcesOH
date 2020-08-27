import sys

from django.core.management.base import BaseCommand

from targets.profiling import FOREST
from targets.graphs import template_graph

options = {
    v.value.canonical_name: v
    for v in FOREST.values()
}


class Command(BaseCommand):
    help = "Builds an SVG dependency or influence graph for the given template"

    def add_arguments(self, parser):
        parser.add_argument(
            "template",
            nargs="+",
            help="The template to base the graph on"
        )
        parser.add_argument(
            "--direction",
            dest="direction",
            help="The direction the graph should take (defaults to inputs)"
        )

    def handle(self, *args, **kwargs):
        templates = kwargs.get("template")
        direction = kwargs.get("direction", "inputs") or "inputs"
        missing = [t for t in templates if t not in options]
        if missing:
            self.stderr.write(self.style.ERROR(f"Templates not found: {', '.join(missing)}"))
        else:
            template_graph(templates, sys.stdout, direction=direction)

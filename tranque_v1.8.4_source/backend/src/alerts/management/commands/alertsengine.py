from django.core.management.base import BaseCommand

from alerts import engine
from targets.models import Target


class Command(BaseCommand):
    help = "Ejecutes the alerts engine for the given target(s)"

    def add_arguments(self, parser):
        parser.add_argument(
            "target",
            nargs="*",
            help="The target(s) that receive the engine execution (ignored when using --all-targets)",
        )
        parser.add_argument(
            "--all-targets",
            action="store_true",
            dest="all_targets",
            help="Run the engine for all targets in the database",
        )
        parser.add_argument(
            "--hints",
            dest="hints",
            help="The optional comma-separated hints given to the engine, used to filter controllers",
        )

    def handle(self, *args, **kwargs):
        verbosity = kwargs.get("verbosity", 1)
        targets = Target.objects.all()
        if not kwargs.get("all_targets", False):
            targets = targets.filter(canonical_name__in=kwargs.get("target", []))
        hints = list(filter(bool, (kwargs.get("hints") or "").split(","))) or None
        for target in targets.iterator():
            affected = engine.run(target, hints=hints)
            if verbosity > 0:
                self.stdout.write(f"{len(affected)} tickets created or updated for target '{target.canonical_name}'")

from django.core.management.base import BaseCommand

from alerts.collector import target_controllers
from targets.models import Target


class Command(BaseCommand):
    help = "List available controllers for a specific target"

    def add_arguments(self, parser):
        parser.add_argument(
            "target",
            nargs=1,
        )

    def handle(self, *args, **kwargs):
        if kwargs.get("target", False):
            target = Target.objects.all().get(canonical_name__in=kwargs.get("target", False))
            for c in target_controllers(target):
                self.stdout.write(c)

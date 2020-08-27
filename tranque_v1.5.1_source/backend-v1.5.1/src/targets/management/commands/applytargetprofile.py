from django.core.management.base import BaseCommand

from targets.models import Target
from targets.profiling import FOREST

options = [
    k
    for k, v in FOREST.items()
    if v.value.highlight
]


class Command(BaseCommand):
    help = f"Applies a profile to the given target. Profile options are {', '.join(options)}"

    def add_arguments(self, parser):
        parser.add_argument("target", help="The target's canonical name")
        parser.add_argument("profile", help=f"The profile (one of {', '.join(options)})")

    def handle(self, *args, **kwargs):
        verbosity = kwargs.get("verbosity", 1)
        canonical_name = kwargs["target"]
        profile = kwargs["profile"]
        Target.objects.get(canonical_name=canonical_name).apply_profile(profile)
        if verbosity > 0:
            self.stdout.write(self.style.SUCCESS(
                f"Applied the profile '{profile}' to the target {canonical_name}",
            ))

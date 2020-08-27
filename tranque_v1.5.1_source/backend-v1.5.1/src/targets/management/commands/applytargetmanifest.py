from django.core.management.base import BaseCommand

from targets.models import Target
from targets.profiling import MANIFESTS

options = list(MANIFESTS)


class Command(BaseCommand):
    help = "Applies the index represented by the given manifest to the given " \
           f"target. Options are {', '.join(options)}"

    def add_arguments(self, parser):
        parser.add_argument("target", help="The target's canonical name")
        parser.add_argument("manifest", help=f"The index manifest (one of {', '.join(options)})")

    def handle(self, *args, **kwargs):
        verbosity = kwargs.get("verbosity", 1)
        canonical_name = kwargs["target"]
        manifest = kwargs["manifest"]
        target = Target.objects.get(canonical_name=canonical_name)
        target.apply_manifest(manifest)
        if verbosity > 0:
            self.stdout.write(self.style.SUCCESS(
                f"Applied the index '{manifest}' to the target {canonical_name}",
            ))

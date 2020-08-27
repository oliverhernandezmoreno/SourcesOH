from django.core.management.base import BaseCommand
from django.db import transaction
from functools import partial, reduce

from targets.models import Zone


def tree_reduce(fn, childrenfn, initial, parent):
    return fn(
        reduce(
            partial(tree_reduce, fn, childrenfn),
            childrenfn(parent),
            initial,
        ),
        parent,
    )


class Command(BaseCommand):
    help = "Tallies the target count in each zone"

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            dest="force",
            help="Forces the mass tally of zones, instead of bailing if at least one tallied zone exists",
        )

    def handle(self, *args, **kwargs):
        verbosity = kwargs.get("verbosity", 1)
        force = kwargs.get("force", False)
        exists = Zone.objects.filter(target_count__gt=0).exists()
        if not force and exists:
            if verbosity > 0:
                self.stdout.write("Zones won't be tallied. Use --force to force re-tally")
            return

        with transaction.atomic():
            for zone in Zone.objects.iterator():
                zone.target_count = tree_reduce(
                    lambda acc, z: acc + z.targets.count(),
                    lambda z: z.children.iterator(),
                    0,
                    zone,
                )
                zone.save()
                if verbosity > 0 and zone.target_count > 0:
                    self.stdout.write(f"Zone {zone.type_id} {zone} tally: {zone.target_count}")

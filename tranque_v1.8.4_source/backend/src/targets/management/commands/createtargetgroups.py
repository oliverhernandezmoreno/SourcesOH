from django.core.management.base import BaseCommand
from django.db import transaction

from api.tests.base import RollbackException
from targets.models import Target
from targets.role_groups.e700 import create_e700_groups
from targets.role_groups.tickets import create_ticket_groups


class Command(BaseCommand):
    help = "Create default permission groups"

    def add_arguments(self, parser):
        parser.add_argument(
            "target",
            nargs="+",
            help="The target(s) that receive the engine execution (ignored when using --all-targets)",
        )
        parser.add_argument(
            '--dry',
            dest='dry',
            action='store_true',
            help='Show groups and permissions without creating them'
        )

    def target_handle(self, target, dry, write):
        try:
            with transaction.atomic():
                create_ticket_groups(target, write)
                create_e700_groups(target, write)
                if dry:
                    raise RollbackException()
        except RollbackException:
            pass

    def handle(self, *args, **kwargs):
        verbosity = kwargs.get("verbosity", 1)
        dry = kwargs.get("dry", False)
        targets = Target.objects.filter(canonical_name__in=kwargs.get("target", []))

        def write(text, v):
            if verbosity > v:
                self.stdout.write(text)

        for target in targets:
            self.target_handle(target, dry, write)

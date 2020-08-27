from django.core.management.base import BaseCommand
from django.db import transaction
import json
from pathlib import Path

from infos.models import Info


class Command(BaseCommand):

    SOURCE = Path(__file__).parent / "data" / "infos.json"

    def load_source(self, source):
        with open(source) as f:
            return json.load(f)

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            dest="force",
            help="Forces the mass load of info records, instead of bailing if at least one info record exists",
        )

    def handle(self, *args, **kwargs):
        verbosity = kwargs.get("verbosity", 1)
        force = kwargs.get("force", False)
        exists = Info.objects.exists()
        if not force and exists:
            if verbosity > 0:
                self.stdout.write("Info records won't be loaded (some exist). Use --force to force re-creation")
            return

        data = self.load_source(self.SOURCE)
        with transaction.atomic():
            for info_data in data:
                Info.objects.update_or_create(
                    id=info_data.get("id"),
                    defaults=dict(
                        title=info_data.get("title"),
                        image_url=info_data.get("image"),
                        description=info_data.get("description"),
                    ),
                )
        if verbosity > 0:
            self.stdout.write(self.style.SUCCESS(f"Loaded {len(data) + 1} info records"))

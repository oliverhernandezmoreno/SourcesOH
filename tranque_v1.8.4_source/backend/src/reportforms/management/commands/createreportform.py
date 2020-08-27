import json
from pathlib import Path
import sys

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction

from reportforms.models import ReportForm, ReportFormVersion


class Command(BaseCommand):
    help = """Creates a report form and a version given the codename and schema
    file."""

    def load_data(self, data_file):
        if data_file == "-":
            return json.load(sys.stdin)
        filepath = Path(
            data_file
            if data_file.endswith(".json")
            else f"{data_file}.json"
        )
        if not filepath.is_absolute():
            filepath = Path(settings.BASE_DIR) / filepath
        with open(filepath) as f:
            return json.load(f)

    def add_arguments(self, parser):
        parser.add_argument("codename", help="The form's codename")
        parser.add_argument("schema", help="Path to the JSON schema file (will be stdin if '-' is given)")
        parser.add_argument(
            "--name",
            dest="name",
            help="Name of the report form (defaults to the codename)",
        )
        parser.add_argument(
            "--description",
            dest="description",
            help="Description of the report form (defaults to a blank description)",
        )
        parser.add_argument(
            "--version-code",
            dest="version_code",
            type=int,
            help="The report form's version code (defaults N + 1, where N exists or is 0)",
        )
        parser.add_argument(
            "--version-title",
            dest="version_title",
            help="The report form's version title (defaults to 'v{version code}')",
        )

    def handle(self, *args, **kwargs):
        verbosity = kwargs.get("verbosity", 1)
        codename = kwargs.get("codename")
        schema = self.load_data(kwargs["schema"])
        with transaction.atomic():
            form, form_created = ReportForm.objects.update_or_create(
                codename=codename,
                defaults={
                    "name": kwargs.get("name") or codename,
                    "description": kwargs.get("description") or "",
                },
            )
            version_code = kwargs.get("version_code")
            if version_code is None:
                max_code = (
                    ReportFormVersion.objects
                    .filter(form=form)
                    .values_list("code", flat=True)
                    .order_by("-code")
                    .first()
                ) or 0
                version_code = max_code + 1
            _, version_created = ReportFormVersion.objects.update_or_create(
                code=version_code,
                form=form,
                defaults={
                    "title": kwargs.get("version_title") or f"v{version_code}",
                    "form_schema": schema,
                },
            )
        if verbosity > 0:
            self.stdout.write(
                f"{'Created' if form_created else 'Updated'} report form '{codename}' "
                f"with {'new' if version_created else 'updated'} version {version_code}",
            )

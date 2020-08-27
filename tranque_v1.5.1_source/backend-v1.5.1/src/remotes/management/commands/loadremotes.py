from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
import yaml

from remotes.models import Remote
from targets.models import Target


class Command(BaseCommand):
    help = "Loads the remotes and links them to targets according to the specified YAML file"

    def load_data(self, data_file):
        filepath = Path(data_file if data_file.endswith(".yml") else f"{data_file}.yml")
        if not filepath.is_absolute():
            filepath = Path(settings.BASE_DIR) / filepath
        with open(filepath) as f:
            return yaml.load(f, Loader=yaml.FullLoader)

    def add_arguments(self, parser):
        parser.add_argument("file", help="Path to the YAML data file")
        parser.add_argument(
            "--skip-buckets",
            dest="skip_buckets",
            action="store_true",
            help="Skip the creation of buckets in the S3 backend",
        )

    def log(self, verbosity):
        if verbosity > 0:
            return lambda message: self.stdout.write(message)
        return lambda *_: None

    def handle(self, *args, **kwargs):
        verbosity = kwargs.get("verbosity", 1)
        skip_buckets = kwargs.get("skip_buckets")
        log = self.log(verbosity)
        remotes = self.load_data(kwargs["file"])["remotes"]
        with transaction.atomic():
            for remote in remotes:
                namespace = remote.pop("namespace")
                targets = set(remote.pop("targets", []))
                r, _ = Remote.objects.update_or_create(
                    namespace=namespace,
                    defaults=remote,
                )
                for canonical_name in targets:
                    target = Target.objects.get(canonical_name=canonical_name)
                    target.remote = r
                    target.save()
                    log(self.style.SUCCESS(
                        f"Created remote '{namespace}' "
                        f"linked to targets: {', '.join(targets)}"
                    ))
                if skip_buckets:
                    log(f"Skipping creation of Bucket '{remote['bucket']}'")
                    continue
                r.create_bucket()

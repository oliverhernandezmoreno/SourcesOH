from django.core.management.base import BaseCommand

from remotes.models import Remote


class Command(BaseCommand):
    help = "Creates or updates a remote according to the current environment variables"

    def add_arguments(self, parser):
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
        r = Remote.create_current()
        if r is None:
            log(self.style.ERROR("Didn't create a remote for the current config"))
        else:
            if skip_buckets:
                log(f"Skipping creation of Bucket '{r.bucket}'")
            else:
                r.create_bucket()
            log(self.style.SUCCESS("Created current remote"))

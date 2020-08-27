from django.core.management.base import BaseCommand

from remotes.models import Remote


class Command(BaseCommand):
    help = "Creates the bucket for a single remote, "\
           "found through the namespace, exchange or bucket name."

    def add_arguments(self, parser):
        parser.add_argument(
            "--namespace",
            dest="namespace",
            help="Filter remotes by namespace",
        )
        parser.add_argument(
            "--exchange",
            dest="exchange",
            help="Filter remotes by exchange",
        )
        parser.add_argument(
            "--bucket",
            dest="bucket",
            help="Filter remotes by bucket name",
        )

    def log(self, verbosity):
        if verbosity > 0:
            return lambda message: self.stdout.write(message)
        return lambda *_: None

    def handle(self, *args, **kwargs):
        verbosity = kwargs.get("verbosity", 1)
        namespace = kwargs.get("namespace") or None
        exchange = kwargs.get("exchange") or None
        bucket = kwargs.get("bucket") or None
        log = self.log(verbosity)
        if not namespace and not exchange and not bucket:
            log(self.style.ERROR("You must specify a remote criterion"))
            return
        queryset = Remote.objects.all()
        if namespace:
            queryset = queryset.filter(namespace=namespace)
        if exchange:
            queryset = queryset.filter(exchange=exchange)
        if bucket:
            queryset = queryset.filter(bucket=bucket)
        if queryset.count() != 1:
            log(self.style.ERROR(f"Found {queryset.count()} remotes for the given criterion"))
            return
        remote = queryset.first()
        if remote.create_bucket():
            log(self.style.SUCCESS(f"Created bucket for remote '{remote}'"))
        else:
            log(self.style.ERROR(f"Couldn't create bucket for remote '{remote}'"))

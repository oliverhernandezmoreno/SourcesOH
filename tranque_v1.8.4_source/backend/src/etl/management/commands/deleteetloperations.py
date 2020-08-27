import datetime

from django.core.management.base import BaseCommand
from django.db.models import Count
from django.utils import timezone

from etl.models import DataFile, ETLOperation


class Command(BaseCommand):
    help = "Deletes old ETL operations and associated objects"

    def add_arguments(self, parser):
        parser.add_argument(
            "--days",
            dest="days",
            help="Delete only operations older than the specified days",
        )

    def handle(self, *args, **kwargs):
        verbosity = kwargs.get("verbosity", 1)
        days = kwargs.get("days")
        qs = ETLOperation.objects.all()
        datafiles_qs = (
            DataFile.objects
            .annotate(Count("etl_operations"))
            .filter(etl_operations__count=0)
        )
        try:
            days = int(days)
        except (ValueError, TypeError):
            days = None
        if days is not None:
            oldest = timezone.now() - datetime.timedelta(days=days)
            qs = qs.filter(started__lt=oldest)
            datafiles_qs = datafiles_qs.filter(created_at__lt=oldest)
        count = qs.count()
        qs.delete()
        if verbosity > 0:
            self.stdout.write(self.style.SUCCESS(f"Deleted {count} ETL operations"))
        count = datafiles_qs.count()
        datafiles_qs.delete()
        if verbosity > 0:
            self.stdout.write(self.style.SUCCESS(f"Deleted {count} orphaned data files"))

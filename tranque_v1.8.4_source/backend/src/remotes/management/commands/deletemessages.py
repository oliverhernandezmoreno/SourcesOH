import datetime

from django.core.management.base import BaseCommand
from django.utils import timezone

from remotes.models import Message


class Command(BaseCommand):
    help = "Deletes old messages"

    def add_arguments(self, parser):
        parser.add_argument(
            "--days",
            dest="days",
            help="Delete only messages older than the specified days",
        )

    def handle(self, *args, **kwargs):
        verbosity = kwargs.get("verbosity", 1)
        days = kwargs.get("days")
        qs = Message.objects.all()
        try:
            days = int(days)
        except (ValueError, TypeError):
            days = None
        if days is not None:
            oldest = timezone.now() - datetime.timedelta(days=days)
            qs = qs.filter(created_at__lt=oldest)
        count = qs.count()
        qs.delete()
        if verbosity > 0:
            self.stdout.write(self.style.SUCCESS(f"Deleted {count} messages"))

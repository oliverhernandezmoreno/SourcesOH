import json

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from base.fields import generate_id
from remotes.dispatch import send_messages
from remotes.serializers import MessageSerializer


class Command(BaseCommand):
    help = "Sends a message to an exchange"

    def add_arguments(self, parser):
        parser.add_argument(
            "command",
            help="The command for the message",
        )
        parser.add_argument(
            "body",
            help="The message body",
        )
        parser.add_argument(
            "--exchange",
            dest="exchange",
            help="The exchange to use (by default settings.AMQP_FEDERATED_EXCHANGE)",
        )
        parser.add_argument(
            "--origin",
            dest="origin",
            help="The origin to use (by default settings.NAMESPACE)",
        )

    def handle(self, *args, **kwargs):
        verbosity = kwargs.get("verbosity", 1)
        command = kwargs.get("command")
        body = json.loads(kwargs.get("body"))
        exchange = kwargs.get("exchange") or settings.AMQP_FEDERATED_EXCHANGE
        origin = kwargs.get("origin") or settings.NAMESPACE
        serializer = MessageSerializer(data={
            "id": generate_id(),
            "command": command,
            "body": body,
            "origin": origin,
            "created_at": timezone.now().isoformat(),
        }, context={"exchange": exchange})
        serializer.is_valid(raise_exception=True)
        message = serializer.save()
        send_messages([message])
        if verbosity > 0:
            self.stdout.write("Message sent")

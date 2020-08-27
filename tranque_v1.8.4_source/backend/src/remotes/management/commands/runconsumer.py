import importlib
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from remotes.dispatch import dispatch_rules
from remotes.dispatch import start_consumer
from remotes.models import Remote


class Command(BaseCommand):
    help = "Starts an amqp consumer"

    def add_arguments(self, parser):
        parser.add_argument(
            "--smc",
            dest="smc",
            action="store_true",
            help="Start consumer for the exchange in the SMC",
        )
        parser.add_argument(
            "--autoreload",
            dest="autoreload_var",
            action="store_true",
            help="Start consumer with autoreload native fuction"
        )

    def collect_handlers(self):
        """Attempt to collect handlers from all files ending in 'handler.py'
        """
        # search for handlers in all files ending with "handlers.py":
        for path in Path(settings.BASE_DIR).glob('**/*handlers.py'):
            module = '.'.join(str(path.relative_to(Path(settings.BASE_DIR)))[:-3].split('/'))
            try:
                importlib.import_module(module)
            except Exception:
                self.stderr.write(self.style.ERROR(f"Couldn't import {module}"))

    def present_handlers(self):
        for command, handlers in dispatch_rules.items():
            for handler in handlers:
                self.stdout.write(f"{self.style.SUCCESS(command)}: {handler.fn.__module__}.{handler.fn.__name__}")

    def exchange_names(self):
        """Returns a set of exchange names for the default consumer.

        """
        return set([
            settings.AMQP_FEDERATED_EXCHANGE,
            *(r.exchange for r in Remote.objects.all()),
        ])

    def start_ghost(self, *args, **kwargs):
        smc = bool(kwargs["smc"])

        start_consumer(
            [settings.SMC_AMQP_EXCHANGE] if smc else self.exchange_names,
            settings.SMC_AMQP_QUEUE if smc else settings.AMQP_FEDERATED_QUEUE,
            settings.SMC_BROKER_URL if smc else settings.BROKER_URL,
            settings.SMC_AMQP_SSL if smc else settings.AMQP_SSL
        )

    def handle(self, *args, **kwargs):
        verbosity = kwargs.get("verbosity", 1)
        self.collect_handlers()

        autoreload_var = bool(kwargs["autoreload_var"])

        if verbosity > 0:
            self.present_handlers()
            self.stdout.write(f"Starting consumer")
            self.stdout.flush()
        self.stderr.flush()

        if autoreload_var:
            self.stdout.write("ATTENTION! Autoreload is enabled!")
            from django.utils.autoreload import run_with_reloader
            run_with_reloader(
                self.start_ghost, *args, **kwargs
            )
        else:
            self.stdout.write("ATTENTION! Autoreload is disabled!")
            self.start_ghost(*args, **kwargs)

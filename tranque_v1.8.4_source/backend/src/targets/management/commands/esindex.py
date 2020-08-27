from django.core.management.base import BaseCommand

from targets.elastic import connect


class Command(BaseCommand):
    help = "Operates over indices in elasticsearch"

    COMMANDS = {
        "list": "list",
        "delete": "delete",
    }

    def add_arguments(self, parser):
        parser.add_argument("command", help="The subcommand (list, delete)")
        parser.add_argument("index", nargs="*", help="The index to operate over")

    def list(self, indices, verbosity):
        if verbosity > 0:
            self.stdout.write(", ".join(connect().indices.get_alias("*" if not indices else indices[0]).keys()))

    def delete(self, indices, verbosity):
        for index in indices:
            connect().indices.delete(index=index)
            if verbosity > 0:
                self.stdout.write(f"Deleted index {index}")

    def handle(self, *args, **kwargs):
        verbosity = kwargs.get("verbosity", 1)
        command = self.COMMANDS[kwargs.get("command").lower()]
        getattr(self, command)(kwargs.get("index"), verbosity)

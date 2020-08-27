import json
from pathlib import Path

from django.core.management.base import BaseCommand

from etl.exceptions import ETLError
from etl.management.commands.makedatafile import make_datafile
from etl.models import ETLOperation
from etl.models import import_executor
from targets.models import Target


class Command(BaseCommand):
    help = """Creates and delivers an ETL operation for the given target from the
    given executor, file, and context."""

    DEFAULT_EXECUTOR = "generic"

    def add_arguments(self, parser):
        parser.add_argument(
            "target",
            help="The target linked to the operation",
        )
        parser.add_argument(
            "file",
            nargs="?",
            help="The input file, or stdin if omitted or a '-' is given",
        )
        parser.add_argument(
            "--executor",
            dest="executor",
            help=f"The executor used to handle the ETL (defaults to '{self.DEFAULT_EXECUTOR}')",
        )
        parser.add_argument(
            "--file-name",
            dest="file_name",
            help="The file's name in case data is read from stdin",
        )
        parser.add_argument(
            "--no-file",
            action="store_true",
            dest="no_file",
            help="Used to start the operation without any data file",
        )
        parser.add_argument(
            "--context",
            dest="context",
            help="The JSON-encoded context (defaults to empty context {})",
        )

    def handle(self, *args, **kwargs):
        verbosity = kwargs.get("verbosity", 1)
        log = (
            (lambda msg: self.stdout.write(msg))
            if verbosity > 0
            else (lambda _: None)
        )

        target_canonical_name = kwargs.get("target")
        source_file = kwargs.get("file")
        executor = kwargs.get("executor") or self.DEFAULT_EXECUTOR
        file_name = kwargs.get("file_name")
        omit_file = kwargs.get("no_file", False)
        raw_context = kwargs.get("context") or "{}"

        try:
            target = Target.objects.get(canonical_name=target_canonical_name)
        except Exception as e:
            log(self.style.ERROR(f"Target '{target_canonical_name}' doesn't exist"))
            raise e
        assert source_file is None or Path(source_file).is_file(), f"File '{source_file}' doesn't exist"
        assert source_file is not None or file_name is not None, "A file name must be given when reading from stdin"
        try:
            import_executor(executor)
        except ETLError as e:
            log(self.style.ERROR(f"Executor '{executor}' doesn't exist"))
            raise e
        try:
            context = (
                raw_context
                if isinstance(raw_context, dict)
                else json.loads(raw_context)
            )
        except Exception as e:
            log(self.style.ERROR("Context wasn't properly JSON-encoded"))
            raise e
        assert isinstance(context, dict), "Context must be a dictionary"

        data_file = (
            None
            if omit_file
            else make_datafile(source_file, file_name)
        )
        operation = ETLOperation.start(executor, None, target, data_file, context)
        if not operation.deliverable:
            log(self.style.ERROR("Operation is not deliverable"))
            if operation.errors:
                log(json.dumps(operation.errors, indent=2))
            if operation.conformed_values.count() == 0:
                log("no conformed values")
            raise ETLError("operation is not deliverable")
        operation.deliver()
        log(self.style.SUCCESS(f"Operation delivered successfully ({operation.conformed_values.count()} events)"))
        log(f"{self.style.SUCCESS('Operation ID')}: {operation.id}")

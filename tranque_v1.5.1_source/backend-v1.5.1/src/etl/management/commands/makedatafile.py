from pathlib import Path
import sys

from django.contrib.auth import get_user_model
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand
from django.db import transaction

from etl.models import DataFile


def make_datafile(source_file, file_name, **kwargs):
    with (
        open(source_file, "rb")
        if source_file is not None and source_file != "-"
        else sys.stdin
    ) as file_obj:
        filename = Path(file_name or getattr(file_obj, "name", None)).name
        stored_filename = default_storage.save(filename, file_obj)
        return DataFile.objects.create(**{
            "uploaded_by": None,
            **kwargs,
            "file": stored_filename,
            "filename": filename,
        })


class Command(BaseCommand):
    help = "Creates a datafile from the given (actual) file"

    def add_arguments(self, parser):
        parser.add_argument(
            "file",
            nargs="?",
            help="The input file, or stdin if omitted or a '-' is given",
        )
        parser.add_argument(
            "--file-name",
            dest="file_name",
            help="The file's name in case data is read from stdin",
        )
        parser.add_argument(
            "--id",
            dest="id",
            help="The file's id",
        )
        parser.add_argument(
            "--overwrite",
            action="store_true",
            dest="overwrite",
            help="Whether a pre-existent file should be overwritten by this operation",
        )
        parser.add_argument(
            "--author",
            dest="author",
            help="The file's uploader (user's username)",
        )

    @transaction.atomic
    def handle(self, *args, **kwargs):
        verbosity = kwargs.get("verbosity", 1)
        log = (
            (lambda msg: self.stdout.write(msg))
            if verbosity > 0
            else (lambda _: None)
        )
        source_file = kwargs.get("file")
        file_name = kwargs.get("file_name")
        file_id = kwargs.get("id")
        try:
            author = (
                get_user_model().objects.get(username=kwargs.get("author"))
                if kwargs.get("author")
                else None
            )
            if file_id is not None and kwargs.get("overwrite"):
                DataFile.objects.filter(id=file_id).delete()
            df = make_datafile(source_file, file_name, id=file_id, uploaded_by=author)
            log(" ".join([
                self.style.SUCCESS("Created datafile:"),
                df.id,
                self.style.SUCCESS("with name:"),
                df.filename
            ]))
        except get_user_model().DoesNotExist:
            log(self.style.ERROR(f"User {kwargs.get('author')} doesn't exist"))
        except Exception:
            log(self.style.ERROR("Couldn't save file"))

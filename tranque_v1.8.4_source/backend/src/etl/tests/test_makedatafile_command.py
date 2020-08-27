from pathlib import Path
import secrets

from django.core import management

from etl.models import DataFile
from etl.tests.base import ETLBase


class TestETLOperationCommand(ETLBase):

    def test_makedatafile_command(self):
        filepath = self.make_tsv_file([
            ("foo", "bar", "baz"),
            ("omg", "ohmygosh", "owmygawd")
        ])

        with self.subTest("without any options"):
            management.call_command("makedatafile", filepath)
            self.assertTrue(DataFile.objects.filter(filename=Path(filepath).name).exists())

        with self.subTest("with given id"):
            id = f"test-{secrets.token_urlsafe(6)}"
            management.call_command("makedatafile", filepath, "--id", id)
            self.assertTrue(DataFile.objects.filter(id=id).exists())

        with self.subTest("with given author"):
            author = self.mine_user_object.username
            management.call_command("makedatafile", filepath, "--author", author)
            self.assertTrue(DataFile.objects.filter(
                filename=Path(filepath).name,
                uploaded_by__username=author
            ).exists())

        with self.subTest("with given id and overwrite option"):
            id = f"test-{secrets.token_urlsafe(6)}"
            management.call_command("makedatafile", filepath, "--id", id)
            self.assertTrue(DataFile.objects.filter(id=id).exists())
            management.call_command(
                "makedatafile", filepath,
                "--id", id,
                "--overwrite",
                "--file-name", "overwritten"
            )
            self.assertTrue(DataFile.objects.filter(id=id, filename="overwritten").exists())

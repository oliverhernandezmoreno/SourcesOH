import csv
import logging
import secrets
from pathlib import Path

import xlsxwriter as xlsx
import xlwt
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.files import File
from django.core.files.storage import default_storage
from django.utils.dateparse import parse_datetime

from api.tests.base import BaseTestCase
from etl.models import DataFile

logger = logging.getLogger(__name__)


class ETLBase(BaseTestCase):

    def make_datafile(self, filename, **opts):
        if not default_storage.exists(filename):
            with default_storage.open(filename, "w") as f:
                f.write(' ')  # write a character to force creation if storage is S3
        with default_storage.open(filename, "rb") as f:
            return DataFile.objects.create(
                file=File(f),
                filename=Path(filename).name,
                uploaded_by=opts.get(
                    "user",
                    get_user_model().objects.get(
                        username=self.superuser["username"],
                    ),
                ),
            )

    def make_copied_datafile(self, filename, **opts):
        target = self.make_file(Path(filename).suffix)
        with open(str(filename), mode='rb') as src, default_storage.open(target, mode='wb') as dst:
            dst.write(src.read())
        return self.make_datafile(target, **opts)

    def make_xlsx_file(self, *sheets):
        name = self.make_file(".xlsx")
        with default_storage.open(name, mode='w+b') as f:
            with xlsx.Workbook(f) as wb:
                for sheet_number, sheet_data in enumerate(sheets):
                    sheet_name = (
                        f"Sheet {sheet_number}"
                        if not isinstance(sheet_data, dict)
                        else sheet_data["name"]
                    )
                    sheet = wb.add_worksheet(sheet_name)
                    for linenumber, row in enumerate(
                            sheet_data
                            if not isinstance(sheet_data, dict)
                            else sheet_data["data"]
                    ):
                        for colnumber, cell in enumerate(row):
                            sheet.write(linenumber, colnumber, cell)
        return name

    def make_xlsx_datafile(self, *sheets, **opts):
        name = self.make_xlsx_file(*sheets)
        return self.make_datafile(name, **opts)

    def make_xls_file(self, *sheets):
        name = self.make_file(".xls")
        wb = xlwt.Workbook()
        for sheet_number, sheet_data in enumerate(sheets):
            sheet_name = (
                f"Sheet {sheet_number}"
                if not isinstance(sheet_data, dict)
                else sheet_data["name"]
            )
            sheet = wb.add_sheet(sheet_name)
            for linenumber, row in enumerate(
                    sheet_data
                    if not isinstance(sheet_data, dict)
                    else sheet_data["data"]
            ):
                for colnumber, cell in enumerate(row):
                    sheet.write(linenumber, colnumber, cell)
        with default_storage.open(name, mode='w+b') as f:
            wb.save(f)
        return name

    def make_xls_datafile(self, *sheets, **opts):
        name = self.make_xls_file(*sheets)
        return self.make_datafile(name, **opts)

    def make_csv_file(self, sheet):
        name = self.make_file(".csv")
        with default_storage.open(name, "w") as f:
            writer = csv.writer(f)
            for row in sheet:
                writer.writerow(row)
        return name

    def make_csv_datafile(self, sheet, **opts):
        name = self.make_csv_file(sheet)
        return self.make_datafile(name, **opts)

    def make_tsv_file(self, sheet):
        name = f'/{Path(settings.MEDIA_ROOT) / f"{secrets.token_urlsafe(8)}.tsv"}'
        with open(name, 'w') as f:
            writer = csv.writer(f, dialect="excel-tab")
            for row in sheet:
                writer.writerow(row)
        return name

    def make_tsv_datafile(self, sheet, **opts):
        name = self.make_csv_file(sheet)
        return self.make_datafile(name, **opts)

    def normalize_event(self, event):
        """This is used to make assertions, comparing sheet data to events
        loaded.

        """
        return (
            parse_datetime(event["@timestamp"]).timestamp(),
            event["name"],
            event["value"],
            event.get("coords", {}).get("x"),
            event.get("coords", {}).get("y"),
            event.get("coords", {}).get("z"),
            next(
                (
                    label["value"]
                    for label in event["labels"]
                    if label["key"] == "enrichment-tag"
                ),
                "",
            ),
            event.get("meta") or None,
            event.get("sequence"),
        )

    def tearDown(self):
        super().tearDown()
        for p in getattr(self, "files", ()):
            default_storage.delete(p)

from itertools import zip_longest
import json
import secrets

from django.utils.dateparse import parse_datetime

from etl.models import ETLOperation
from etl.tests.base import ETLBase
from targets.models import Timeseries


class GenericETLTestCase(ETLBase):

    def setUp(self):
        self.timeseries1 = Timeseries.objects.create(
            canonical_name=f"etl-test-generic-1-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
        )
        self.timeseries2 = Timeseries.objects.create(
            canonical_name=f"etl-test_generic-2-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
        )
        self.timeseries3 = Timeseries.objects.create(
            canonical_name=f"etl-test_generic-2-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
            range_gte=2.71828,
            range_lt=3.14159,
        )

    def normalize_sheet_row(self, row):
        return tuple([
            parse_datetime(row[0]).timestamp() + (
                0 if row[0].endswith("Z") else
                7200  # fixed two hours of offset for this test
            ),
            *(
                cell if cell is not None else placeholder
                for cell, placeholder in zip_longest(row[1:7], (None, None, None, None, None, ""))
            ),
            json.loads(row[7]) if len(row) >= 8 and row[7] is not None else None,
            row[8] if len(row) >= 9 else None,
        ])

    def etl_sequence(self, builder):
        sheet = [
            ("2018-01-01T10:01:01", self.timeseries1.canonical_name, 1.0),
            ("2018-01-01T12:01:02Z", self.timeseries1.canonical_name, 2.0),
            ("2018-01-01T12:01:03Z", self.timeseries1.canonical_name, 3.0),
            ("2018-01-01T12:01:04Z", self.timeseries1.canonical_name, 4.0),
            ("2018-01-01T12:01:01Z", self.timeseries2.canonical_name, 1.0, 1, 2, 3, "foo"),
            ("2018-01-01T12:01:02Z", self.timeseries2.canonical_name, 2.0, None, 20, None, "bar"),
            ("2018-01-01T12:01:03Z", self.timeseries2.canonical_name, 3.0, 0, 0.1, 0, "baz", '{"lorem":"ipsum"}', 4),
            ("2018-01-01T12:01:04Z", self.timeseries2.canonical_name, 4.0),
        ]
        datafile = builder(sheet)
        operation = ETLOperation.start(
            "generic:whatever",
            datafile.uploaded_by,
            self.target_object,
            datafile,
            {"timezoneOffset": 120},
        )
        assert operation.executor == "generic:whatever"
        assert not operation.finished, f"Operation finished before delivery: {operation.errors}"
        operation.deliver()
        self.assertEqual(operation.state, ETLOperation.ETLState.SUCCESS)
        self.assertEqual(
            [
                self.normalize_event(event)
                for event in self.timeseries1.get_events(0, 10, desc=False)
            ],
            [
                self.normalize_sheet_row(row)
                for row in sheet
                if row[1] == self.timeseries1.canonical_name
            ],
        )
        self.assertEqual(
            [
                self.normalize_event(event)
                for event in self.timeseries2.get_events(0, 10, desc=False)
            ],
            [
                self.normalize_sheet_row(row)
                for row in sheet
                if row[1] == self.timeseries2.canonical_name
            ],
        )

    def test_xlsx(self):
        self.etl_sequence(self.make_xlsx_datafile)

    def test_xls(self):
        self.etl_sequence(self.make_xls_datafile)

    def test_csv(self):
        self.etl_sequence(self.make_csv_datafile)

    def test_failure_by_range(self):
        sheet = [
            ("2018-01-01T10:01:01", self.timeseries3.canonical_name, 1.0),
            ("2018-01-01T10:01:02", self.timeseries3.canonical_name, 3.0),
            ("2018-01-01T10:01:03", self.timeseries3.canonical_name, 4.0),
        ]
        datafile = self.make_csv_datafile(sheet)
        operation = ETLOperation.start(
            "generic",
            datafile.uploaded_by,
            self.target_object,
            datafile,
            {"timezoneOffset": 120},
        )
        assert not operation.deliverable, "Operation didn't fail"
        self.assertEqual(operation.errors, [
            {
                "sheet_number": 0,
                "sheet_name": "",
                "linenumber": 1,
                "code": "out-of-range",
                "message": "The row contains a value that's out of range",
                "operator": "gte",
                "limit": 2.71828,
                "value": 1.0,
            },
            {
                "sheet_number": 0,
                "sheet_name": "",
                "linenumber": 3,
                "code": "out-of-range",
                "message": "The row contains a value that's out of range",
                "operator": "lt",
                "limit": 3.14159,
                "value": 4.0,
            }
        ])

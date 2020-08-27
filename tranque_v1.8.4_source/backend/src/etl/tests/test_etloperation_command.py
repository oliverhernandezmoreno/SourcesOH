import secrets

from django.core import management
from django.utils.dateparse import parse_datetime

from etl.tests.base import ETLBase
from targets.models import Target, Timeseries


class TestETLOperationCommand(ETLBase):

    def setUp(self):
        self.test_target = Target.objects.get(canonical_name=self.target)
        self.test_ts1 = Timeseries.objects.create(
            target=self.test_target,
            type=Timeseries.TimeseriesType.TEST,
            canonical_name=".".join([
                self.test_target.canonical_name,
                "none",
                "ts1",
                secrets.token_urlsafe(8),
            ]),
        )
        self.test_ts2 = Timeseries.objects.create(
            target=self.test_target,
            type=Timeseries.TimeseriesType.TEST,
            canonical_name=".".join([
                self.test_target.canonical_name,
                "none",
                "ts2",
                secrets.token_urlsafe(8),
            ]),
        )

    def test_etloperation_command(self):
        filepath = self.make_tsv_file([
            ("2010-01-01T05:00:00Z", self.test_ts1.canonical_name, 4.5),
            ("2010-02-01T05:00:00Z", self.test_ts1.canonical_name, 5.5),
            ("2010-02-01T05:00:00Z", self.test_ts2.canonical_name, 6.5),
            ("2010-03-01T05:00:00Z", self.test_ts1.canonical_name, 7.5),
            ("2010-03-01T05:00:00Z", self.test_ts2.canonical_name, 8.5),
        ])
        management.call_command(
            "etloperation",
            self.target,
            filepath,
        )
        self.assertEqual(
            [
                (
                    parse_datetime(e["@timestamp"]),
                    e["value"],
                )
                for e in self.test_ts1.get_events(0, 10, desc=True)
            ],
            [
                (parse_datetime("2010-03-01T05:00:00Z"), 7.5),
                (parse_datetime("2010-02-01T05:00:00Z"), 5.5),
                (parse_datetime("2010-01-01T05:00:00Z"), 4.5),
            ],
        )
        self.assertEqual(
            [
                (
                    parse_datetime(e["@timestamp"]),
                    e["value"],
                )
                for e in self.test_ts2.get_events(0, 10, desc=True)
            ],
            [
                (parse_datetime("2010-03-01T05:00:00Z"), 8.5),
                (parse_datetime("2010-02-01T05:00:00Z"), 6.5),
            ],
        )

    def test_full_rows(self):
        filepath = self.make_tsv_file([
            ("2010-01-01T05:00:00Z", self.test_ts1.canonical_name, 4.5, 1, 2, 3, "", '{"foo": "bar"}'),
            ("2010-02-01T05:00:00Z", self.test_ts1.canonical_name, 5.5, None, 1000, None, "", '{"foo": "baz"}'),
        ])
        management.call_command(
            "etloperation",
            self.target,
            filepath,
        )
        self.assertEqual(
            [
                (
                    parse_datetime(e["@timestamp"]),
                    e["value"],
                    e["coords"].get("x"),
                    e["coords"].get("y"),
                    e["coords"].get("z"),
                    e["meta"],
                )
                for e in self.test_ts1.get_events(0, 10, desc=True)
            ],
            [
                (parse_datetime("2010-02-01T05:00:00Z"), 5.5, None, 1000, None, {"foo": "baz"}),
                (parse_datetime("2010-01-01T05:00:00Z"), 4.5, 1, 2, 3, {"foo": "bar"}),
            ],
        )

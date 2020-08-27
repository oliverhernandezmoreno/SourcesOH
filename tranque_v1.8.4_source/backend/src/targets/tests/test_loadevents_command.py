import os
from pathlib import Path
import secrets
import tempfile

from django.core import management
from django.utils.dateparse import parse_datetime

from api.tests.base import BaseTestCase
from targets.models import Target, Timeseries


class TestLoadEventsCommand(BaseTestCase):

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

    def create_file(self, contents):
        fd, path = tempfile.mkstemp(text=True)
        os.close(fd)
        self.files = [*getattr(self, "files", ()), Path(path)]
        with open(path, "w") as f:
            f.write(contents)
        return path

    def tearDown(self):
        for f in getattr(self, "files", ()):
            f.unlink()

    def test_loadevents_command(self):
        filepath = self.create_file(f"""
2010-01-01T05:00:00Z {self.test_ts1.canonical_name} 4.5 "foo bar baz"
2010-02-01T05:00:00Z {self.test_ts1.canonical_name} 5.5 " omg omg omg "
2010-02-01T05:00:00Z {self.test_ts2.canonical_name} 6.5 "Second timeseries ha!"
2010-03-01T05:00:00Z {self.test_ts1.canonical_name} 7.5 "Back to the first timeseries :("
2010-03-01T05:00:00Z {self.test_ts2.canonical_name} 8.5 "Cult of the Lorem Ipsum"
""")
        management.call_command(
            "loadevents",
            filepath,
            columns="tnvl",
        )
        self.assertEqual(
            [
                (
                    parse_datetime(e["@timestamp"]),
                    e["value"],
                    next((
                        l["value"]
                        for l in e["labels"]
                        if l["key"] == "enrichment-tag"
                    ), None),
                )
                for e in self.test_ts1.get_events(0, 10, desc=True)
            ],
            [
                (parse_datetime("2010-03-01T05:00:00Z"), 7.5, "Back to the first timeseries :("),
                (parse_datetime("2010-02-01T05:00:00Z"), 5.5, " omg omg omg "),
                (parse_datetime("2010-01-01T05:00:00Z"), 4.5, "foo bar baz"),
            ],
        )
        self.assertEqual(
            [
                (
                    parse_datetime(e["@timestamp"]),
                    e["value"],
                    next((
                        l["value"]
                        for l in e["labels"]
                        if l["key"] == "enrichment-tag"
                    ), None),
                )
                for e in self.test_ts2.get_events(0, 10, desc=True)
            ],
            [
                (parse_datetime("2010-03-01T05:00:00Z"), 8.5, "Cult of the Lorem Ipsum"),
                (parse_datetime("2010-02-01T05:00:00Z"), 6.5, "Second timeseries ha!"),
            ],
        )

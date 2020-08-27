from decimal import Decimal
import os
from pathlib import Path
import tempfile

from django.core import management

from api.tests.base import BaseTestCase
from targets.models import (
    Target,
    Frequency,
    Threshold,
    Timeseries
)


class TestApplyTresholdsCommand(BaseTestCase):

    def setUp(self):
        self.test_target = Target.objects.get(canonical_name=self.target)
        self.test_ts1 = Timeseries.objects.create(
            target=self.test_target,
            canonical_name=".".join([
                self.test_target.canonical_name,
                "none",
                "foobar",
            ]),
        )
        self.test_ts2 = Timeseries.objects.create(
            target=self.test_target,
            canonical_name=".".join([
                self.test_target.canonical_name,
                "none",
                "barbaz",
            ]),
        )

        fd, path = tempfile.mkstemp(suffix=".yml", text=True)
        os.close(fd)
        self.tmp_file = Path(path)
        with open(self.tmp_file, "w") as f:
            f.write(
                f"""
timeseries:
  - canonical_name: {self.target}.none.foobar
    thresholds:
      - upper: 1.0
        kind: test1
      - upper: 1.1
        lower: 0.9
        kind: test2
      - lower: 2.0
    frequencies:
      - minutes: 10
      - minutes: 50
        protocol: foobarbaz

  - canonical_name: {self.target}.none.barbaz
    thresholds:
      - upper: 1000
        lower: 900""",
            )

        fd, path = tempfile.mkstemp(suffix=".yml", text=True)
        os.close(fd)
        self.tmp_file_expanded = Path(path)
        with open(self.tmp_file_expanded, "w") as f:
            f.write(
                f"""
target: {self.target}

timeseries:
  - canonical_name: "{{target}}.none.{{template}}"
    thresholds:
      - upper: 3.1415
        kind: PI
    frequencies:
      - minutes: 123456
        protocol: counting
    with_template:
      - foobar
      - barbaz""",
            )

    def test_applythresholds_command(self):
        management.call_command(
            "configuretimeseries",
            str(self.tmp_file),
            self.target,  # pass the target as a command argument
            verbosity=0,
        )
        thresholds_first = Threshold.objects.filter(timeseries=self.test_ts1).order_by("upper")
        self.assertEqual(
            [(th.upper, th.lower, th.kind) for th in thresholds_first],
            [
                (Decimal("1.0"), None, "test1"),
                (Decimal("1.1"), Decimal("0.9"), "test2"),
                (None, Decimal("2.0"), None),
            ],
        )
        frequencies_first = Frequency.objects.filter(timeseries=self.test_ts1).order_by("minutes")
        self.assertEqual(
            [(f.minutes, f.protocol_id) for f in frequencies_first],
            [
                (Decimal("10"), None),
                (Decimal("50"), "foobarbaz"),
            ],
        )
        thresholds_second = Threshold.objects.filter(timeseries=self.test_ts2)
        self.assertEqual(
            [(th.upper, th.lower, th.kind) for th in thresholds_second],
            [
                (Decimal("1000"), Decimal("900"), None),
            ],
        )

    def test_expanded_syntax(self):
        management.call_command(
            "configuretimeseries",
            str(self.tmp_file_expanded),
            verbosity=0,
        )
        thresholds_first = Threshold.objects.filter(timeseries=self.test_ts1)
        self.assertEqual(thresholds_first.count(), 1)
        self.assertEqual(thresholds_first.first().upper, Decimal("3.1415"))
        self.assertEqual(thresholds_first.first().kind, "PI")
        frequencies_first = Frequency.objects.filter(timeseries=self.test_ts1)
        self.assertEqual(frequencies_first.count(), 1)
        self.assertEqual(frequencies_first.first().minutes, Decimal("123456"))
        self.assertEqual(frequencies_first.first().protocol_id, "counting")

        thresholds_second = Threshold.objects.filter(timeseries=self.test_ts2)
        self.assertEqual(thresholds_second.count(), 1)
        self.assertEqual(thresholds_second.first().upper, Decimal("3.1415"))
        self.assertEqual(thresholds_second.first().kind, "PI")
        frequencies_second = Frequency.objects.filter(timeseries=self.test_ts2)
        self.assertEqual(frequencies_second.count(), 1)
        self.assertEqual(frequencies_second.first().minutes, Decimal("123456"))
        self.assertEqual(frequencies_second.first().protocol_id, "counting")

    def tearDown(self):
        super().tearDown()
        self.tmp_file.unlink()
        self.tmp_file_expanded.unlink()

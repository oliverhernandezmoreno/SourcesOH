import datetime
import decimal
import random
import secrets

from django.utils import timezone

from etl.models import ETLOperation
from etl.tests.base import ETLBase
from targets.models import Timeseries


class DirectETLTestCase(ETLBase):

    def setUp(self):
        self.timeseries = [
            Timeseries.objects.create(
                name="Fooooooo test test direct ETL",
                canonical_name=f"direct-etl-test-variable-{index}-{secrets.token_urlsafe(8)}",
                target=self.target_object,
            )
            for index in range(5)
        ]

    def test_direct(self):
        now = timezone.now()
        raw_events = [
            {
                # apply rounding according to the model field
                "value": float(decimal.Decimal(random.random()).quantize(decimal.Decimal("1.00000000"))),
                "name": ts.canonical_name,
                "timestamp": (now - datetime.timedelta(days=index)).isoformat(),
                "meta": {"something": "here"},
            }
            for ts in self.timeseries
            for index in range(10)
        ]
        operation = ETLOperation.start(
            "direct",
            self.superuser_object,
            self.target_object,
            None,
            {"events": raw_events},
        )
        assert not operation.finished, f"Operation finished before delivery: {operation.errors}"
        operation.deliver()
        self.assertEqual(operation.state, ETLOperation.ETLState.SUCCESS)
        for ts in self.timeseries:
            self.assertEqual(
                [event["value"] for event in ts.events],
                [event["value"] for event in raw_events if event["name"] == ts.canonical_name],
            )
        assert all(
            event.get("meta", {}).get("something") == "here"
            for ts in self.timeseries
            for event in ts.events
        ), "metadata wasn't correctly set"

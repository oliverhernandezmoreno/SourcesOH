import decimal
import random
import secrets

from django.urls import reverse

from api.tests.base import BaseTestCase
from targets import elastic
from targets.models import Timeseries, Threshold


class StatusViewTestCase(BaseTestCase):

    def setUp(self):
        # create fake profiles
        from targets.profiling import FOREST
        from targets.profiling.base import Node
        template_below = f"test-below-{secrets.token_urlsafe(6)}"
        FOREST[template_below] = Node(
            name="Test for timeseries below threshold",
            type="raw",
            canonical_name=template_below,
            category=("test-common-group", "test-group-below-threshold",),
            inputs=[],
        )
        template_above = f"test-above-{secrets.token_urlsafe(6)}"
        FOREST[template_above] = Node(
            name="Test for timeseries above threshold",
            type="raw",
            canonical_name=template_above,
            category=("test-common-group", "test-group-above-threshold",),
            inputs=[],
        )
        template_empty = f"test-empty-{secrets.token_urlsafe(6)}"
        FOREST[template_empty] = Node(
            name="Test for timeseries without data",
            type="raw",
            canonical_name=template_empty,
            category=("test-common-group", "test-group-empty",),
            inputs=[],
        )
        # create timeseries for "below"
        self.timeseries_below = [
            self.create_timeseries(template_below, lt=10)
            for _ in range(20)
        ]
        self.timeseries_above = [
            *(self.create_timeseries(template_above, gt=15) for _ in range(20)),
            self.create_timeseries(template_above, lt=15)  # "noise"
        ]
        self.timeseries_empty = [
            self.create_timeseries(template_empty)
            for _ in range(20)
        ]

    def create_timeseries(self, template_name, lt=None, gt=None):
        threshold = lt if lt is not None else gt
        ts = Timeseries.objects.create(
            target=self.target_object,
            name=f"Test-{secrets.token_urlsafe(6)}",
            template_name=template_name,
            canonical_name=f"test-{secrets.token_urlsafe(6)}",
            type="raw"
        )
        if lt is None and gt is None:
            return ts
        Threshold.objects.create(
            upper=decimal.Decimal(threshold),
            timeseries=ts
        )
        elastic.bulk_index([
            ts.as_event((-1 if lt is not None else 1) * random.random() + threshold)
            for _ in range(10)
        ], refresh="true")
        return ts

    def url(self):
        return reverse(
            'public:status-list',
            kwargs=dict(target_canonical_name=self.target)
        )

    def test_no_group_yields_204(self):
        response = self.client_get(self.url())
        self.assertResponseStatus(204, response)

    def test_unmatched_group_yields_empty_status(self):
        response = self.client_get(self.url(), {"group": "this-wont-match"})
        self.assertResponseOk(response)
        self.assertEqual(response.data.get("result_state", {}).get("level"), 0)
        self.assertEqual(len(response.data.get("status", [])), 0)

    def test_no_data(self):
        response = self.client_get(self.url(), {"group": "test-group-empty"})
        self.assertResponseOk(response)
        self.assertEqual(response.data.get("result_state", {}).get("level"), 0)
        self.assertEqual(len(response.data.get("status", [])), len(self.timeseries_empty))

    def test_data_below_threshold(self):
        response = self.client_get(self.url(), {"group": "test-group-below-threshold"})
        self.assertResponseOk(response)
        self.assertEqual(response.data.get("result_state", {}).get("level"), 1)
        self.assertEqual(len(response.data.get("status", [])), len(self.timeseries_below))

    def test_data_above_threshold(self):
        response = self.client_get(self.url(), {"group": "test-group-above-threshold"})
        self.assertResponseOk(response)
        self.assertEqual(response.data.get("result_state", {}).get("level"), 3)
        self.assertEqual(len(response.data.get("status", [])), len(self.timeseries_above))

    def test_common_group(self):
        response = self.client_get(self.url(), {"group": "test-common-group"})
        self.assertResponseOk(response)
        self.assertEqual(response.data.get("result_state", {}).get("level"), 3)
        self.assertEqual(
            len(response.data.get("status", [])),
            len(self.timeseries_below) +
            len(self.timeseries_above) +
            len(self.timeseries_empty)
        )

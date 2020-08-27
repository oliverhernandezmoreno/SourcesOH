import secrets
from unittest.mock import patch

from django.urls import reverse
from django.utils import timezone

from api.tests.base import BaseTestCase
from remotes.models import Remote, EventTraceRequest
from targets import elastic
from targets.models import Timeseries


class BaseEventTestCase(BaseTestCase):

    def setUp(self):
        self.input1 = Timeseries.objects.create(
            target=self.target_object,
            name="Test input 1",
            canonical_name=f"test-input-1-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
        )
        self.input2 = Timeseries.objects.create(
            target=self.target_object,
            name="Test input 2",
            canonical_name=f"test-input-2-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            data_source=self.target_object.data_sources.first(),
            data_source_group=self.target_object.data_source_groups.first(),
        )
        self.timeseries = Timeseries.objects.create(
            target=self.target_object,
            name="Test timeseries",
            canonical_name=f"test-derivation-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
        )
        self.timeseries.inputs.set([self.input1, self.input2])
        self.as_superuser()
        self.head_event = {
            "_id": f"first-event-for-{self.timeseries.canonical_name}",
            "name": self.timeseries.canonical_name,
            "value": 3.1415,
            "@timestamp": "2000-01-01T01:00:00Z",
            "labels": [{
                "key": "message-id",
                "value": "first-test-message",
            }],
            "dependencies": [
                f"first-event-for-{self.input1.canonical_name}",
                f"second-event-for-{self.input1.canonical_name}",
                f"first-event-for-{self.input2.canonical_name}",
            ],
        }
        self.incomplete_event = {
            "_id": f"second-event-for-{self.timeseries.canonical_name}",
            "name": self.timeseries.canonical_name,
            "value": 2.7182,
            "@timestamp": "2001-01-01T01:00:00Z",
            "labels": [{
                "key": "message-id-2",
                "value": "second-test-message",
            }],
            "dependencies": [
                f"first-event-for-{self.input1.canonical_name}",
                f"second-event-for-{self.input1.canonical_name}",
                f"non-existent-event-for-{self.input2.canonical_name}",
            ],
        }
        self.remote = Remote.objects.create(
            namespace=f"test-namespace-{secrets.token_urlsafe(8)}",
            exchange=f"test-exchange-{secrets.token_urlsafe(8)}",
            bucket=f"test-bucket-{secrets.token_urlsafe(8)}",
            last_seen=timezone.now(),
        )
        self.remote.targets.set([self.target_object])

    def create_fake_events(self):
        elastic.bulk_index([
            {
                "_id": f"first-event-for-{self.input1.canonical_name}",
                "name": self.input1.canonical_name,
                "value": 3.1415,
                "@timestamp": "2000-01-01T01:00:00Z",
                "labels": [{
                    "key": "message-id",
                    "value": "first-test-message",
                }],
            },
            {
                "_id": f"second-event-for-{self.input1.canonical_name}",
                "name": self.input1.canonical_name,
                "value": 3.1415,
                "@timestamp": "2000-01-01T01:00:00Z",
                "labels": [{
                    "key": "message-id",
                    "value": "second-test-message",
                }],
            },
            {
                "_id": f"first-event-for-{self.input2.canonical_name}",
                "name": self.input2.canonical_name,
                "value": 3.1415,
                "@timestamp": "2000-01-01T01:00:00Z",
                "labels": [{
                    "key": "message-id",
                    "value": "first-test-message",
                }],
            },
            self.head_event,
            self.incomplete_event,
        ], refresh="true")


class NestedEventTestCase(BaseEventTestCase):

    def test_coverage_artifacts(self):
        self.create_fake_events()
        head = self.head_event['_id']
        url = reverse(
            f"{self.api_version}:target-timeseries-event-detail",
            kwargs={
                "target_canonical_name": self.target,
                "timeseries_canonical_name": self.timeseries.canonical_name,
                "_id": head,
            },
        )
        response = self.client_get(url)
        self.assertResponseOk(response)
        expected_trace = frozenset((
            f"first-event-for-{self.input1.canonical_name}",
            f"second-event-for-{self.input1.canonical_name}",
            f"first-event-for-{self.input2.canonical_name}",
        ))
        self.assertEqual(
            frozenset(e["_id"] for e in response.data.get("trace", [])),
            expected_trace,
        )
        self.assertEqual(
            frozenset(e["_id"] for e in response.data.get("message", [])),
            frozenset(id_ for id_ in expected_trace if id_.startswith("first-")) |
            frozenset((head,)),
        )
        self.assertEqual(
            frozenset(e["_id"] for e in response.data.get("coverage", [])),
            expected_trace | frozenset((head,)),
        )

    def test_trace_graph(self):
        self.create_fake_events()
        url = reverse(
            f"{self.api_version}:target-timeseries-event-trace-graph",
            kwargs={
                "target_canonical_name": self.target,
                "timeseries_canonical_name": self.timeseries.canonical_name,
                "_id": self.head_event['_id'],
            },
        )
        response = self.client_get(url)
        self.assertResponseOk(response)

    def test_message_graph(self):
        self.create_fake_events()
        url = reverse(
            f"{self.api_version}:target-timeseries-event-message-graph",
            kwargs={
                "target_canonical_name": self.target,
                "timeseries_canonical_name": self.timeseries.canonical_name,
                "_id": self.head_event['_id'],
            },
        )
        response = self.client_get(url)
        self.assertResponseOk(response)

    def test_coverage_graph(self):
        self.create_fake_events()
        url = reverse(
            f"{self.api_version}:target-timeseries-event-coverage-graph",
            kwargs={
                "target_canonical_name": self.target,
                "timeseries_canonical_name": self.timeseries.canonical_name,
                "_id": self.head_event['_id'],
            },
        )
        response = self.client_get(url)
        self.assertResponseOk(response)

    def test_trace(self):
        self.create_fake_events()
        with self.subTest('successful trace build'):
            url = reverse(
                f"{self.api_version}:target-timeseries-event-trace",
                kwargs={
                    "target_canonical_name": self.target,
                    "timeseries_canonical_name": self.timeseries.canonical_name,
                    "_id": self.head_event['_id'],
                },
            )
            response = self.client_get(url)
            self.assertResponseOk(response)
            canonical_names = [
                self.input1.canonical_name,
                self.input2.canonical_name
            ]
            event_ids = self.head_event['dependencies']
            count = 0
            self.assertFalse(response.data['errors'])
            for t in response.data['trace']:
                self.assertIn(t['canonical_name'], canonical_names)
                for e in t['events']:
                    self.assertIn(e['_id'], event_ids)
                count += len(t['events'])
            self.assertEqual(len(event_ids), count)

        with self.subTest('missing event from dependencies'):
            url = reverse(
                f"{self.api_version}:target-timeseries-event-trace",
                kwargs={
                    "target_canonical_name": self.target,
                    "timeseries_canonical_name": self.timeseries.canonical_name,
                    "_id": self.incomplete_event['_id'],
                },
            )
            response = self.client_get(url)
            self.assertResponseOk(response)
            self.assertTrue(response.data['errors'])
            self.assertTrue(response.data['errors']['dependencies'])

    @patch('api.v1.views.event_views.send_simple_message')
    def test_trace_request(self, mock_ssm):
        self.create_fake_events()
        url_kwargs = {
            "target_canonical_name": self.target,
            "timeseries_canonical_name": self.timeseries.canonical_name,
            "_id": self.head_event['_id'],
        }
        url = reverse(
            f"{self.api_version}:target-timeseries-event-trace-request",
            kwargs=url_kwargs,
        )
        self.assertFalse(EventTraceRequest.objects.filter(event_id=self.head_event['_id']).exists())
        response = self.client_post(url)
        self.assertResponseOk(response)
        self.assertTrue(EventTraceRequest.objects.filter(event_id=self.head_event['_id']).exists())
        trace_request = EventTraceRequest.objects.filter(event_id=self.head_event['_id']).first()
        mock_ssm.assert_called_once()
        mock_ssm.assert_called_with(
            command='remote.event.trace.request',
            body={
                "event_id": self.head_event['_id'],
                "request_id": trace_request.id,
                "timeseries_canonical_name": self.timeseries.canonical_name
            },
            exchange=self.remote.exchange
        )

        with self.subTest('created request is listed in trace'):
            url = reverse(
                f"{self.api_version}:target-timeseries-event-trace",
                kwargs=url_kwargs,
            )
            response = self.client_get(url)
            self.assertResponseOk(response)
            self.assertEqual(len(response.data['requests']), 1)
            self.assertEqual(response.data['requests'][0]['id'], trace_request.id)

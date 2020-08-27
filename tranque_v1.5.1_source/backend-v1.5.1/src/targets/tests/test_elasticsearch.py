import datetime
from functools import reduce
import secrets

from django.test import TestCase

from targets import elastic


class TestElasticSearch(TestCase):

    def test_index_search(self):
        value = 3000
        data = {
            "@timestamp": datetime.datetime.now().isoformat(),
            "name": "foo.bar",
            "value": value,
            "labels": [{"key": "some", "value": "random label"}],
        }
        elastic.index(data, refresh="true")
        response = elastic.search(elastic.Search().filter_by_name("foo.bar")[:1]).hits[0]
        self.assertEqual(response["value"], value)

    def test_bulk_index_msearch(self):
        values = [3000, 4000, 5000]
        docs = [{
            "@timestamp": datetime.datetime.now().isoformat(),
            "name": f"foo.bar.{index}",
            "value": value,
            "labels": [{"key": "care", "value": "I do not"}],
        } for index, value in enumerate(values)]
        elastic.bulk_index(docs, refresh="true")
        responses = elastic.msearch([
            elastic.Search().filter_by_name(f"foo.bar.{index}")[:1]
            for index, _ in enumerate(values)
        ])
        for response, value in zip(responses, values):
            self.assertEqual(response.hits[0]["value"], value)

    def test_bulk_index_scan(self):
        # test 30k events, since the limit on elasticsearch is 10k
        # the scan should be able to fetch the 30k events anyway
        now = datetime.datetime.now().isoformat()
        elastic.bulk_index([
            {
                "@timestamp": now,
                "name": "foo.bar.large",
                "value": 1,
                "labels": []
            }
            for _ in range(30000)
        ], refresh="true")
        events = elastic.scan(elastic.Search().filter_by_name("foo.bar.large")[:1000])
        self.assertEqual(reduce(lambda s, _: s + 1, events, 0), 30000)

    def test_label_filter(self):
        def event_with_label(*keyvalues):
            return {
                "_id": secrets.token_urlsafe(16),
                "@timestamp": datetime.datetime.now().isoformat(),
                "name": f"test-for-filtering-{secrets.token_urlsafe(8)}",
                "value": 3.1415,
                "labels": [
                    {"key": keyvalues[i], "value": keyvalues[i + 1]}
                    for i in range(0, len(keyvalues), 2)
                ],
            }

        events = [
            event_with_label("foobar", "value1:suffix1"),
            event_with_label("foobar", "value2:suffix1", "foobaz", "value1:suffix1"),
            event_with_label("foobaz", "value1:suffix1"),
            event_with_label("foobar", "value1:suffix2"),
        ]
        elastic.bulk_index(events, refresh="true")

        hits1 = elastic.search(elastic.Search().filter_by_label("foobar", "value1:suffix1")).hits
        self.assertEqual(
            frozenset(e["_id"] for e in hits1),
            frozenset(e["_id"] for e in (events[0],)),
        )

        hits2 = elastic.search(elastic.Search().filter_by_label_regexp("foobar", "value1:.*")).hits
        self.assertEqual(
            frozenset(e["_id"] for e in hits2),
            frozenset(e["_id"] for e in (events[0], events[3])),
        )

        hits3 = elastic.search(elastic.Search().filter_by_label_regexp("foobar", ".*:suffix1")).hits
        self.assertEqual(
            frozenset(e["_id"] for e in hits3),
            frozenset(e["_id"] for e in (events[0], events[1])),
        )

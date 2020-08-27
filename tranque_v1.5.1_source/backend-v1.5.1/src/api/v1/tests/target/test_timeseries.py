import random
import secrets
from unittest import mock

from django.conf import settings
from django.urls import reverse
from rest_framework import status

from api.tests.base import BaseTestCase
from api.v1.serializers.target_serializers import TimeseriesMessageSerializer
from targets import elastic
from targets.models import Target, Timeseries
from targets.profiling import get_nodes_by


class TimeseriesTestCase(BaseTestCase):
    def setUp(self):
        self.as_superuser()

    def test_filter_list_with_template_category(self):
        Target.objects.get(canonical_name=self.target).apply_manifest('fake')
        Target.objects.get(canonical_name='los-pimientos-1').apply_manifest('fake')
        Target.objects.get(canonical_name='los-pimientos-2').apply_manifest('fake')

        templates = [n.value.canonical_name for n in get_nodes_by('category', 'fake-index')]
        url = reverse(f'{self.api_version}:timeseries-list')

        # fake-index should generate 2 timeseries for each target (by
        # definition of fake test-profile), but should self-prune one
        # of them for non-instrumented targets
        response = self.client.get(url, {'template_category': 'fake-index'}, format='json')
        self.assertResponseStatus(status.HTTP_200_OK, response)
        self.assertEqual(response.data['count'], 2 * 3 - 2)
        for t in response.data['results']:
            self.assertIn(t['template_name'], templates)

    def test_filter_list_with_canonical_name_list(self):
        t1 = Timeseries.objects.create(
            target=self.target_object,
            canonical_name=f"test-1-{secrets.token_urlsafe(6)}",
        )
        t2 = Timeseries.objects.create(
            target=self.target_object,
            canonical_name=f"test-2-{secrets.token_urlsafe(6)}",
        )
        # Create an extra timeseries that won't be found
        Timeseries.objects.create(
            target=self.target_object,
            canonical_name=f"test-3-{secrets.token_urlsafe(6)}",
        )
        url = reverse(f'{self.api_version}:timeseries-list')
        # get only the first two
        response = self.client_get(url, {'canonical_name__in': ",".join([t.canonical_name for t in (t1, t2)])})
        self.assertResponseOk(response)
        self.assertEqual(response.data['count'], 2)
        self.assertEqual(
            set(t['id'] for t in response.data['results']),
            set(t.id for t in (t1, t2))
        )


class NestedTimeseriesTestCase(BaseTestCase):

    @classmethod
    def setUpTestData(cls):
        # get test target and a random target to create timeseries
        # targets where loaded in test runner (api.test.base.TestRunner) setup
        cls.test_target = Target.objects.get(canonical_name=cls.target)
        cls.random_target = Target.objects.get(canonical_name='los-pimientos-1')
        cls.empty_target = Target.objects.get(canonical_name='los-pimientos-2')
        # target timeseries
        cls.mA_count = 10
        cls.test_count = random.randint(20, 40)
        cls.random_count = random.randint(20, 40)

        timeseries = [
            *(
                Timeseries(
                    name=f'timeseries{i}',
                    canonical_name=f'{cls.test_target.canonical_name}.test.mA.timeseries{i}',
                    target=cls.test_target
                ) for i in range(cls.mA_count)
            ),
            *(
                Timeseries(
                    name=f'timeseries{i}',
                    canonical_name=f'{cls.test_target.canonical_name}.test.mB.timeseries{i}',
                    target=cls.test_target
                ) for i in range(cls.mA_count, cls.test_count)
            ),
            *(
                Timeseries(
                    name=f'timeseries{i}',
                    canonical_name=f'{cls.random_target.canonical_name}.test.mA.timeseries{i}',
                    target=cls.random_target
                ) for i in range(cls.random_count)
            )
        ]

        Timeseries.objects.bulk_create(timeseries)
        cls.test_timeseries = Timeseries.objects.get(canonical_name=timeseries[0].canonical_name)

    def setUp(self):
        # TODO add a 'minera' user when permissions are implemented
        self.as_superuser()

    def test_list_target_timeseries(self):
        with self.subTest('list target with multiple timeseries'):
            url = reverse(f'{self.api_version}:target-timeseries-list', args=[self.test_target.canonical_name])

            response = self.client.get(url, format='json')

            self.assertResponseOk(response)
            self.assertResponseStatus(status.HTTP_200_OK, response)

            self.assertEqual(response.data['count'], self.test_count)

            for x in response.data['results']:
                self.assertTrue(self.test_target.canonical_name in x['canonical_name'])

        with self.subTest('list target with zero timeseries'):
            url = reverse(f'{self.api_version}:target-timeseries-list', args=[self.empty_target.canonical_name])

            response = self.client.get(url, format='json')

            self.assertResponseOk(response)
            self.assertResponseStatus(status.HTTP_200_OK, response)

            self.assertEqual(response.data['count'], 0)

    def test_filtered_list_target_timeseries(self):
        with self.subTest('filter partial canonical name'):
            url = reverse(f'{self.api_version}:target-timeseries-list', args=[self.test_target.canonical_name])

            # timeseries1, timeseries10, 11, ..., 19
            # 11 in total
            response = self.client.get(url, {'canonical_name': 'timeseries1'}, format='json')

            self.assertResponseOk(response)
            self.assertResponseStatus(status.HTTP_200_OK, response)
            self.assertEqual(response.data['count'], 11)

        with self.subTest('filter partial canonical name with special character (dots)'):
            url = reverse(f'{self.api_version}:target-timeseries-list', args=[self.test_target.canonical_name])

            # mA.timeseries0, mA.timeseries1, ..., mA.timeseries9
            # 10 in total
            response = self.client.get(url, {'canonical_name': 'mA.timeseries'}, format='json')

            self.assertResponseOk(response)
            self.assertResponseStatus(status.HTTP_200_OK, response)
            self.assertEqual(response.data['count'], 10)

    # mock get_events from Timeseries model
    @mock.patch('targets.models.Timeseries.get_events')
    def test_retrieve_event_count(self, getevents):
        url = reverse(f'{self.api_version}:target-timeseries-detail',
                      args=[self.test_target.canonical_name, self.test_timeseries.canonical_name])

        with self.subTest('retrieve with default config (no events)'):
            # set default empty get_events response
            getevents.reset_mock()
            getevents.return_value = []

            response = self.client.get(url, format='json')

            self.assertResponseOk(response)
            self.assertResponseStatus(status.HTTP_200_OK, response)
            # default config should call this with (from_=0, size=0)
            getevents.assert_called_once_with(0, 0)
            # response should contain no events
            self.assertEqual(len(response.data['events']), 0)

        with self.subTest('retrieve with wrong max_events value'):
            # set get_events to return 5 objects
            getevents.reset_mock()
            getevents.return_value = [
                {'event': 1},
                {'event': 2},
                {'event': 3},
                {'event': 4},
                {'event': 5}
            ]

            response = self.client.get(url, {'max_events': 5}, format='json')

            self.assertResponseOk(response)
            self.assertResponseStatus(status.HTTP_200_OK, response)

            # mock get_events should be called with (from_=0, size=5)
            getevents.assert_called_once_with(0, 5)

            # response should contain 5 events
            self.assertEqual(len(response.data['events']), 5)

        with self.subTest('retrieve with invalid value for max_events'):
            getevents.reset_mock()
            response = self.client.get(url, {'max_events': 'random_string'}, format='json')
            self.assertResponseStatus(status.HTTP_400_BAD_REQUEST, response)
            getevents.assert_not_called()

        with self.subTest('retrieve spacial timeseries are grouped by timestamp'):
            # TODO implement this
            pass

    def test_retrieve_timeseries_aggregation(self):
        # Timeserie setup
        aggregation_ts = Timeseries.objects.create(
            name=f'Aggregation test series',
            canonical_name=f'{self.test_target.canonical_name}.test.aggregation',
            target=self.test_target,
            type=Timeseries.TimeseriesType.TEST
        )
        # Add data for 4 8hours intervals
        # 1) 17/16:00-23:59 with 3 events, max value = 10
        # 2) 18/00:00-07:59 with 2 events, max value = 3
        # 3) 18/08:00-15:59 empty
        # 4) 18/16:00-23:59 with 4 events, max value = 9
        elastic.bulk_index([
            # 1
            {
                '@timestamp': '2017-05-17T16:53:00.000Z',
                'name': aggregation_ts.canonical_name,
                'value': 1,
                'labels': []
            },
            {
                '@timestamp': '2017-05-17T17:43:23.000Z',
                'name': aggregation_ts.canonical_name,
                'value': 10,
                'labels': []
            },
            {
                '@timestamp': '2017-05-17T23:43:00.000Z',
                'name': aggregation_ts.canonical_name,
                'value': -4,
                'labels': []
            },
            # 2
            {
                '@timestamp': '2017-05-18T00:00:00.000Z',
                'name': aggregation_ts.canonical_name,
                'value': 3,
                'labels': []
            },
            {
                '@timestamp': '2017-05-18T05:20:12.000Z',
                'name': aggregation_ts.canonical_name,
                'value': -6,
                'labels': []
            },
            # 3
            # no events
            # 4
            {
                '@timestamp': '2017-05-18T16:20:00.000Z',
                'name': aggregation_ts.canonical_name,
                'value': 1,
                'labels': []
            },
            {
                '@timestamp': '2017-05-18T18:16:00.000Z',
                'name': aggregation_ts.canonical_name,
                'value': 2,
                'labels': []
            },
            {
                '@timestamp': '2017-05-18T20:19:00.000Z',
                'name': aggregation_ts.canonical_name,
                'value': 5,
                'labels': []
            },
            {
                '@timestamp': '2017-05-18T21:30:00.000Z',
                'name': aggregation_ts.canonical_name,
                'value': 9,
                'labels': []
            },
        ], refresh='true')

        url = reverse(f'{self.api_version}:target-timeseries-aggregation',
                      args=[self.test_target.canonical_name, aggregation_ts.canonical_name])

        with self.subTest('test query params required'):
            response = self.client.get(url, format='json')
            self.assertResponseStatus(status.HTTP_400_BAD_REQUEST, response)

        with self.subTest('test max aggregation'):
            with self.subTest('test max only for non spacial timeseries'):
                # TODO implement this
                pass

            with self.subTest('test max with default params'):
                response = self.client.get(url, {'aggregation_type': 'max', 'interval': '8h'}, format='json')
                self.assertResponseOk(response)

                # response should contain all 4 intervals defined in setup
                results = response.data['results']
                self.assertEqual(len(results), 4)
                self.assertEqual(results[0]['@timestamp'], '2017-05-17T16:00:00.000Z')
                self.assertEqual(results[0]['value'], 10)
                self.assertEqual(results[1]['@timestamp'], '2017-05-18T00:00:00.000Z')
                self.assertEqual(results[1]['value'], 3)
                self.assertEqual(results[2]['@timestamp'], '2017-05-18T08:00:00.000Z')
                self.assertIsNone(results[2]['value'])
                self.assertEqual(results[3]['@timestamp'], '2017-05-18T16:00:00.000Z')
                self.assertEqual(results[3]['value'], 9)

            with self.subTest('test max with date_from'):
                response = self.client.get(url, {'aggregation_type': 'max',
                                                 'interval': '8h',
                                                 'date_from': '2017-05-18T01:00:00.000Z'},
                                           format='json')
                self.assertResponseOk(response)

                # response should not contain the firt interval defined in setup
                results = response.data['results']
                self.assertEqual(len(results), 3)
                self.assertEqual(results[0]['@timestamp'], '2017-05-18T00:00:00.000Z')
                self.assertEqual(results[1]['@timestamp'], '2017-05-18T08:00:00.000Z')
                self.assertEqual(results[2]['@timestamp'], '2017-05-18T16:00:00.000Z')

            with self.subTest('test max with date_to'):
                response = self.client.get(url, {'aggregation_type': 'max',
                                                 'interval': '8h',
                                                 'date_to': '2017-05-18T15:00:00.000Z'},
                                           format='json')
                self.assertResponseOk(response)

                # response should contain only the first two intervals defined in setup
                # forth interval ignored because outside of range
                # third interval ignored because no events and no next interval
                results = response.data['results']
                self.assertEqual(len(results), 2)
                self.assertEqual(results[0]['@timestamp'], '2017-05-17T16:00:00.000Z')
                self.assertEqual(results[1]['@timestamp'], '2017-05-18T00:00:00.000Z')

            with self.subTest('test max with date_from and date_to'):
                response = self.client.get(url, {'aggregation_type': 'max',
                                                 'interval': '8h',
                                                 'date_from': '2017-05-18T01:00:00.000Z',
                                                 'date_to': '2017-05-18T15:00:00.000Z'}, format='json')
                self.assertResponseOk(response)

                # response should contain only one interval defined in setup
                # first interval ignored because before date_from
                # third interval ignored because no events and no next interval
                # forth interval ignored because after date_to
                results = response.data['results']
                self.assertEqual(len(results), 1)
                self.assertEqual(results[0]['@timestamp'], '2017-05-18T00:00:00.000Z')

            with self.subTest('test max with not default interval'):
                response = self.client.get(url, {'aggregation_type': 'max', 'interval': '12h'}, format='json')
                self.assertResponseOk(response)

                # response should contain two intervals
                # 1) 17/12:00-23:59 max value = 10
                # 2) 18/00:00-11:59 max value = 3
                # 2) 18/12:00-11:59 max value = 9
                results = response.data['results']
                self.assertEqual(len(results), 3)
                self.assertEqual(results[0]['@timestamp'], '2017-05-17T12:00:00.000Z')
                self.assertEqual(results[0]['value'], 10)
                self.assertEqual(results[1]['@timestamp'], '2017-05-18T00:00:00.000Z')
                self.assertEqual(results[1]['value'], 3)
                self.assertEqual(results[2]['@timestamp'], '2017-05-18T12:00:00.000Z')
                self.assertEqual(results[2]['value'], 9)

        with self.subTest('test min aggregation'):
            with self.subTest('test min with default params'):
                response = self.client.get(url, {'aggregation_type': 'min', 'interval': '8h'}, format='json')
                self.assertResponseOk(response)

                # response should contain all 4 intervals defined in setup
                results = response.data['results']
                self.assertEqual(len(results), 4)
                self.assertEqual(results[0]['@timestamp'], '2017-05-17T16:00:00.000Z')
                self.assertEqual(results[0]['value'], -4)
                self.assertEqual(results[1]['@timestamp'], '2017-05-18T00:00:00.000Z')
                self.assertEqual(results[1]['value'], -6)
                self.assertEqual(results[2]['@timestamp'], '2017-05-18T08:00:00.000Z')
                self.assertIsNone(results[2]['value'])
                self.assertEqual(results[3]['@timestamp'], '2017-05-18T16:00:00.000Z')
                self.assertEqual(results[3]['value'], 1)

        with self.subTest('test last aggregation'):
            with self.subTest('test last with default params'):
                response = self.client.get(url, {'aggregation_type': 'last', 'interval': '8h'}, format='json')
                self.assertResponseOk(response)

                # response should contain all 4 intervals defined in setup
                results = response.data['results']
                self.assertEqual(len(results), 4)
                self.assertEqual(results[0]['@timestamp'], '2017-05-17T23:43:00.000Z')
                self.assertEqual(results[0]['value'], -4)
                self.assertEqual(results[1]['@timestamp'], '2017-05-18T05:20:12.000Z')
                self.assertEqual(results[1]['value'], -6)
                self.assertEqual(results[2]['@timestamp'], '2017-05-18T08:00:00.000Z')
                self.assertIsNone(results[2]['value'])
                self.assertEqual(results[3]['@timestamp'], '2017-05-18T21:30:00.000Z')
                self.assertEqual(results[3]['value'], 9)

            with self.subTest('test last with date_from'):
                response = self.client.get(url, {'aggregation_type': 'last',
                                                 'interval': '8h',
                                                 'date_from': '2017-05-18T01:00:00.000Z'},
                                           format='json')
                self.assertResponseOk(response)

                # response should not contain the firt interval defined in setup
                results = response.data['results']
                self.assertEqual(len(results), 3)
                self.assertEqual(results[0]['@timestamp'], '2017-05-18T05:20:12.000Z')
                self.assertEqual(results[1]['@timestamp'], '2017-05-18T08:00:00.000Z')
                self.assertEqual(results[2]['@timestamp'], '2017-05-18T21:30:00.000Z')

            with self.subTest('test last with date_to'):
                response = self.client.get(url, {'aggregation_type': 'last',
                                                 'interval': '8h',
                                                 'date_to': '2017-05-18T15:00:00.000Z'},
                                           format='json')
                self.assertResponseOk(response)

                # response should contain only the first two intervals defined in setup
                # forth interval ignored because outside of range
                # third interval ignored because no events and no next interval
                results = response.data['results']
                self.assertEqual(len(results), 2)
                self.assertEqual(results[0]['@timestamp'], '2017-05-17T23:43:00.000Z')
                self.assertEqual(results[1]['@timestamp'], '2017-05-18T05:20:12.000Z')

            with self.subTest('test last with date_from and date_to'):
                response = self.client.get(url, {'aggregation_type': 'last',
                                                 'interval': '8h',
                                                 'date_from': '2017-05-18T01:00:00.000Z',
                                                 'date_to': '2017-05-18T15:00:00.000Z'}, format='json')
                self.assertResponseOk(response)

                # response should contain only one interval defined in setup
                # first interval ignored because before date_from
                # third interval ignored because no events and no next interval
                # forth interval ignored because after date_to
                results = response.data['results']
                self.assertEqual(len(results), 1)
                self.assertEqual(results[0]['@timestamp'], '2017-05-18T05:20:12.000Z')

            with self.subTest('test last with not default interval'):
                response = self.client.get(url, {'aggregation_type': 'last', 'interval': '12h'}, format='json')
                self.assertResponseOk(response)

                # response should contain three intervals
                # 1) 17/12:00-23:59
                # 2) 18/00:00-11:59
                # 2) 18/12:00-23:59
                results = response.data['results']
                self.assertEqual(len(results), 3)
                self.assertEqual(results[0]['@timestamp'], '2017-05-17T23:43:00.000Z')
                self.assertEqual(results[0]['value'], -4)
                self.assertEqual(results[1]['@timestamp'], '2017-05-18T05:20:12.000Z')
                self.assertEqual(results[1]['value'], -6)
                self.assertEqual(results[2]['@timestamp'], '2017-05-18T21:30:00.000Z')
                self.assertEqual(results[2]['value'], 9)

            with self.subTest('test last spacial timeseries response has last values grouped by timestamp'):
                # TODO implement this
                pass

        with self.subTest('test sample aggregation'):
            with self.subTest('test sample with default params'):
                response = self.client.get(url, {'aggregation_type': 'sample', 'interval': '8h'}, format='json')
                self.assertResponseOk(response)

                intervals = {
                    '2017-05-17T16:00:00.000Z',
                    '2017-05-18T00:00:00.000Z',
                    '2017-05-18T08:00:00.000Z',
                    '2017-05-18T16:00:00.000Z'
                }

                results = response.data['results']
                # dates should match the beginning of each interval
                self.assertEqual(set(r['@timestamp'] for r in results), intervals)
                # each time interval has at most 5 values
                for interval in intervals:
                    bucket = [r for r in results if r['@timestamp'] == interval]
                    self.assertLessEqual(len(bucket), 5)
                    self.assertGreater(len(bucket), 0)

            with self.subTest('test sample with not default interval'):
                response = self.client.get(url, {'aggregation_type': 'sample', 'interval': '1M'}, format='json')
                self.assertResponseOk(response)

                # interval contains all data points, so the sample
                # should contain the quintiles only
                results = response.data['results']
                self.assertEqual(len(results), 5)
                for r in results:
                    self.assertEqual(r['@timestamp'], '2017-05-01T00:00:00.000Z')

                self.assertEqual(results[0]['value'], -6)  # the minimum
                self.assertEqual(results[2]['value'], 2)  # the median
                self.assertEqual(results[4]['value'], 10)  # the maximum

        with self.subTest('test aggregation with valid positive offset'):
            response = self.client.get(
                url,
                {'aggregation_type': 'max', 'timezone_offset': '180', 'interval': '1M'},
                format='json',
            )
            self.assertResponseOk(response)
            results = response.data['results']
            self.assertEqual(len(results), 1)
            self.assertEqual(results[0]['@timestamp'], '2017-05-01T03:00:00.000Z')

        with self.subTest('test aggregation with valid negative offset'):
            response = self.client.get(
                url,
                {'aggregation_type': 'max', 'timezone_offset': '-180', 'interval': '1M'},
                format='json',
            )
            self.assertResponseOk(response)
            results = response.data['results']
            self.assertEqual(len(results), 1)
            self.assertEqual(results[0]['@timestamp'], '2017-04-30T21:00:00.000Z')

        with self.subTest('test aggregation with invalid offset'):
            response = self.client.get(
                url,
                {'aggregation_type': 'max', 'timezone_offset': 'foobarbaz', 'interval': '1M'},
                format='json',
            )
            self.assertResponseStatus(400, response)

        with self.subTest('test aggregation with automatic interval'):
            response = self.client.get(url, {'aggregation_type': 'max'}, format='json')
            self.assertResponseOk(response)
            results = response.data['results']
            # result counts may vary, but should be centered around the default setting
            # 9 is the actual amount of events
            expected_quantity = min(9, settings.AGGREGATIONS_DEFAULT_INTERVAL_QUANTITY)
            self.assertIn(len(results), (expected_quantity - 1, expected_quantity, expected_quantity + 1))

        with self.subTest('test aggregation with computed interval length'):
            response = self.client.get(url, {'aggregation_type': 'max', 'intervals': '2'}, format='json')
            self.assertResponseOk(response)
            results = response.data['results']
            self.assertIn(len(results), (1, 2, 3))

    def test_head_request(self):
        name = f"test-series-{secrets.token_urlsafe(6)}"
        data = [
            {
                '@timestamp': '2017-05-17T20:53:00.000Z',
                'name': name,
                'value': 3.1415,
                'labels': [],
            },
            {
                '@timestamp': '2017-05-17T17:43:23.003Z',
                'name': name,
                'value': 0,
                'labels': [],
                'coords': {'y': 10},
            },
            {
                '@timestamp': '2017-05-17T17:43:23.003Z',
                'name': name,
                'value': 2.71828,
                'labels': [],
                'coords': {'y': 9},
            }
        ]
        elastic.bulk_index(data, refresh='true')
        Timeseries.objects.create(
            canonical_name=name,
            name="Test",
            target=self.target_object,
            type=Timeseries.TimeseriesType.TEST
        )
        url = reverse(f'{self.api_version}:target-timeseries-head', args=[self.target, name])

        with self.subTest('default request without parameters'):
            response = self.client_get(url)
            self.assertResponseOk(response)
            self.assertEqual(len(response.data['results']), 1)
            self.assertEqual(response.data['results'][0]['value'], 3.1415)

        with self.subTest('with a too-far-past date_to parameter'):
            response = self.client_get(url, {'date_to': '2000-01-01T00:00:00Z'})
            self.assertResponseOk(response)
            self.assertEqual(len(response.data['results']), 0)

        with self.subTest('with an in-between date_to parameter'):
            response = self.client_get(url, {'date_to': '2017-05-17T18:00:00.000Z'})
            self.assertResponseOk(response)
            self.assertEqual(len(response.data['results']), 2)
            self.assertEqual([e['value'] for e in response.data['results']], [2.71828, 0])

    def test_retrieve_timeseries_with_ranges_aggregation(self):
        data = [
            {
                '@timestamp': '2017-05-17T16:53:00.000Z',
                'name': None,
                'value': 1,
                'labels': []
            },
            {
                '@timestamp': '2017-05-17T17:43:23.000Z',
                'name': None,
                'value': 10,
                'labels': []
            },
            {
                '@timestamp': '2017-05-17T23:43:00.000Z',
                'name': None,
                'value': -3,
                'labels': []
            }
        ]

        with self.subTest('lower range'):
            ts_lower = Timeseries.objects.create(
                name=f'Aggregation test series with lower range',
                canonical_name=f'{self.test_target.canonical_name}.test.lower.aggregation',
                target=self.test_target,
                type=Timeseries.TimeseriesType.TEST,
                range_gte=0
            )
            for x in data:
                x['name'] = ts_lower.canonical_name
            elastic.bulk_index(data, refresh='true')

            url = reverse(f'{self.api_version}:target-timeseries-aggregation',
                          args=[self.test_target.canonical_name, ts_lower.canonical_name])

            # last
            response = self.client.get(url, {'aggregation_type': 'last', 'interval': '8h'}, format='json')
            self.assertResponseOk(response)

            results = response.data['results']
            # only one interval
            self.assertEqual(len(results), 1, str(results))
            self.assertEqual(results[0]['@timestamp'], '2017-05-17T17:43:23.000Z')
            # last value should ignore values < 0
            self.assertEqual(results[0]['value'], 10)

            # max
            response = self.client.get(url, {'aggregation_type': 'max', 'interval': '8h'}, format='json')
            self.assertResponseOk(response)

            results = response.data['results']
            self.assertEqual(len(results), 1)
            self.assertEqual(results[0]['@timestamp'], '2017-05-17T16:00:00.000Z')
            self.assertEqual(results[0]['value'], 10)

        with self.subTest('upper range'):

            ts_upper = Timeseries.objects.create(
                name=f'Aggregation test series with upper range',
                canonical_name=f'{self.test_target.canonical_name}.test.upper.aggregation',
                target=self.test_target,
                type=Timeseries.TimeseriesType.TEST,
                range_lte=0
            )
            for x in data:
                x['name'] = ts_upper.canonical_name
            elastic.bulk_index(data, refresh='true')

            url = reverse(f'{self.api_version}:target-timeseries-aggregation',
                          args=[self.test_target.canonical_name, ts_upper.canonical_name])

            # last
            response = self.client.get(url, {'aggregation_type': 'last', 'interval': '8h'}, format='json')
            self.assertResponseOk(response)

            results = response.data['results']
            # only one interval
            self.assertEqual(len(results), 1)
            self.assertEqual(results[0]['@timestamp'], '2017-05-17T23:43:00.000Z')
            # last value should ignore values > 0
            self.assertEqual(results[0]['value'], -3)

            # max
            response = self.client.get(url, {'aggregation_type': 'max', 'interval': '8h'}, format='json')
            self.assertResponseOk(response)

            results = response.data['results']
            self.assertEqual(len(results), 1)
            self.assertEqual(results[0]['@timestamp'], '2017-05-17T16:00:00.000Z')
            self.assertEqual(results[0]['value'], -3)

        with self.subTest('lower and upper range'):
            ts_upper_and_lower = Timeseries.objects.create(
                name=f'Aggregation test series with lower and upper range',
                canonical_name=f'{self.test_target.canonical_name}.test.lowerandupper.aggregation',
                target=self.test_target,
                type=Timeseries.TimeseriesType.TEST,
                range_gte=0,
                range_lte=5
            )
            for x in data:
                x['name'] = ts_upper_and_lower.canonical_name
            elastic.bulk_index(data, refresh='true')

            url = reverse(f'{self.api_version}:target-timeseries-aggregation',
                          args=[self.test_target.canonical_name, ts_upper_and_lower.canonical_name])

            # last
            response = self.client.get(url, {'aggregation_type': 'last', 'interval': '8h'}, format='json')
            self.assertResponseOk(response)

            results = response.data['results']
            # only one interval
            self.assertEqual(len(results), 1)
            self.assertEqual(results[0]['@timestamp'], '2017-05-17T16:53:00.000Z')
            # last value should ignore values > 0
            self.assertEqual(results[0]['value'], 1)

            # max
            response = self.client.get(url, {'aggregation_type': 'max', 'interval': '8h'}, format='json')
            self.assertResponseOk(response)

            results = response.data['results']
            self.assertEqual(len(results), 1)
            self.assertEqual(results[0]['@timestamp'], '2017-05-17T16:00:00.000Z')
            self.assertEqual(results[0]['value'], 1)

    def test_export_timeseries(self):
        ts_one = Timeseries.objects.create(
            name='Test timeseries one',
            canonical_name=f'{self.test_target.canonical_name}.test.export.one',
            target=self.test_target,
            type=Timeseries.TimeseriesType.TEST,
            range_gte=0
        )
        ts_two = Timeseries.objects.create(
            name='Test timeseries two',
            canonical_name=f'{self.test_target.canonical_name}.test.export.two',
            space_coords='yz',
            target=self.test_target,
            type=Timeseries.TimeseriesType.TEST,
            range_gte=0,
        )
        data = [
            {
                '@timestamp': '2017-05-17T16:53:00.000Z',
                'name': ts_one.canonical_name,
                'value': 1,
                'labels': []
            },
            {
                '@timestamp': '2017-05-17T17:43:23.000Z',
                'name': ts_two.canonical_name,
                'coords': {
                    'y': 100,
                    'z': 200,
                },
                'value': 10,
                'labels': []
            },
            {
                '@timestamp': '2017-05-17T23:43:00.000Z',
                'name': ts_one.canonical_name,
                'value': -3,
                'labels': []
            },
        ]
        elastic.bulk_index(data, refresh='true')
        url = reverse(
            f'{self.api_version}:target-timeseries-export',
            args=[self.test_target.canonical_name],
        )

        with self.subTest('export fails because no timeseries is selected'):
            response = self.client_get(url, {'canonical_name__in': 'f,o,o,b,a,r'})
            self.assertResponseStatus(400, response)
            response = self.client_get(url)
            self.assertResponseStatus(400, response)

        with self.subTest('export succeeds without date parameters'):
            response = self.client_get(url, {
                'canonical_name__in': f'{ts_one.canonical_name},{ts_two.canonical_name}'
            })
            self.assertResponseOk(response)

        with self.subTest('export succeeds with date_to parameter'):
            response = self.client_get(url, {
                'canonical_name__in': f'{ts_one.canonical_name},{ts_two.canonical_name}',
                'date_to': '2017-06-01'
            })
            self.assertResponseOk(response)

        with self.subTest('export succeeds with date_from parameter'):
            response = self.client_get(url, {
                'canonical_name__in': f'{ts_one.canonical_name},{ts_two.canonical_name}',
                'date_from': '2017-05-01'
            })
            self.assertResponseOk(response)

        with self.subTest('export succeeds with date parameters'):
            response = self.client_get(url, {
                'canonical_name__in': f'{ts_one.canonical_name},{ts_two.canonical_name}',
                'date_from': '2017-05-01',
                'date_to': '2017-06-01'
            })
            self.assertResponseOk(response)

        with self.subTest('export fails with invalid date parameters'):
            response = self.client_get(url, {
                'canonical_name__in': f'{ts_one.canonical_name},{ts_two.canonical_name}',
                'date_from': 'foobar',
                'date_to': 'loremipsum'
            })
            self.assertResponseStatus(400, response)

        with self.subTest('export succeeds with head parameter'):
            response = self.client_get(url, {
                'canonical_name__in': f'{ts_one.canonical_name},{ts_two.canonical_name}',
                'date_from': '2017-05-01',
                'date_to': '2017-06-01',
                'head': '1'
            })
            self.assertResponseOk(response)


class TimeseriesMessageTestCase(BaseTestCase):
    def test_timeseries_message_serializer(self):
        canonical_name = f'{self.target}.fake-timeseris.test'

        with self.subTest('serializer create'):
            self.assertFalse(Timeseries.objects.filter(canonical_name=canonical_name).exists())
            thresholds = [
                {'upper': 10, 'lower:': 0, 'kind': 'kind1'},
                {'upper': 9, 'lower:': 1, 'kind': 'kind2'},
                {'upper': 160, 'lower:': 2, 'kind': 'kind3'},
                {'upper': 110, 'lower:': 3, 'kind': 'kind4'},
                {'upper': 70, 'lower:': 4, 'kind': 'kind3'},
            ]
            acquired_protocols = [
                {
                    'protocol': {'id': 'protocol-test-1', 'description': None},
                    'meta': {}
                },
                {
                    'protocol': {'id': 'protocol-test-2', 'description': None},
                    'meta': {}
                }
            ]
            unit = {
                'id': 'milligram-liter',
                'name': 'Miligramos por litro',
                'abbreviation': 'mg/L',
                'si': False,
                'si_conversion_scale': '0.00100000',
                'si_conversion_shift': None,
                'si_unit': {
                    'id': 'kilogram-cubic-meter',
                    'name': 'Kilogramos por metro cúbico',
                    'abbreviation': 'kg/m³',
                    'si': True,
                    'si_conversion_scale': None,
                    'si_conversion_shift': None,
                    'si_unit': None
                }
            }
            coord_unit = {
                'id': 'meter',
                'name': 'Metro',
                'abbreviation': 'm',
                'si': True,
                'si_conversion_scale': None,
                'si_conversion_shift': None,
                'si_unit': None
            }
            frequencies = [
                {
                    'created_at': '2019-09-11T13:49:35.142303Z',
                    'protocol': {'id': 'protocol-test-2', 'description': None},
                    'minutes': '43200.00000000',
                    'tolerance_lower': None,
                    'tolerance_upper': None
                },
                {
                    'created_at': '2019-09-11T13:49:35.142303Z',
                    'protocol': {'id': 'protocol-test-1', 'description': None},
                    'minutes': '43200.00000000',
                    'tolerance_lower': None,
                    'tolerance_upper': None
                }
            ]
            timeseries_data = {
                'thresholds': thresholds,
                'unit': unit,
                'x_unit': None,
                'y_unit': None,
                'z_unit': coord_unit,
                'acquired_protocols': acquired_protocols,
                'frequencies': frequencies,
                'target': self.target,
                'name': 'Test -- Fake',
                'canonical_name': canonical_name,
                'template_name': 'fake.test',
                'description': 'Test',
                'highlight': False,
                'active': True,
                'type': 'raw',
                'space_coords': None,
                'labels': [],
                'choices': None,
                'script': '',
                'script_version': 'emac:local',
                'range_gte': '0.00000000',
                'range_gt': None,
                'range_lte': None,
                'range_lt': None
            }
            create_serializer = TimeseriesMessageSerializer(data=timeseries_data)
            self.assertTrue(create_serializer.is_valid())
            create_serializer.save()
            self.assertTrue(Timeseries.objects.filter(canonical_name=canonical_name).exists())

            timeseries = Timeseries.objects.filter(canonical_name=canonical_name).first()

            self.assertEqual(len(list(timeseries.thresholds.all())), len(thresholds))
            self.assertEqual(len(list(timeseries.active_acquired_protocols)), len(acquired_protocols))
            self.assertEqual(len(list(timeseries.active_frequencies)), len(frequencies))
            self.assertEqual(timeseries.unit.id, unit['id'])
            self.assertEqual(timeseries.z_unit.id, coord_unit['id'])

        with self.subTest('serializer update'):
            self.assertTrue(Timeseries.objects.filter(canonical_name=canonical_name).exists())
            timeseries = Timeseries.objects.filter(canonical_name=canonical_name).first()

            thresholds_u = [
                {'upper': 10, 'lower:': 0, 'kind': 'kind1'},
                {'upper': 9, 'lower:': 1, 'kind': 'kind2'},
                {'upper': 260, 'lower:': -2, 'kind': 'kind6'},
                {'upper': 340, 'lower:': 3, 'kind': 'kind7'},
            ]
            acquired_protocols_u = [
                {
                    'protocol': {'id': 'protocol-test-3', 'description': 'description-protocol-test-3'},
                    'meta': {}
                }
            ]
            unit_u = {
                'id': 'microsiemes-centimeter',
                'name': 'Microsiemens por centímetro',
                'abbreviation': 'µS/cm',
                'si': False,
                'si_conversion_scale': '0.00010000',
                'si_conversion_shift': None,
                'si_unit': {
                    'id': 'siemens-meter',
                    'name': 'Siemens por metro',
                    'abbreviation': 'S/m',
                    'si': True,
                    'si_conversion_scale': None,
                    'si_conversion_shift': None,
                    'si_unit': None
                }
            }
            coord_unit_u = {
                'id': 'centimeter',
                'name': 'Centímetro',
                'abbreviation': 'cm',
                'si': False,
                'si_conversion_scale': '0.01',
                'si_conversion_shift': None,
                'si_unit': {
                    'id': 'meter',
                    'name': 'Metro',
                    'abbreviation': 'm',
                    'si': True,
                    'si_conversion_scale': None,
                    'si_conversion_shift': None,
                    'si_unit': None
                }
            }
            frequencies_u = [
                {
                    'created_at': '2019-09-11T13:49:35.142303Z',
                    'protocol': {'id': 'protocol-test-3', 'description': 'description-protocol-test-3'},
                    'minutes': '83200',
                    'tolerance_lower': None,
                    'tolerance_upper': None
                }
            ]
            timeseries_update_data = {
                'thresholds': thresholds_u,
                'unit': unit_u,
                'x_unit': coord_unit_u,
                'y_unit': None,
                'z_unit': coord_unit_u,
                'acquired_protocols': acquired_protocols_u,
                'frequencies': frequencies_u,
                'target': self.target,
                'name': 'Test -- Fake',
                'canonical_name': canonical_name,
                'template_name': 'fake.test',
                'description': 'Update Test',
                'highlight': True,
                'active': True,
                'type': 'raw',
                'space_coords': None,
                'labels': [],
                'choices': None,
                'script': '',
                'script_version': 'emac:local',
                'range_gte': '0.00000000',
                'range_gt': None,
                'range_lte': None,
                'range_lt': None
            }

            update_serializer = TimeseriesMessageSerializer(timeseries, data=timeseries_update_data)
            self.assertTrue(update_serializer.is_valid())
            updated_timeseries = update_serializer.save()

            self.assertEqual(len(thresholds_u), len(list(updated_timeseries.thresholds.all())))
            self.assertEqual(len(acquired_protocols_u), len(list(updated_timeseries.active_acquired_protocols)))
            self.assertEqual(len(frequencies_u), len(list(updated_timeseries.active_frequencies)))
            self.assertEqual(updated_timeseries.unit.id, unit_u['id'])
            self.assertEqual(updated_timeseries.x_unit.id, coord_unit_u['id'])
            self.assertEqual(updated_timeseries.z_unit.id, coord_unit_u['id'])

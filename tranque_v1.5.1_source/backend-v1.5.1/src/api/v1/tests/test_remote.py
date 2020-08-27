import io
import json
import secrets
from unittest.mock import MagicMock, patch

import dateutil
from django.conf import settings
from django.core.files import File
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone


from api.tests.base import BaseTestCase
from api.v1.handlers.event_handlers import (
    remote_target_data_dump_request,
    send_data_to_smc,
    remotes_auto_deliver,
    remote_event_trace_response,
    remote_event_trace_request,
    remote_target_data_dump_response)
from api.v1.handlers.remote_handlers import remotes_heartbeat, remote_mgn_status, remote_mgn_status_response
from api.v1.serializers.target_serializers import TimeseriesMessageSerializer, DataSourceGroupMessageSerializer, \
    DataSourceMessageSerializer
from api.v1.tests.target.test_event import BaseEventTestCase
from remotes.models import Remote, Message, EventTraceRequest, DataRequestState, DataDumpRequest, VersionHash
from remotes.tools import get_dirhash
from targets import elastic
from targets.elastic import get_trace, Search, search
from targets.handlers import receive_from_enrichment
from targets.models import Timeseries, Target, DataSourceGroup, DataSource


class RemoteMessagesTestCase(TestCase):

    def setUp(self):
        self.remote = Remote.objects.create(
            namespace=f'test_remote_{secrets.token_urlsafe(16)}',
            exchange='test_remote',
            bucket='test_remote'
        )

    def test_remote_heartbeat(self):
        send_mock = MagicMock()

        with self.subTest('first heartbeat message set remote last seen'):
            self.assertIsNone(self.remote.last_seen)

            # get message to send
            message = Message.objects.create(
                command="remote.heartbeat",
                origin=self.remote.namespace
            )

            # Execute handler
            remotes_heartbeat(message, send_mock)

            # assert ack does not send a response
            self.assertFalse(send_mock.called)

            # assert remote last seen is updated with message creation date
            remote = Remote.objects.get(pk=self.remote.pk)
            self.assertEqual(remote.last_seen, message.created_at)

        with self.subTest('heartbeat updates remote last seen'):
            old_remote = Remote.objects.get(pk=self.remote.pk)

            # get new message to send
            message = Message.objects.create(
                command="remote.heartbeat",
                origin=self.remote.namespace
            )

            self.assertLess(old_remote.last_seen, message.created_at)

            send_mock = MagicMock()

            # Execute handler
            remotes_heartbeat(message, send_mock)

            # assert ack does not send a response
            self.assertFalse(send_mock.called)

            # assert remote last seen is updated with message creation date
            remote = Remote.objects.get(pk=self.remote.pk)
            self.assertEqual(remote.last_seen, message.created_at)

    def test_remote_mgn_status(self):
        send_mock = MagicMock()

        # get message to send
        message = Message.objects.create(
            command="remote.mgn.status"
        )

        # execute the handler
        remote_mgn_status(message, send_mock)

        # assert
        # Assert a response is sent
        send_mock.assert_called_once()

        _, send_args, _ = send_mock.mock_calls[0]
        self.assertEqual(len(send_args), 1)
        response_message = send_args[0]
        self.assertEqual(response_message.command, 'remote.mgn.status.response')
        self.assertIn('manifest_versions', response_message.body)
        self.assertIn('hashes', response_message.body)
        self.assertIn('commit', response_message.body)
        # validate the response command and body packing, in the body we need to validate the json with the hashes

    def test_remote_mgn_status_response(self):
        send_mock = MagicMock()

        with self.subTest('everything ok'):
            # get message to send
            message = Message.objects.create(
                command="remote.mgn.status.response",
                origin=self.remote.namespace,
                body={
                    'manifest_versions': [f'emac:{secrets.token_urlsafe(16)}', f'ef:{secrets.token_urlsafe(16)}'],
                    'hashes': [
                        ['profiles_base_dir_hash', get_dirhash(settings.PROFILES_BASE)],
                        ['alert_base_dir', get_dirhash(settings.ALERT_MODULES_ROOT)],
                        ['base_dir', get_dirhash(settings.BASE_DIR)]
                    ],
                    'commit': secrets.token_urlsafe(16),
                }
            )

            # execute the handler
            remote_mgn_status_response(message, send_mock)

            # assert VersionHash is created
            self.assertTrue(VersionHash.objects.filter(remote=self.remote, created_at=message.created_at).exists())
            vhash = VersionHash.objects.filter(remote=self.remote, created_at=message.created_at).first()
            # assert VersionHash hashes_set is valid and all values are true
            self.assertEqual(len(vhash.hashes_set), 3)
            for _hash in vhash.hashes_set:
                self.assertTrue(_hash[1])

        with self.subTest('with an empty dir or doesnt exist'):
            # get message to send
            message = Message.objects.create(
                command="remote.mgn.status.response",
                origin=self.remote.namespace,
                body={
                    'manifest_versions': [f'emac:{secrets.token_urlsafe(16)}', f'ef:{secrets.token_urlsafe(16)}'],
                    'hashes': [
                        ['profiles_base_dir_hash', get_dirhash('/tmp/fake_dir')],
                        ['alert_base_dir', get_dirhash('/tmp/fake_dir')],
                        ['base_dir', get_dirhash('/tmp/fake_dir')]
                    ],
                    'commit': secrets.token_urlsafe(16),
                }
            )

            # execute the handler
            remote_mgn_status_response(message, send_mock)

            # assert VersionHash is created
            self.assertTrue(VersionHash.objects.filter(remote=self.remote, created_at=message.created_at).exists())
            vhash = VersionHash.objects.filter(remote=self.remote, created_at=message.created_at).first()
            # assert VersionHash hashes_set is valid and all values are true
            self.assertEqual(len(vhash.hashes_set), 3)

            for _hash in vhash.hashes_set:
                self.assertIsNone(_hash[1])

        with self.subTest('one dir exist and two doesnt exist'):
            # get message to send
            message = Message.objects.create(
                command="remote.mgn.status.response",
                origin=self.remote.namespace,
                body={
                    'manifest_versions': [f'emac:{secrets.token_urlsafe(16)}', f'ef:{secrets.token_urlsafe(16)}'],
                    'hashes': [
                        ['profiles_base_dir_hash', get_dirhash('/tmp/fake_dir')],
                        ['alert_base_dir', get_dirhash(settings.ALERT_MODULES_ROOT)],
                        ['base_dir', get_dirhash('/tmp/fake_dir')]
                    ],
                    'commit': secrets.token_urlsafe(16),
                }
            )

            # execute the handler
            remote_mgn_status_response(message, send_mock)

            # assert VersionHash is created
            self.assertTrue(VersionHash.objects.filter(remote=self.remote, created_at=message.created_at).exists())
            vhash = VersionHash.objects.filter(remote=self.remote, created_at=message.created_at).first()
            # assert VersionHash hashes_set is valid and all values are true
            self.assertEqual(len(vhash.hashes_set), 3)
            self.assertIsNone(vhash.hashes_set[0][1])
            self.assertTrue(vhash.hashes_set[1][1])
            self.assertIsNone(vhash.hashes_set[2][1])


class DeliveryToSMCTestCase(BaseTestCase):

    @classmethod
    def setUpTestData(cls):
        Target.objects.get(canonical_name=cls.target).apply_manifest('fake')
        cls.trigger_canonical_name = f'{cls.target}.none.fake.compound'
        cls.index_event = {
            'value': 1.0864008926225794,
            'name': cls.trigger_canonical_name,
            '@timestamp': '2019-03-20T03:00:00+00:00',
            'coords': {},
            'sequence': 0,
            'labels': [
                {
                    'key': 'script-version',
                    'value': 'emac:test-fake'
                },
                {
                    'key': 'type',
                    'value': 'derived'
                }
            ],
            'meta': None,
            '_id': 'fake-id-3',
            'dependencies': [f'fake-dep-index-{x}' for x in range(100)]
        }

    def setUp(self):
        self.as_superuser()

    @patch('targets.handlers.send_data_to_smc')
    @override_settings(STACK_IS_SML=True, AUTO_DELIVER_CATEGORIES=['fake-index'])
    def test_enrichment_message_triggers_delivery_to_smc(self, mock_send_data_to_smc):
        datasource = self.target_object.data_sources.first()
        ds_h_id = datasource.hardware_id

        # output that triggers
        trigger_message = Message.objects.create(
            command=settings.ENRICHMENT_FORWARD_COMMAND,
            body={'raw_message_id': 'fake-id-trigger-message', 'outputs_count': 3}
        )

        setattr(trigger_message, 'extra', {
            'outputs': [
                {
                    'value': 1,
                    'name': f'{ds_h_id}.fake.normalized-variables.fe',
                    '@timestamp': '2019-03-20T03:00:00+00:00',
                    'coords': {},
                    'sequence': 0,
                    'labels': [
                        {
                            'key': 'script-version',
                            'value': 'emac:test-fake'
                        },
                        {
                            'key': 'type',
                            'value': 'derived'
                        }
                    ],
                    'meta': {
                        'range': {
                            'gte': 0
                        }
                    },
                    '_id': 'fake-id-5',
                    'dependencies': [f'fake-dep-nvar-fe-{x}' for x in range(10)]
                }, {
                    'value': 1,
                    'name': f'{ds_h_id}.fake.valid-variables.cd',
                    '@timestamp': '2019-03-20T03:00:00+00:00',
                    'coords': {},
                    'sequence': 0,
                    'labels': [
                        {
                            'key': 'script-version',
                            'value': 'emac:test-fake'
                        },
                        {
                            'key': 'type',
                            'value': 'derived'
                        }
                    ],
                    'meta': {
                        'range': {
                            'gte': 0
                        }
                    },
                    '_id': 'fake-id-4',
                    'dependencies': [f'fake-dep-vvar-cd-{x}' for x in range(10)]
                },
                self.index_event
            ]
        })

        # output that do not triggers
        no_trigger_message = Message.objects.create(
            command=settings.ENRICHMENT_FORWARD_COMMAND,
            body={'raw_message_id': 'fake-id-no-trigger-message', 'outputs_count': 3}
        )
        setattr(no_trigger_message, 'extra', {
            'outputs': [
                {
                    'value': 1,
                    'name': f'{ds_h_id}.fake.normalized-variables.fe',
                    '@timestamp': '2019-03-20T03:00:00+00:00',
                    'coords': {},
                    'sequence': 0,
                    'labels': [
                        {
                            'key': 'script-version',
                            'value': 'emac:test-fake'
                        },
                        {
                            'key': 'type',
                            'value': 'derived'
                        }
                    ],
                    'meta': {
                        'range': {
                            'gte': 0
                        }
                    },
                    '_id': 'fake-id-2',
                    'dependencies': [f'fake-dep-nvar-fe-{x}' for x in range(10)]
                }, {
                    'value': 1,
                    'name': f'{ds_h_id}.fake.valid-variables.cd',
                    '@timestamp': '2019-03-20T03:00:00+00:00',
                    'coords': {},
                    'sequence': 0,
                    'labels': [
                        {
                            'key': 'script-version',
                            'value': 'emac:test-fake'
                        },
                        {
                            'key': 'type',
                            'value': 'derived'
                        }
                    ],
                    'meta': {
                        'range': {
                            'gte': 0
                        }
                    },
                    '_id': 'fake-id-1',
                    'dependencies': [f'fake-dep-vvar-cd-{x}' for x in range(10)]
                }, {
                    'value': 1,
                    'name': f'{ds_h_id}.fake.normalized-variables.cd',
                    '@timestamp': '2019-03-20T03:00:00+00:00',
                    'coords': {},
                    'sequence': 0,
                    'labels': [
                        {
                            'key': 'script-version',
                            'value': 'emac:test-fake'
                        },
                        {
                            'key': 'type',
                            'value': 'derived'
                        }
                    ],
                    'meta': {
                        'range': {
                            'gte': 0
                        }
                    },
                    '_id': 'fake-id-3',
                    'dependencies': [f'fake-dep-nvar-cd-{x}' for x in range(10)]
                }
            ]
        })

        send_mock = MagicMock()
        with self.subTest('message does not trigger delivery to SMC'):
            receive_from_enrichment(no_trigger_message, send_mock)
            mock_send_data_to_smc.assert_not_called()

        mock_send_data_to_smc.reset_mock()
        with self.subTest('message does trigger delivery to SMC'):
            receive_from_enrichment(trigger_message, send_mock)
            mock_send_data_to_smc.assert_called()
            call_args = mock_send_data_to_smc.call_args[0]
            self.assertEqual(len(call_args), 2)
            timeseries = call_args[0]
            events = call_args[1]
            self.assertEqual(len(events), 1)
            self.assertEqual(events[0]['name'], self.trigger_canonical_name)
            self.assertEqual(len(timeseries), 1)
            self.assertEqual(timeseries[0].canonical_name, self.trigger_canonical_name)

    @patch('api.v1.handlers.event_handlers.send_simple_smc_message')
    @override_settings(STACK_IS_SML=True)
    def test_send_data_to_smc(self, mock_send_simple_smc_message):
        timeseries = Timeseries.objects.get(canonical_name=self.trigger_canonical_name)
        send_data_to_smc((timeseries,), (self.index_event,))
        mock_send_simple_smc_message.assert_called()
        call_args = mock_send_simple_smc_message.call_args[0]
        self.assertEqual(len(call_args), 2)
        self.assertEqual(call_args[0], settings.AUTO_DELIVER_COMMAND)
        body = call_args[1]
        self.assertEqual(len(body['events']), 1)
        self.assertDictEqual(body['events'][0], self.index_event)
        self.assertEqual(len(body['timeseries']), 1)
        self.assertDictEqual(body['timeseries'][0], TimeseriesMessageSerializer(timeseries).data)

    @override_settings(STACK_IS_SML=False)
    def test_remotes_auto_deliver_command(self):
        timeseries = Timeseries.objects.get(canonical_name=self.trigger_canonical_name)

        message = Message.objects.create(
            command=settings.AUTO_DELIVER_COMMAND,
            body={
                'events': [
                    self.index_event
                ],
                'timeseries': [
                    TimeseriesMessageSerializer(timeseries).data
                ]
            }
        )

        timeseries.delete()
        self.assertFalse(Timeseries.objects.filter(canonical_name=self.trigger_canonical_name).exists())

        send_mock = MagicMock()
        remotes_auto_deliver(message, send_mock)
        self.assertTrue(Timeseries.objects.filter(canonical_name=self.trigger_canonical_name).exists())
        url = reverse(f'{self.api_version}:target-timeseries-detail', args=[self.target, self.trigger_canonical_name])
        response = self.client.get(url, {'max_events': 1}, format='json')
        self.assertResponseOk(response)
        self.assertIn('events', response.data)
        self.assertEqual(len(response.data['events']), 1)
        event = response.data['events'][0]
        self.assertEqual(event['_id'], self.index_event['_id'])
        self.assertEqual(event['value'], self.index_event['value'])
        self.assertEqual(event['name'], self.index_event['name'])
        self.assertEqual(event['@timestamp'], self.index_event['@timestamp'])


class EventRequestSMLHandler(BaseEventTestCase):

    @override_settings(STACK_IS_SML=True)
    def test_remote_event_trace_request_command(self):
        self.create_fake_events()
        event = get_trace(self.head_event['_id'])
        trace_request = EventTraceRequest.objects.create(
            event_id=self.head_event['_id'], timeseries=self.timeseries, created_by=self.superuser_object
        )
        message = Message.objects.create(
            command='remote.event.trace.request',
            body={
                "event_id": self.head_event['_id'],
                "request_id": trace_request.id,
                "timeseries_canonical_name": self.timeseries.canonical_name
            },
            exchange=self.remote.exchange
        )

        send_mock = MagicMock()
        remote_event_trace_request(message, send_mock)
        _, send_args, _ = send_mock.mock_calls[0]

        # assert handler sends response with trace and request id in body
        self.assertEqual(len(send_args), 1)
        self.assertEqual(send_args[0].command, 'remote.event.trace.response')
        self.assertEqual(send_args[0].body['request_id'], trace_request.id)

        dependencies = set([x['_id'] for x in event['trace']])
        timeseries = set([x['name'] for x in event['trace']])
        sources = set([
            s.hardware_id
            for s in filter(bool, [
                t.data_source
                for t in Timeseries.objects.filter(canonical_name__in=timeseries)
            ])
        ])
        groups = set([
            g.canonical_name
            for g in filter(bool, [
                t.data_source_group
                for t in Timeseries.objects.filter(canonical_name__in=timeseries)
            ])
        ])
        message_events = set([x['_id'] for x in send_args[0].body['events']])
        message_timeseries = set([x['canonical_name'] for x in send_args[0].body['timeseries']])
        message_sources = set([x['hardware_id'] for x in send_args[0].body['sources']])
        message_groups = set([x['canonical_name'] for x in send_args[0].body['groups']])

        self.assertEqual(dependencies, message_events)
        self.assertEqual(timeseries, message_timeseries)
        self.assertEqual(sources, message_sources)
        self.assertEqual(groups, message_groups)


class EventRequestSMCResponseHandler(BaseEventTestCase):

    @override_settings(STACK_IS_SML=False)
    def test_remote_event_trace_response_command(self):
        self.create_fake_events()
        # create new event and trace (based on head_event), to receive as trace response in message
        new_event = {
            **self.head_event,
            "_id": f"first-event-for-{self.timeseries.canonical_name}-v2",
            "dependencies": [
                f"{x}-v2" for x in self.head_event['dependencies']
            ],
        }
        new_dependencies = [
            {
                **x,
                "_id": f"{x['_id']}-v2"
            }
            for x in get_trace(self.head_event)['trace']
        ]
        inputs = [self.input1, self.input2]
        sources = list(filter(bool, [i.data_source for i in inputs]))
        groups = list(filter(bool, [i.data_source_group for i in inputs]))
        serialized_input_timeseries = TimeseriesMessageSerializer(inputs, many=True).data
        serialized_sources = DataSourceMessageSerializer(sources, many=True).data
        serialized_groups = DataSourceGroupMessageSerializer(groups, many=True).data
        # create the trace_request that will be responded
        trace_request = EventTraceRequest.objects.create(
            event_id=self.head_event['_id'], timeseries=self.timeseries, created_by=self.superuser_object
        )

        # create message
        message = Message.objects.create(
            command='remote.event.trace.response',
            body={
                "events": new_dependencies,
                "request_id": trace_request.id,
                "sources": serialized_sources,
                "groups": serialized_groups,
                "timeseries": serialized_input_timeseries
            },
            exchange=self.remote.exchange
        )

        # store head of new trace
        elastic.index(new_event, refresh="true")

        # delete input timeseries and assert they do not exist
        input_names = [i.canonical_name for i in inputs]
        source_ids = [s.hardware_id for s in sources]
        group_names = [g.canonical_name for g in groups]
        for i in inputs:
            i.delete()
        for s in sources:
            s.delete()
        for g in groups:
            g.delete()
        self.assertFalse(Timeseries.objects.filter(canonical_name__in=input_names).exists())
        self.assertFalse(DataSource.objects.filter(hardware_id__in=source_ids).exists())
        self.assertFalse(DataSourceGroup.objects.filter(canonical_name__in=group_names).exists())

        # get trace before handler execution
        trace_with_error = get_trace(new_event)
        self.assertTrue(trace_with_error['trace_errors'])

        # execute handler
        send_mock = MagicMock()
        remote_event_trace_response(message, send_mock)
        # this handler should not generate a response
        send_mock.assert_not_called()

        # assert input timeseries exists
        self.assertEqual(Timeseries.objects.filter(canonical_name__in=input_names).count(), len(input_names))

        # assert timeseries have sources
        series_with_source = Timeseries.objects.filter(canonical_name__in=input_names, data_source__isnull=False)
        self.assertTrue(series_with_source.count() >= len(source_ids))

        # assert timeseries have groups
        series_with_group = Timeseries.objects.filter(canonical_name__in=input_names, data_source_group__isnull=False)
        self.assertTrue(series_with_group.count() >= len(group_names))

        # assert trace_request has received state
        self.assertTrue(
            EventTraceRequest.objects.filter(id=trace_request.id, state=DataRequestState.RECEIVED).exists()
        )

        # get trace and check it has no errors
        full_trace = get_trace(new_event)
        self.assertFalse(full_trace['trace_errors'])


def generate_source_groups(target):
    return [
        # Create groups to set in sources for serialization
        DataSourceGroup.objects.create(
            target=target,
            name='name',
            canonical_name=f"{target.canonical_name}.{i}.{secrets.token_urlsafe(8)}"
        ) for i in range(6)
    ]


def generate_sources(target, groups):
    ret = []
    for i in range(12):
        # Create sources to set group for serialization
        source = DataSource.objects.create(
            target=target,
            name='name',
            hardware_id=f"{i}.{secrets.token_urlsafe(8)}",
            canonical_name=f"{target.canonical_name}.{i}.{secrets.token_urlsafe(8)}",
        )
        source.groups.set(groups[i:])
        ret.append(source)
    return ret


def generate_timeseries(targets, profile, sources, groups):
    template = f"{profile}.{secrets.token_urlsafe(8)}"
    return [
        Timeseries(
            target=target,
            name=f'Test timeseries {i} for {target.canonical_name}',
            canonical_name=f"{target.canonical_name}.{secrets.token_urlsafe(8)}.{template}.{i}",
            template_name=template,
            data_source=sources[i] if i < len(sources) else None,
            data_source_group=groups[i] if i < len(groups) else None
        ) for target in targets for i in range(18)
    ]


def generate_events(timeseries, count):
    return [
        {
            "_id": f"event-{i}-for-{ts.canonical_name}",
            "name": ts.canonical_name,
            "value": i,
            "@timestamp": f"2000-01-{(i + 1):02d}T12:00:00Z",
            "labels": [{
                "key": "message-id",
                "value": "first-test-message",
            }],
        } for ts in timeseries for i in range(count)
    ]


def create_fake_events(timeseries, count):
    elastic.bulk_index(generate_events(timeseries, count), refresh="wait_for")


class DataDumpHandlers(BaseTestCase):

    def setUp(self):
        self.as_superuser()
        targets = list(Target.objects.all())
        # remotes
        self.remote = Remote.objects.create(
            namespace=f"test-namespace-{secrets.token_urlsafe(8)}",
            exchange=f"test-exchange-{secrets.token_urlsafe(8)}",
            bucket=f"test-bucket-{secrets.token_urlsafe(8)}",
            last_seen=timezone.now(),
        )
        self.remote.targets.set(targets)
        self.profile = 'fake'
        self.dump_request = DataDumpRequest.objects.create(
            created_by=self.superuser_object,
            target=self.target_object,
            profile=self.profile,
            date_from=dateutil.parser.parse('2000-01-03T00:00:00Z'),
            date_to=dateutil.parser.parse('2000-01-06T00:00:00Z')
        )
        self.file_paths = {
            "timeseries": 'path/to/timeseries',
            "events": 'path/to/events',
            "sources": 'path/to/data_sources',
            "groups": 'path/to/data_groups'
        }

    @patch('api.v1.handlers.event_handlers.upload_dump_to_smc')
    @override_settings(STACK_IS_SML=True)
    def test_remote_target_data_dump_request_command(self, mock_udts):
        # Apply fake manifest
        self.target_object.apply_manifest(self.profile)
        # Add Timeseries not to be included in dump
        Timeseries.objects.bulk_create(generate_timeseries([
            Target.objects.exclude(canonical_name=self.target).first(),
            self.target_object,
        ], 'random-profile', [], []))
        # Add events for all timeseries
        create_fake_events(Timeseries.objects.all(), 13)

        message = Message.objects.create(**self.dump_request.get_message_args())

        # Data to be uploaded
        timeseries = Timeseries.objects.filter(
            target=self.target_object,
            template_name__startswith='fake'
        ).select_related('data_source').prefetch_related('data_source__groups')
        timeseries_canonical_names = [
            x.canonical_name
            for x in timeseries
        ]
        sources = list(filter(bool, [
            t.data_source
            for t in timeseries
        ]))
        sources_ids = set([
            source.hardware_id
            for source in sources
        ])
        groups_ids = set([
            group.canonical_name
            for source in sources for group in source.groups.all()
        ])

        send_mock = MagicMock()
        mock_udts.return_value = self.file_paths
        remote_target_data_dump_request(message, send_mock)

        # Assert files were "uploaded"
        mock_udts.assert_called_once()
        _, dump_upload_args, _ = mock_udts.mock_calls[0]
        self.assertEqual(len(dump_upload_args), 5)
        self.assertEqual(dump_upload_args[0], self.dump_request.id)

        # Check timeseries file
        self.assertEqual(len(dump_upload_args[1]), len(timeseries_canonical_names))
        for t in dump_upload_args[1]:
            self.assertIn(t.canonical_name, timeseries_canonical_names)

        # Check events file
        # 10 events were created for each timeseries one daily from 2000/01/01 to 2000/01/09
        # but only 3 are inside the time range of the request from 2000/01/03 00:00:00 to 2000/01/06 00:00:00
        self.assertEqual(len(list(dump_upload_args[2])), len(timeseries_canonical_names) * 3)
        for e in dump_upload_args[2]:
            self.assertIn(e['name'], timeseries_canonical_names)
            self.assertTrue(dateutil.parser.parse(e['@timestamp']) >= self.dump_request.date_from)
            self.assertTrue(dateutil.parser.parse(e['@timestamp']) <= self.dump_request.date_to)

        # Check data source groups file
        groups_uploaded_ids = set([g.canonical_name for g in dump_upload_args[3]])
        self.assertEqual(groups_ids, groups_uploaded_ids)

        # Check data sources file
        sources_uploaded_ids = set([s.hardware_id for s in dump_upload_args[4]])
        self.assertEqual(sources_ids, sources_uploaded_ids)

        # Assert message is correct
        _, send_args, _ = send_mock.mock_calls[0]
        rbody = send_args[0].body

        # assert handler sends response with trace and request id in body
        self.assertEqual(len(send_args), 1)
        self.assertEqual(send_args[0].command, 'remote.target.data.dump.response')
        self.assertEqual(rbody['request_id'], self.dump_request.id)
        self.assertDictEqual(rbody['paths'], self.file_paths)

    @patch('api.v1.handlers.event_handlers.store_dump_files')
    @override_settings(STACK_IS_SML=True)
    def test_remote_target_data_dump_response_command(self, mock_sdf):
        # Create timeseries for dump files
        groups = generate_source_groups(self.target_object)
        group_names = [g.canonical_name for g in groups]
        sources = generate_sources(self.target_object, groups)
        source_names = [s.hardware_id for s in sources]

        timeseries = generate_timeseries([self.target_object], 'dump-response-profile', sources, groups)
        Timeseries.objects.bulk_create(timeseries)
        timeseries_names = [t.canonical_name for t in timeseries]

        timeseries_sources = [s.hardware_id for s in filter(bool, [t.data_source for t in timeseries])]
        timeseries_groups = [g.canonical_name for g in filter(bool, [t.data_source_group for t in timeseries])]
        # assert relation exists in created data
        self.assertTrue(len(timeseries_sources) > 0)
        self.assertTrue(len(timeseries_groups) > 0)

        # Create fake events for dump files
        events = generate_events(timeseries, 27)
        event_ids = [e['_id'] for e in events]

        #  Assert they do not exists
        s = Search().filter_by_id(event_ids)
        self.assertEqual(search(s[:0]).count, 0)

        message = Message.objects.create(
            command='remote.target.data.dump.response',
            body={
                'request_id': self.dump_request.id,
                'paths': self.file_paths
            },
            exchange=self.remote.exchange
        )

        send_mock = MagicMock()

        request = self.dump_request

        timeseries_file = MagicMock(spec=File)
        timeseries_file.read.return_value = json.dumps(TimeseriesMessageSerializer(timeseries, many=True).data)
        timeseries_file.name = 'timeseries.json'
        request.timeseries_file = timeseries_file

        request.events_file = io.StringIO('\n'.join([json.dumps(e) for e in events]))

        groups_file = MagicMock(spec=File)
        groups_file.read.return_value = json.dumps(DataSourceGroupMessageSerializer(groups, many=True).data)
        groups_file.name = 'groups.json'
        request.groups_file = groups_file

        sources_file = MagicMock(spec=File)
        sources_file.read.return_value = json.dumps(DataSourceMessageSerializer(sources, many=True).data)
        sources_file.name = 'sources.json'
        request.sources_file = sources_file

        # remove data that will be added by handler
        Timeseries.objects.filter(canonical_name__in=[t.canonical_name for t in timeseries]).delete()
        DataSource.objects.filter(id__in=[s.id for s in sources]).delete()
        DataSourceGroup.objects.filter(id__in=[g.id for g in groups]).delete()

        request.save = MagicMock()

        # Mock returned file
        mock_sdf.return_value = request

        remote_target_data_dump_response(message, send_mock)

        request.save.assert_called()
        self.assertEqual(request.state, DataRequestState.RECEIVED)

        # Assert files were "stored"
        mock_sdf.assert_called_once()

        _, dump_store_args, _ = mock_sdf.mock_calls[0]

        self.assertEqual(len(dump_store_args), 2)
        # request_id
        self.assertEqual(dump_store_args[0], request.id)
        # tmp_paths
        self.assertDictEqual(dump_store_args[1], self.file_paths)

        # all timeseries exists
        self.assertEqual(len(timeseries_names), Timeseries.objects.filter(canonical_name__in=timeseries_names).count())
        # all events exists
        s = Search().filter_by_id(event_ids)
        count = search(s[:0]).count
        self.assertEqual(count, len(event_ids))
        # all groups exists
        self.assertEqual(len(group_names), DataSourceGroup.objects.filter(target=self.target_object,
                                                                          canonical_name__in=group_names).count())
        # all sources exists
        self.assertEqual(len(source_names), DataSource.objects.filter(target=self.target_object,
                                                                      hardware_id__in=source_names).count())
        # validate relations exists
        self.assertTrue(
            Timeseries.objects.filter(canonical_name__in=timeseries_names, data_source__isnull=False).exists())
        self.assertTrue(
            Timeseries.objects.filter(canonical_name__in=timeseries_names, data_source_group__isnull=False).exists())

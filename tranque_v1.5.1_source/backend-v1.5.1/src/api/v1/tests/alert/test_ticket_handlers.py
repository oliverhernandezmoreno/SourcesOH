import random
import secrets
from unittest.mock import patch, MagicMock

from django.contrib.auth import get_user_model
from django.db import transaction
from django.test import override_settings
from django.utils import timezone

from alerts import engine
from alerts.collector import target_controllers
from alerts.models import Ticket, TicketLog, TicketComment, UserIntent, AuthorizationRequest
from alerts.tests.base import with_test_modules
from api.tests.base import BaseTestCase, RollbackException
from api.v1.handlers.alert_handlers import (
    alerts_ticket_handler,
    alerts_ticket_intent_handler, alerts_ticket_intent_ack_handler, alerts_ticket_authorization_create_handler,
    alerts_ticket_authorization_create_ack_handler, alerts_ticket_authorization_update_handler,
)
from api.v1.handlers.alert_utils import prepare_ticket_message_body
from api.v1.handlers.utils import get_events
from api.v1.serializers.target_serializers import TimeseriesMessageSerializer
from api.v1.serializers.ticket_serializers import TicketMessageSerializer
from api.v1.serializers.user_serializers import serialize_author
from documents.tests.utils import with_fake_docs
from documents.utils import serialize_docs_for_upload
from remotes.models import Remote, Message
from targets import elastic
from targets.elastic import Search, search, get_event
from targets.elastic.conn import delete
from targets.models import DataSourceGroup, Timeseries, DataSource

SML_BUCKET = 'sml-test-bucket'
SML_NAMESPACE = 'sml-test-namespace'
SMC_NAMESPACE = 'smc-test-namespace'


@override_settings(STACK_IS_SML=True, SMC_S3_BUCKET_NAME=SML_BUCKET, NAMESPACE=SML_NAMESPACE)
class TicketHandlerTestCase(BaseTestCase):

    @with_test_modules
    def setUp(self):
        # The only difference of a stack being SML and SMC for this test
        # is how the documents are uploaded/downloaded
        # the tests will mock the functionality of upload/download
        # so it will not be necessary to test both directions of communication
        # by default the following tests will assume that the tickets are generated in the SML and sent to the SMC
        # this is done with the class settings override

        # Target and Remote
        target = self.target_object
        self.remote = Remote.objects.create(namespace=SML_NAMESPACE, exchange='sml-test-exchange', bucket=SML_BUCKET)
        target.remote = self.remote
        target.save()

        # Groups for the bar module to spread
        self.groups = [
            DataSourceGroup.objects.create(target=target, name=f'sector {i}', canonical_name=f'test-group-{i}')
            for i in range(3)
        ]

        self.controllers = target_controllers(target)

        modules = [
            # root
            # no timeseries
            '_.lorem',

            # root -> child
            # one timeseries, without datasource
            '_.foo',

            # root -> child -> nested-child-1
            # two timeseries one with a datasource, one without
            '_.baz',

            # root -> child -> nested-child-spread-group-0
            # one timeseries with datasource
            f'g({self.groups[0].canonical_name}).bar',

            # root -> child -> nested-child-spread-group-1
            # two timeseries with datasource
            f'g({self.groups[1].canonical_name}).bar',

            # root -> child -> nested-child-spread-group-2
            # third group with no ticket
            # f'g({self.groups[2].canonical_name}).bar',
        ]

        source_names = [
            # _.baz source
            'source-baz',
            # one for first group
            f'source-g({self.groups[0].canonical_name}).bar',
            # two for second group
            f'source-g({self.groups[1].canonical_name}).bar-1',
            f'source-g({self.groups[1].canonical_name}).bar-2',
            # two for third group
            f'source-g({self.groups[2].canonical_name}).bar-1',
            f'source-g({self.groups[2].canonical_name}).bar-2',
        ]

        self.sources = [
            DataSource.objects.create(
                target=target,
                hardware_id=f'{s}-{secrets.token_urlsafe(6)}',
                name=s
            )
            for s in source_names
        ]
        # set sources in groups
        self.groups[0].data_sources.set(self.sources[1:2])
        self.groups[1].data_sources.set(self.sources[2:4])

        # Create timeseries
        self.timeseries = [
            # foo tickets[1]
            Timeseries.objects.create(
                target=target,
                name='foo timeseries',
                canonical_name=f'foo-test-{secrets.token_urlsafe(8)}',
                type=Timeseries.TimeseriesType.TEST
            ),
            # baz tickets[2]
            Timeseries.objects.create(
                target=target,
                name='baz with source',
                canonical_name=f'baz-test-with-source-{secrets.token_urlsafe(8)}',
                type=Timeseries.TimeseriesType.TEST,
                data_source=self.sources[0],
            ),
            Timeseries.objects.create(
                target=target,
                name='Test input group-0',
                canonical_name=f'baz-test-without-source-{secrets.token_urlsafe(8)}',
                type=Timeseries.TimeseriesType.TEST,
            ),
            # group 0 tickets[3]
            Timeseries.objects.create(
                target=target,
                name='Test input group-0',
                canonical_name=f'input-test-group-0-{secrets.token_urlsafe(8)}',
                template_name='bar-test',
                type=Timeseries.TimeseriesType.TEST,
                data_source=self.sources[1],
                data_source_group=self.groups[0],
            ),
            # group 1 tickets[4]
            Timeseries.objects.create(
                target=target,
                name='Test input group-0',
                canonical_name=f'input-test-group-0-{secrets.token_urlsafe(8)}',
                template_name='bar-test',
                type=Timeseries.TimeseriesType.TEST,
                data_source=self.sources[2],
                data_source_group=self.groups[1],
            ),
            Timeseries.objects.create(
                target=target,
                name='Test input group-0',
                canonical_name=f'input-test-group-0-{secrets.token_urlsafe(8)}',
                template_name='bar-test',
                type=Timeseries.TimeseriesType.TEST,
                data_source=self.sources[3],
                data_source_group=self.groups[1],
            ),
        ]

        self.trace_timeseries = [
            Timeseries.objects.create(
                target=target,
                name=f'trace-timeseries {i}',
                canonical_name=f'trace-timeseries-{secrets.token_urlsafe(8)}',
                type=Timeseries.TimeseriesType.TEST
            ) for i in range(5)
        ]

        self.tickets = [
            Ticket.objects.create(
                module=module,
                state=random.choice(list(self.controllers[module].states)),
                target=target,
                archived=False,
                evaluable=True,
                groups='/' + '/'.join(self.controllers[module].visibility_groups) + '/',
            ) for module in modules
        ]

        self.ticket_logs = [
            TicketLog.objects.create(
                ticket=self.tickets[i],
                meta={'description': f'test log {j} for {modules[i]}'},
            )
            for i in range(len(self.tickets))
            for j in range(i + 3)
        ]

        self.ticket_comments = [
            TicketComment.objects.create(
                ticket=self.tickets[i],
                comment_type=random.choice(TicketComment.CommentType.choices)[0],
                content=f'test comment {j} for {modules[i]}',
            )
            for i in range(len(self.tickets))
            for j in range(i + 2)
        ]

        # Set tickets children according to modules parent-child relation
        self.tickets[0].children.set(self.tickets[1:2])
        self.tickets[1].children.set(self.tickets[2:5])

    def create_fake_events(self, timeseries, count=5):
        events = [
            {
                '_id': f'{j}-event-for-{t.canonical_name}-{secrets.token_urlsafe(8)}',
                'name': t.canonical_name,
                'value': random.random() * 10,
                '@timestamp': f'2020-02-{j + 1:02}T12:00:00Z',
                'labels': [{
                    'key': 'message-id',
                    'value': 'first-test-message',
                }],
            } for t in timeseries for j in range(count)
        ]
        elastic.bulk_index(events, refresh='true')
        return [e['_id'] for e in events]

    def validate_ticket_ack(self, send_mock, ticket):
        _, send_args, _ = send_mock.mock_calls[0]
        self.assertEqual(len(send_args), 1)
        self.assertEqual(send_args[0].command, 'alerts.ticket.ack')
        self.assertDictEqual(send_args[0].body, TicketMessageSerializer(ticket).data)

    def search_ticket(self, tickets, id):
        ret = next(iter([t for t in tickets if t['id'] == id]), None)
        self.assertIsNotNone(ret)
        return ret

    def add_fake_docs(self, fake_docs):
        self.logs_with_files = random.sample(self.ticket_logs, 3)
        self.logs_with_files[0].documents.set(fake_docs[0:1])
        self.logs_with_files[1].documents.set(fake_docs[1:2])
        self.logs_with_files[2].documents.set(fake_docs[2:4])
        self.comments_with_files = random.sample(self.ticket_comments, 2)
        self.comments_with_files[0].documents.set(fake_docs[4:5])
        self.comments_with_files[1].documents.set(fake_docs[5:7])
        return fake_docs[0:4], fake_docs[4:7]

    def check_files(self, serialized_objects, originals, obj_class):
        count = 0
        for obj in serialized_objects:
            original = next(iter([x for x in originals if x.id == obj['id']]), None)
            if original is not None:
                serialized_docs = set([doc['name'] for doc in obj['documents']])
                original_docs = set([doc.name for doc in original.documents.all()])
                self.assertSetEqual(serialized_docs, original_docs)
                count += len(original_docs)
            else:
                raise obj_class.DoesNotExist()
        return count

    def assert_message_body_ticket(self, ticket, children_count, logs_count, comment_count):
        self.assertEqual(len(ticket['children']), children_count)
        self.assertEqual(len(ticket['logs']), logs_count)
        self.assertEqual(len(ticket['comments']), comment_count)
        count = 0
        count += self.check_files(ticket['logs'], self.ticket_logs, TicketLog)
        count += self.check_files(ticket['comments'], self.ticket_comments, TicketComment)
        return count

    def assert_message_body(self, body, upload_doc, log_docs, comment_docs, events_by_ticket, event_with_trace, bucket):
        # assert the four documents were uploaded
        self.assertEqual(upload_doc.call_count, len(log_docs) + len(comment_docs))
        doc_ids = [doc.id for doc in log_docs] + [doc.id for doc in comment_docs]
        for call in upload_doc.call_args_list:
            # call == ((doc, s3, bucket, file_path), ())
            self.assertEqual(len(call[0]), 4)
            self.assertIn(call[0][0].id, doc_ids)
            self.assertEqual(call[0][2], bucket)

        # check events
        events = body.get('events')
        event_setup_ids = set([e for _events in events_by_ticket for e in _events])
        event_setup_ids.update([e for e in event_with_trace['dependencies']])
        event_serialized_ids = set([e['_id'] for e in events])
        self.assertSetEqual(event_setup_ids, event_serialized_ids)

        # check timeseries
        timeseries = body.get('timeseries')
        ts_setup_names = set([t.canonical_name for t in self.timeseries])
        ts_setup_names.update([t.canonical_name for t in self.trace_timeseries])
        ts_serialized_names = set([t['canonical_name'] for t in timeseries])
        self.assertSetEqual(ts_setup_names, ts_serialized_names)

        # check groups
        groups = body.get('groups')
        group_names = set([g['canonical_name'] for g in groups])
        self.assertSetEqual(group_names, set([g.canonical_name for g in self.groups[0:2]]))

        # check sources
        sources = body.get('sources')
        sources_ids = set([s['hardware_id'] for s in sources])
        self.assertSetEqual(sources_ids, set([g.hardware_id for g in self.sources[0:4]]))

        # check tickets and hierarchy are correctly serialized
        doc_count = 0

        # lorem
        ticket_0 = body.get('ticket')
        self.assertEqual(ticket_0['id'], self.tickets[0].id)
        doc_count += self.assert_message_body_ticket(ticket_0, 1, 3, 2)

        # foo
        ticket_1 = ticket_0['children'][0]
        self.assertEqual(ticket_1['id'], self.tickets[1].id)
        doc_count += self.assert_message_body_ticket(ticket_1, 3, 4, 3)

        # baz
        ticket_2 = self.search_ticket(ticket_1['children'], self.tickets[2].id)
        self.assertIsNotNone(ticket_2)
        doc_count += self.assert_message_body_ticket(ticket_2, 0, 5, 4)

        # bar
        ticket_3 = self.search_ticket(ticket_1['children'], self.tickets[3].id)
        self.assertIsNotNone(ticket_3)
        doc_count += self.assert_message_body_ticket(ticket_3, 0, 6, 5)

        # bar
        ticket_4 = self.search_ticket(ticket_1['children'], self.tickets[4].id)
        self.assertIsNotNone(ticket_4)
        doc_count += self.assert_message_body_ticket(ticket_4, 0, 7, 6)

        self.assertEqual(doc_count, 7)

    def second_setup(self, download_doc, upload_doc, fake_docs):
        # mock side effects
        # upload always return successful
        if upload_doc is not None:
            upload_doc.return_value = True

        # download should return the fake document object
        if download_doc is not None:
            def mock_download_doc(s3, serialized_doc, bucket, folder):
                for doc in fake_docs:
                    if serialized_doc['name'] == doc.name:
                        return doc
                return None

            download_doc.side_effect = mock_download_doc

        # add docs to logs
        log_docs, comment_docs = self.add_fake_docs(fake_docs)

        # Create events for the timeseries group by ticket
        events_by_ticket = [
            # tickets[0] has no timeseries
            [],
            # foo tickets[1]
            random.sample(self.create_fake_events(self.timeseries[0:1]), 3),
            # baz tickets[2]
            random.sample(self.create_fake_events(self.timeseries[1:3]), 7),
            # group 0 tickets[3]
            random.sample(self.create_fake_events(self.timeseries[3:4]), 2),
            # group 1 tickets[4]
            random.sample(self.create_fake_events(self.timeseries[4:6]), 8),
        ]

        trace_events_ids = self.create_fake_events(self.trace_timeseries)
        trace_events = get_events(trace_events_ids)
        # assign trace to first foo event
        event_with_trace = get_event(events_by_ticket[1][0])
        event_with_trace['dependencies'] = trace_events_ids
        # overwrite created event
        elastic.index(event_with_trace, refresh='true')

        # assign events to tickets first log
        # foo tickets[1]
        foo_log = self.tickets[1].logs.first()
        foo_log.timeseries = [{
            **TimeseriesMessageSerializer(self.timeseries[0]).data,
            'events': [e for e in events_by_ticket[1]]
        }] + [{
            **TimeseriesMessageSerializer(ts).data,
            'events': [e['_id'] for e in trace_events if e['name'] == ts.canonical_name]
        } for ts in self.trace_timeseries]
        foo_log.save()
        # baz tickets[2]
        baz_events_ids = [e for e in events_by_ticket[2]]
        baz_timeseries = []
        for ts in self.timeseries[1:3]:
            baz_timeseries.append({
                **TimeseriesMessageSerializer(ts).data,
                'events': [x['_id'] for x in ts.get_events(0, 20) if x['_id'] in baz_events_ids]
            })
        baz_log = self.tickets[2].logs.first()
        baz_log.timeseries = baz_timeseries
        baz_log.save()
        # group 0 tickets[3]
        group_0_log = self.tickets[3].logs.first()
        group_0_log.timeseries = [{
            **TimeseriesMessageSerializer(self.timeseries[3]).data,
            'events': [e for e in events_by_ticket[3]]
        }]
        group_0_log.save()
        # group 1 tickets[4]
        group_1_events_ids = [e for e in events_by_ticket[4]]
        group_1_timeseries = []
        for ts in self.timeseries[4:6]:
            group_1_timeseries.append({
                **TimeseriesMessageSerializer(ts).data,
                'events': [x['_id'] for x in ts.get_events(0, 20) if x['_id'] in group_1_events_ids]
            })
        group_1_log = self.tickets[4].logs.first()
        group_1_log.timeseries = group_1_timeseries
        group_1_log.save()

        return log_docs, comment_docs, events_by_ticket, event_with_trace

    def are_body_equal(self, body_1, body_2):
        # for simplicity check only ids, validation of serialization is already done in a previous test,
        # if ids are the same they should be the same values
        # with the exception of updated_at, order of serialized events,
        # order of nested tickets, order of logs and order of comments
        def get_ticket_ids(ticket, parent_id):
            ticket_id = f'{parent_id}%{ticket["id"]}'
            yield ticket_id
            for log in ticket['logs']:
                log_id = f'{ticket_id}/log/{log["id"]}'
                yield log_id
                for doc in log['documents']:
                    yield f'{log_id}/doc/{doc["name"]}'
            for comment in ticket['comments']:
                comment_id = f'{ticket_id}/comment/{comment["id"]}'
                yield comment_id
                for doc in comment['documents']:
                    yield f'{comment_id}/doc/{doc["name"]}'
            for child in ticket['children']:
                yield from get_ticket_ids(child, ticket_id)

        def get_body_ids(body):
            return {
                'events': set([e['_id'] for e in body.get('events')]),
                'timeseries': set([t['canonical_name'] for t in body.get('timeseries')]),
                'sources': set([s['hardware_id'] for s in body.get('sources')]),
                'groups': set([s['canonical_name'] for s in body.get('groups')]),
                'ticket': set([t_id for t_id in get_ticket_ids(body.get('ticket'), '')]),
            }

        ids_body_1 = get_body_ids(body_1)
        ids_body_2 = get_body_ids(body_2)
        ret = True
        for key in ids_body_2.keys():
            ret = ret and ids_body_1[key] == ids_body_2[key]
        return ret

    @patch('documents.utils.upload_doc')
    @with_fake_docs(count=8)
    def test_prepare_ticket_message_body(self, upload_doc, fake_docs):
        upload_doc.return_value = True
        target = self.target_object

        # Add random sources and groups, to validate only the ones related to the ticket are serialized
        for i in range(5):
            DataSource.objects.create(
                target=target,
                hardware_id=f'ignored-soure-{i}-{secrets.token_urlsafe(6)}',
                name=f'ignored {i}'
            )
            DataSourceGroup.objects.create(
                target=target,
                name=f'ignored {i}',
                canonical_name=f'ignored-group-{i}-{secrets.token_urlsafe(6)}'
            )
            Timeseries.objects.create(
                target=target,
                name='ignored timeseries',
                canonical_name=f'ignored-timeseries-{i}-{secrets.token_urlsafe(8)}',
                template_name='bar-test',
                type=Timeseries.TimeseriesType.TEST,
            )

        log_docs, comment_docs, events_by_ticket, event_with_trace = self.second_setup(None, upload_doc, fake_docs)

        # assert message body is ok in SMC
        with self.settings(STACK_IS_SML=False):
            upload_doc.reset_mock()
            body_smc = prepare_ticket_message_body(self.tickets[0])
            self.assert_message_body(
                body_smc, upload_doc, log_docs, comment_docs, events_by_ticket, event_with_trace, self.remote.bucket
            )

        # assert message body is ok in SML
        fake_bucket = f'not-{self.remote.bucket}'
        with self.settings(SMC_S3_BUCKET_NAME=fake_bucket):
            upload_doc.reset_mock()
            body_sml = prepare_ticket_message_body(self.tickets[0])
            self.assert_message_body(
                body_sml, upload_doc, log_docs, comment_docs, events_by_ticket, event_with_trace, fake_bucket
            )

        # assert both stacks serialize equal data
        self.assertTrue(self.are_body_equal(body_sml, body_smc))

    @patch('documents.utils.upload_doc')
    @patch('documents.utils.download_doc')
    @with_fake_docs(count=8)
    def test_ticket_message_create(self, download_doc, upload_doc, fake_docs):
        # Create events for the timeseries group by ticket
        log_docs, comment_docs, events_by_ticket, event_with_trace = self.second_setup(
            download_doc, upload_doc, fake_docs
        )
        event_ids = [e for ticket_events in events_by_ticket for e in ticket_events]
        ticket_id = self.tickets[0].id

        # setup message as SML
        msg_body = prepare_ticket_message_body(self.tickets[0])
        # msg_body will be used later to assert data created is the same
        # while alerts_ticket_handler processes a message it removes data from the body object
        # so here we give a copy to the message body
        message = Message.objects.create(
            command='alerts.ticket',
            body=prepare_ticket_message_body(self.tickets[0]),
            origin=self.remote.namespace
        )

        Timeseries.objects.all().delete()
        DataSource.objects.all().delete()
        DataSourceGroup.objects.all().delete()
        TicketLog.objects.all().delete()
        TicketComment.objects.all().delete()
        Ticket.objects.all().delete()
        delete(Search().filter_by_id(event_ids), refresh="true")

        # assert data was deleted
        self.assertEqual(search(Search().filter_by_id(event_ids)[:0]).count, 0)
        self.assertFalse(DataSourceGroup.objects.exists())
        self.assertFalse(DataSource.objects.exists())
        self.assertFalse(Timeseries.objects.exists())
        self.assertFalse(TicketLog.objects.exists())
        self.assertFalse(TicketComment.objects.exists())
        self.assertFalse(Ticket.objects.exists())

        # execute handler as SMC
        with self.settings(STACK_IS_SML=False):
            send_mock = MagicMock()
            alerts_ticket_handler(message, send_mock)

        # assert data was stored
        self.assertTrue(DataSourceGroup.objects.exists())
        self.assertTrue(DataSource.objects.exists())
        self.assertTrue(Timeseries.objects.exists())
        self.assertTrue(TicketLog.objects.exists())
        self.assertTrue(TicketComment.objects.exists())
        self.assertTrue(Ticket.objects.filter(id=ticket_id).exists())
        self.assertEqual(search(Search().filter_by_id(event_ids)[:0]).count, len(event_ids))

        # assert ticket exists and the body can be serialized exactly as the original
        created_ticket = Ticket.objects.get(id=ticket_id)
        recreated_body = prepare_ticket_message_body(created_ticket)
        self.assertTrue(self.are_body_equal(msg_body, recreated_body))

    @patch('documents.utils.upload_doc')
    @patch('documents.utils.download_doc')
    @with_fake_docs(count=12)
    def test_ticket_message_update(self, download_doc, upload_doc, fake_docs):
        # Create events for the timeseries group by ticket
        _, _, _, _ = self.second_setup(download_doc, upload_doc, fake_docs)
        # setup update message as SML
        ticket = self.tickets[1]
        try:
            with transaction.atomic():
                # do some changes
                # state update
                ticket.state = random.choice(
                    list(filter(bool, [
                        x
                        for x in self.controllers[ticket.module].states
                        if x != ticket.state
                    ]))
                )
                # new events
                # timeseries[0] is for ticket[1]
                event_ids = self.create_fake_events([self.timeseries[0]], 2)

                # new logs some with docs
                TicketLog.objects.create(
                    ticket=self.tickets[0],
                    meta={'description': f'new log 1 for {self.tickets[0].id}'},
                )
                log_1 = TicketLog.objects.create(
                    ticket=ticket,
                    meta={'description': f'new log 1 with events for {ticket.id}'},
                    timeseries=[{
                        **TimeseriesMessageSerializer(self.timeseries[0]).data,
                        'events': event_ids
                    }]
                )
                log_1.documents.add(fake_docs[5])
                log_2 = TicketLog.objects.create(
                    ticket=ticket,
                    meta={'description': f'new log 2 for {ticket.id}'},
                )
                log_2.documents.set(fake_docs[6:8])

                # new comments some with docs
                TicketComment.objects.create(
                    ticket=ticket,
                    comment_type=random.choice(TicketComment.CommentType.choices)[0],
                    content=f'new comment 1 for {ticket.id}',
                )
                comment_2 = TicketComment.objects.create(
                    ticket=ticket,
                    comment_type=random.choice(TicketComment.CommentType.choices)[0],
                    content=f'new comment 1 for {ticket.id}',
                )
                comment_2.documents.set(fake_docs[8:10])

                # serialize body
                # the handler will remove data from the message body
                # so a copy of the body is made to test later
                test_body = prepare_ticket_message_body(ticket)
                msg_body = prepare_ticket_message_body(ticket)

                # delete new events
                delete(Search().filter_by_id(event_ids), refresh="true")
                self.assertEqual(search(Search().filter_by_id(event_ids)[:0]).count, 0)

                raise RollbackException('raised to rollback db changes')
        except RollbackException:
            pass

        # generate message
        message = Message.objects.create(
            command='alerts.ticket',
            body=msg_body,
            origin=self.remote.namespace
        )

        # assert changes were reverted by checking that the serialized body is not equal
        ticket.refresh_from_db()
        before_update = prepare_ticket_message_body(ticket)

        self.assertFalse(self.are_body_equal(before_update, msg_body))

        # execute handler as SMC
        with self.settings(STACK_IS_SML=False):
            send_mock = MagicMock()
            alerts_ticket_handler(message, send_mock)

        # validate changes are applied by checking that now the serialized body is equal
        ticket.refresh_from_db()
        updated_body = prepare_ticket_message_body(ticket)
        self.assertTrue(self.are_body_equal(updated_body, test_body))


@override_settings(STACK_IS_SML=True, NAMESPACE=SML_NAMESPACE)
class TicketIntentHandlerTestCase(BaseTestCase):

    def setUp(self):
        # Target and Remote
        target = self.target_object
        self.remote = Remote.objects.create(
            namespace=SML_NAMESPACE,
            exchange='sml-test-exchange',
            bucket=SML_BUCKET
        )
        target.remote = self.remote
        target.save()
        self.module = '_.lorem'

    @with_test_modules
    def test_ticket_intent_handler(self):
        ticket = Ticket.objects.create(
            module=self.module,
            state="A",
            target=self.target_object,
            archived=False,
            evaluable=True,
        )
        new_state = "B"
        # ticket escalation message
        body = {
            "id": f'id_not_origin-{secrets.token_urlsafe(6)}',
            "serialized_user": serialize_author(self.authority_user_object),
            "target__canonical_name": self.target,
            "module": self.module,
            "content": {
                "state": new_state,
            },
            "origin": SMC_NAMESPACE,
        }
        message = Message.objects.create(
            command='alerts.ticket.intent',
            body=body,
            origin=SMC_NAMESPACE
        )

        # execute handler
        send_mock = MagicMock()
        alerts_ticket_intent_handler(message, send_mock)

        # assert an intent was created with same id
        intent = UserIntent.objects.filter(id=body['id']).first()
        self.assertIsNotNone(intent)
        # assigned to system user
        self.assertEqual(intent.user, get_user_model().objects.get(username="system"))
        # with original serialized_user
        self.assertIsNotNone(intent.serialized_user)
        self.assertDictEqual(intent.serialized_user, body["serialized_user"])
        # was attended
        self.assertIsNotNone(intent.attended_at)
        # origin is set correctly
        self.assertEqual(intent.origin, SMC_NAMESPACE)
        # has no issue
        self.assertEqual(intent.issue, "")
        # and ticket was escalated
        ticket.refresh_from_db()
        self.assertEqual(ticket.state, new_state)

        # send_mock was called with ack command
        send_mock.assert_called_once()
        (ack_message,) = send_mock.call_args[0]
        self.assertEqual(ack_message.command, 'alerts.ticket.intent.ack')
        self.assertDictEqual(ack_message.body, {
            "id": intent.id,
            "issue": intent.issue,
        })

    @with_test_modules
    def test_ticket_intent_ack_handler(self):
        intent = UserIntent.objects.create(
            id=f'id_not_origin-{secrets.token_urlsafe(6)}',
            user=self.authority_user_object,
            serialized_user=serialize_author(self.authority_user_object),
            target=self.target_object,
            module=self.module,
            content={
                "state": "new_state",
            },
            origin=SMC_NAMESPACE,
            sent_to_destination_at=timezone.now(),
            attended_at=timezone.now()
        )
        # intent ack message
        body = {
            "id": intent.id,
            "issue": UserIntent.IssueOptions.UNMET_CONDITIONS
        }
        message = Message.objects.create(
            command='alerts.ticket.intent.ack',
            body=body,
            origin=SML_NAMESPACE
        )

        # execute handler
        send_mock = MagicMock()
        alerts_ticket_intent_ack_handler(message, send_mock)

        # assert intent was attended by destination
        intent.refresh_from_db()
        self.assertIsNotNone(intent.attended_by_destination_at)
        self.assertEqual(intent.issue, body["issue"])

        # send_mock was called with ack command
        send_mock.assert_not_called()


class TicketAuthorizationHandlerTestCase(BaseTestCase):

    def setUp(self):
        # Target and Remote
        target = self.target_object
        self.remote = Remote.objects.create(
            namespace=SML_NAMESPACE,
            exchange='sml-test-exchange',
            bucket=SML_BUCKET
        )
        target.remote = self.remote
        target.save()
        self.module = '_.ipsum.dolor'
        self.ticket = Ticket.objects.create(
            module=self.module,
            state="A",
            target=target,
            origin=SML_NAMESPACE,
            archived=False,
            evaluable=True,
        )
        self.authorization = 'ticket.A.close.authorization.miner-2'

    # TODO complete test of authorization view

    @override_settings(STACK_IS_SML=False, NAMESPACE=SMC_NAMESPACE)
    def test_authorization_request_create_handler(self):
        body = {
            "id": f'id_not_origin-{secrets.token_urlsafe(6)}',
            "origin": SML_NAMESPACE,
            "ticket": self.ticket.id,
            "authorization": self.authorization,
            "created_by": serialize_author(self.authority_user_object),
            "created_at": str(timezone.now()),
        }

        message = Message.objects.create(
            command='alerts.ticket.authorization.create',
            body=body,
            origin=SML_NAMESPACE
        )

        # execute handler
        send_mock = MagicMock()
        alerts_ticket_authorization_create_handler(message, send_mock)

        # assert an authorization request was created with same id
        authorization_request = AuthorizationRequest.objects.filter(id=body['id']).first()
        self.assertIsNotNone(authorization_request)
        self.assertIsNotNone(authorization_request)
        self.assertEqual(authorization_request.ticket.id, body['ticket'])
        self.assertDictEqual(authorization_request.created_by, body['created_by'])

        # status is pending
        self.assertEqual(authorization_request.status, AuthorizationRequest.Status.PENDING)
        # not resolved
        self.assertIsNone(authorization_request.resolved_by)
        self.assertIsNone(authorization_request.resolved_at)
        self.assertIsNone(authorization_request.comment)

        # create_handler
        # ticket, authorization, created_by, created_at, origin, status

        # update_handler
        # resolved_by, resolved_at, comment, documents, status
        # engine should be run after this one?
        # modify engine to propagate with updated conditions(?)

        # if it not exists it should be new (pending status)
        # if it exists it should only have an approved or denied status

        # send_mock was called with ack command
        send_mock.assert_called_once()
        (ack_message,) = send_mock.call_args[0]
        self.assertEqual(ack_message.command, 'alerts.ticket.authorization.create.ack')
        self.assertEqual(ack_message.body['id'], body['id'])
        self.assertIsNotNone(ack_message.body['received_at'])

    @override_settings(STACK_IS_SML=True, NAMESPACE=SML_NAMESPACE)
    def test_authorization_request_create__ack_handler(self):
        authorization_request = AuthorizationRequest.objects.create(
            origin=SML_NAMESPACE,
            ticket=self.ticket,
            authorization=self.authorization,
            created_by=serialize_author(self.authority_user_object),
        )

        body = {
            "id": authorization_request.id,
            "received_at": str(timezone.now()),
        }

        message = Message.objects.create(
            command='alerts.ticket.authorization.create.ack',
            body=body,
            origin=SMC_NAMESPACE
        )

        # execute handler
        send_mock = MagicMock()
        alerts_ticket_authorization_create_ack_handler(message, send_mock)

        # assert an authorization request was created with same id
        authorization_request.refresh_from_db()
        self.assertIsNotNone(authorization_request.received_at)

        send_mock.assert_not_called()

    @override_settings(STACK_IS_SML=True, NAMESPACE=SML_NAMESPACE)
    @with_test_modules
    @patch('documents.utils.download_doc')
    @with_fake_docs(count=8)
    def test_authorization_request_update_handler(self, download_doc, fake_docs):
        def mock_download_doc(s3, serialized_doc, bucket, folder):
            for doc in fake_docs:
                if serialized_doc['name'] == doc.name:
                    return doc
            return None

        download_doc.side_effect = mock_download_doc

        # run engine to update conditions
        engine.run(self.target_object, [self.module])
        # assert incomplete condition
        self.ticket.refresh_from_db()
        conditions = list(filter(
            lambda c: c.get('authorization', None) == self.authorization,
            self.ticket.close_conditions
        ))
        self.assertEqual(len(conditions), 1)
        self.assertFalse(conditions[0]['complete'])
        authorization_request = AuthorizationRequest.objects.create(
            origin=SML_NAMESPACE,
            ticket=self.ticket,
            authorization=self.authorization,
            created_by=serialize_author(self.mine_user_object),
        )

        folder = f'documents/ticket/{self.ticket.id}/authorization/{authorization_request.id}/'
        documents = serialize_docs_for_upload(fake_docs[0:2], folder)

        body = {
            "id": authorization_request.id,
            "resolved_by": serialize_author(self.authority_user_object),
            "resolved_at": str(timezone.now()),
            "comment": "a comment",
            "documents": [doc[2] for doc in documents],
            "status": AuthorizationRequest.Status.APPROVED,
        }

        message = Message.objects.create(
            command='alerts.ticket.authorization.update',
            body=body,
            origin=SMC_NAMESPACE
        )

        # execute handler
        send_mock = MagicMock()
        alerts_ticket_authorization_update_handler(message, send_mock)

        # assert an authorization request was created with same id
        authorization_request.refresh_from_db()
        self.assertEqual(authorization_request.status, body['status'])
        self.assertIsNotNone(authorization_request.resolved_at)
        self.assertDictEqual(authorization_request.resolved_by, body['resolved_by'])
        self.assertEqual(authorization_request.comment, body['comment'])
        self.assertEqual(authorization_request.documents.count(), 2)
        fake_names = [doc.name for doc in fake_docs[0:2]]
        for doc in authorization_request.documents.all():
            self.assertIn(doc.name, fake_names)

        self.ticket.refresh_from_db()
        conditions = list(filter(
            lambda c: c.get('authorization', None) == self.authorization,
            self.ticket.close_conditions
        ))
        self.assertTrue(conditions[0]['complete'])

        # send_mock was called with ack command
        send_mock.assert_called_once()
        (ack_message,) = send_mock.call_args[0]
        self.assertEqual(ack_message.command, 'alerts.ticket.authorization.update.ack')
        self.assertEqual(ack_message.body['id'], body['id'])

import secrets
from functools import reduce
from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.db import transaction
from django.db.models import Q
from django.test import override_settings, tag
from guardian.shortcuts import assign_perm, remove_perm
from rest_framework.authtoken.models import Token

from alerts import engine
from alerts.collector import target_controllers
from alerts.models import Ticket, UserIntent, TicketLog, TicketComment
from alerts.modules.base_states import EVENT_STATES, AUTHORIZATION_LEVELS, ALERT_STATES, CLOSED
from api.tests.base import BaseTestCase, RollbackException
from api.v1.serializers.user_serializers import serialize_author
from documents.tests.utils import with_fake_docs
from targets.models import Target

TEST_CONTROLLERS = Path(settings.BASE_DIR) / "api" / "v1" / "tests" / "permissions" / "api_fake_controllers"


class TicketPermissionsTestCase(BaseTestCase):

    @classmethod
    def setUpTestData(cls):
        cls.module = '_.all_perms'

        # the super_user, second target and second set of tickets
        # are there to validate that access with all permissions works
        # because views will not use the full integration from guardian library
        # but manually use guardian methods to check access
        # relying in library implementation is not enough
        token, _ = Token.objects.get_or_create(
            user=get_user_model().objects.get(username=cls.superuser["username"])
        )
        cls.super_client = cls.client_class()
        cls.super_client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
        cls.second_target = Target.objects.exclude(canonical_name=cls.target).first()

    def setUp(self):
        self.user = get_user_model().objects.create(username=f'permission_user{secrets.token_urlsafe(6)}')
        self.as_user(self.user)

    def add_permission(self, codename):
        assign_perm(
            Permission.objects.get(codename=codename, content_type__app_label='targets'),
            self.user,
            self.target_object
        )

    def remove_permission(self, codename):
        remove_perm(
            Permission.objects.get(codename=codename, content_type__app_label='targets'),
            self.user,
            self.target_object
        )

    def setup_tickets(self, state):
        target = self.target_object
        ticket = Ticket.objects.create(
            module=self.module,
            state=f'{state}{"1" if state in EVENT_STATES else ""}',
            target=target,
        )
        second_ticket = Ticket.objects.create(
            module=self.module,
            state=f'{state}{"1" if state in EVENT_STATES else ""}',
            target=self.second_target,
        )
        # add children
        ticket.children.set([Ticket.objects.create(
            module='_.child',
            state=state,
            target=target,
        )])
        second_ticket.children.set([Ticket.objects.create(
            module='_.child',
            state=state,
            target=self.second_target,
        )])
        for t in [ticket, second_ticket]:
            # add log
            TicketLog.objects.create(
                ticket=t,
                author=serialize_author(self.superuser_object),
                meta={"description": "test log"},
                timeseries=[
                    {
                        "canonical_name": 'canonical_name',
                        "events": ['id1', 'id2', 'id3']
                    },
                    {
                        "canonical_name": 'canonical_name2',
                        "events": ['id5', 'id6', 'id7']
                    },
                ]
            )
            # add comments
            for comment_type, content in TicketComment.CommentType.choices:
                TicketComment.objects.create(
                    ticket=t,
                    comment_type=comment_type,
                    content=f'test comment: {content}',
                )
        engine.run(target)
        engine.run(self.second_target)
        ticket.refresh_from_db()
        second_ticket.refresh_from_db()
        return ticket, second_ticket

    def wrap_sub_test(self, label, function):
        with self.subTest(label):
            try:
                with transaction.atomic():
                    function(self)
                    raise RollbackException()
            except RollbackException:
                pass

    def api_url(self, *suffixes):
        prefix = f"/api/{self.api_version}"
        url = "/".join([
            prefix,
            *suffixes
        ])
        return url + ("" if url.endswith("/") else "/")

    def ticket_url(self, *suffixes, target=None):
        _target = self.target if target is None else target
        return self.api_url('target', _target, 'ticket', *suffixes)

    def _check_response(self, url, response, expected_code, count, data):
        self.assertEqual(expected_code, response.status_code, {"url": url, "response": response.data, "request": data})
        data = response.data
        if 'count' in data and 'results' in data:
            _data = data['results']
            _count = data['count']
        else:
            _data = data
            _count = (1 if bool(data) else 0)
        if count is not None:
            self.assertEqual(count, _count)
        return _data

    def perform_super_get(self, url, code, data=None, count=None, format='json'):
        response = self.super_client.get(url, data, format=format)
        return self._check_response(url, response, code, count, data)

    def perform_super_post(self, url, code, data=None, count=None, format='json'):
        response = self.super_client.post(url, data, format=format)
        return self._check_response(url, response, code, count, data)

    def perform_get(self, url, code, data=None, count=None, format='json'):
        response = self.client.get(url, data, format=format)
        return self._check_response(url, response, code, count, data)

    def perform_post(self, url, code, data=None, count=None, format='json'):
        response = self.client.post(url, data, format=format)
        return self._check_response(url, response, code, count, data)

    def assertData(self, data, visible=None, not_visible=None):
        if visible is not None:
            for key in visible:
                self.assertIn(key, data)
                self.assertIsNotNone(data[key], key)
                if isinstance(data[key], (tuple, list)):
                    self.assertTrue(len(data[key]) > 0, key)
        if not_visible is not None:
            for key in not_visible:
                if key not in data:
                    continue
                if isinstance(data[key], (tuple, list)):
                    self.assertEqual(len(data[key]), 0, key)
                else:
                    self.assertIsNone(data[key], key)

    def mark_as_checked(self, codename):
        self.remove_permission(codename)
        self.assertIn(codename, self.permissions)
        self.permissions[codename] = True

    def alert_comments(self, state, suffix):
        return [
            (
                TicketComment.CommentType.CLOSE_REPORT,
                f'ticket.{state}.close_report_comment.{suffix}'
            ),
            (
                TicketComment.CommentType.ALERT_MANAGEMENT,
                f'ticket.{state}.alert_management_comment.{suffix}'
            ),
            (
                TicketComment.CommentType.ALERT_COMPLEMENTARY,
                f'ticket.{state}.alert_complementary_comment.{suffix}'
            )
        ]

    def event_comments(self, state, suffix):
        return [
            (
                TicketComment.CommentType.EVENT_MANAGEMENT,
                f'ticket.{state}.event_management_comment.{suffix}'
            ),
        ]

    def get_comment_choices(self, state, suffix):
        if state == CLOSED:
            return [
                *self.alert_comments(state, suffix),
                *self.event_comments(state, suffix)
            ]
        if state in ALERT_STATES:
            return self.alert_comments(state, suffix)
        if state in EVENT_STATES:
            return self.event_comments(state, suffix)

    def ticket_read_permission_test(self, ticket, second_ticket, state):
        comment_perms = self.get_comment_choices(state, 'read')
        read_permissions = [
            f'ticket.{state}.read',
            f'ticket.{state}.children.read',
            f'ticket.{state}.log.read',
            f'ticket.{state}.event_data.read',
            *[comment_perm for _, comment_perm in comment_perms]
        ]
        if state in ALERT_STATES or state == CLOSED:
            read_permissions.append(f'ticket.{state}.public_alert_messages.read')

        # TICKET READ PERMISSIONS

        # superuser with read access to everything
        # can list all tickets from any target
        # two main tickets and two children
        self.perform_super_get(self.api_url('tickets'), 200, count=4)

        # basic data is available for both tickets
        data = self.perform_super_get(self.ticket_url(ticket.id), 200, count=1)
        readable_fields = [
            'module',
            'groups',
            'state',
            'result_state',
            'children',
            'logs'
        ]
        self.assertData(data, visible=readable_fields)
        data = self.perform_super_get(
            self.ticket_url(second_ticket.id, target=self.second_target.canonical_name),
            200,
            count=1
        )
        self.assertData(data, visible=readable_fields)

        # normal user with no read access
        # should return 404 because queryset is filtered by permissions
        self.perform_get(self.ticket_url(ticket.id), 404)
        self.perform_get(self.ticket_url(ticket.id, 'log'), 404)
        self.perform_get(self.ticket_url(ticket.id, 'comment'), 404)

        # retry with read permission
        self.add_permission(read_permissions[0])
        self.perform_get(self.ticket_url(ticket.id), 200)
        data = self.perform_get(self.ticket_url(ticket.id), 200)
        self.assertData(
            data,
            visible=['module', 'groups', 'state', 'result_state'],
            not_visible=['children', 'logs']
        )

        # retry with
        # read, children
        self.add_permission(read_permissions[1])
        self.perform_get(self.ticket_url(ticket.id), 200)
        data = self.perform_get(self.ticket_url(ticket.id), 200)
        self.assertData(
            data,
            visible=['state', 'result_state', 'children'],
            not_visible=['logs']
        )

        # assert request directly to log api return forbidden
        self.perform_get(self.ticket_url(ticket.id, 'log'), 403)

        # retry with
        # read, children, logs
        self.add_permission(read_permissions[2])
        self.perform_get(self.ticket_url(ticket.id), 200)
        data = self.perform_get(self.ticket_url(ticket.id), 200)
        self.assertData(
            data,
            visible=['state', 'result_state', 'children', 'logs'],
        )

        # no timeseries because of missing event_data_read permission
        self.assertEqual(len(data['logs'][0]['timeseries']), 0)

        # assert request directly to log api returns non empty list
        data = self.perform_get(self.ticket_url(ticket.id, 'log'), 200)
        self.assertTrue(len(data) > 0)

        # retry with
        # read, children, logs , event_data
        self.add_permission(read_permissions[3])
        self.perform_get(self.ticket_url(ticket.id), 200)
        data = self.perform_get(self.ticket_url(ticket.id), 200)
        # logs has timeseries
        self.assertTrue(len(data['logs'][0]['timeseries']) > 0)

        # assert request directly to comment api return forbidden
        self.perform_get(self.ticket_url(ticket.id, 'comment'), 403)

        for comment_type, comment_perm in comment_perms:
            # comments
            self.add_permission(comment_perm)
            data = self.perform_get(self.ticket_url(ticket.id, 'comment'), 200)
            self.assertTrue(len(data) > 0)
            self.assertTrue(all(c['comment_type'] == comment_type for c in data), list(c['comment_type'] for c in data))
            self.remove_permission(comment_perm)

        # assert user with all permissions for one target only, can't read tickets from another target
        data = self.perform_get(self.api_url('tickets'), 200)
        self.assertEqual(len(data), 2)  # ticket and child
        self.assertSetEqual(set(d['id'] for d in data), {ticket.id, ticket.children.first().id})

        for codename in read_permissions:
            self.mark_as_checked(codename)

    @with_fake_docs(count=5)
    def ticket_log_comment_write_permission_test(self, ticket, second_ticket, state, docs):
        comment_perms = self.get_comment_choices(state, 'write')
        write_permissions = [
            f'ticket.{state}.log.write',
            *[comment_perm for _, comment_perm in comment_perms]
        ]
        if state in ALERT_STATES:
            write_permissions.append(f'ticket.{state}.public_alert_messages.write')

        new_log_data = {
            'message': f'log message - {secrets.token_urlsafe(16)}',
            **{doc.name: doc.file for doc in docs[0:3]}
        }

        def _post_log(code):
            return self.perform_post(
                self.ticket_url(ticket.id, 'log'), code, new_log_data, format='multipart'
            )

        def comment_data(comment_type):
            return {
                'content': f'comment {comment_type} - {secrets.token_urlsafe(16)}',
                'comment_type': comment_type,
                **{doc.name: doc.file for doc in docs[3:5]}
            }

        def _post_comment(code, new_comment_data):
            return self.perform_post(
                self.ticket_url(ticket.id, 'comment'), code, new_comment_data, format='multipart'
            )

        # if no ticket read permission nested views should return 404
        _post_log(404)
        for comment_type, _ in comment_perms:
            _post_comment(404, comment_data(comment_type))

        self.add_permission(f'ticket.{state}.read')

        # missing writes permission should return 403
        _post_log(403)
        for comment_type, _ in comment_perms:
            _post_comment(403, comment_data(comment_type))

        # log write
        self.add_permission(write_permissions[0])
        data = _post_log(201)
        self.assertIn('id', data)
        log = TicketLog.objects.filter(id=data['id']).first()
        self.assertIsNotNone(log)
        self.assertIn('message', log.meta)
        self.assertEqual(log.meta['message'], new_log_data['message'])
        self.assertEqual(log.documents.count(), 3)

        # no permissions for another target will return 404
        self.perform_post(self.ticket_url(second_ticket.id, 'log'), 404, new_log_data)

        # comment write
        for comment_type, comment_perm in comment_perms:
            new_comment_data = comment_data(comment_type)

            _post_comment(403, new_comment_data)

            self.add_permission(comment_perm)
            data = _post_comment(201, new_comment_data)
            self.assertIn('id', data)
            comment = TicketComment.objects.filter(id=data['id']).first()
            self.assertIsNotNone(comment)
            self.assertEqual(comment.content, new_comment_data['content'])
            self.assertEqual(comment.documents.count(), 2)

            # no permissions for another target will return 404
            self.perform_post(self.ticket_url(second_ticket.id, 'comment'), 404, new_comment_data)

            self.remove_permission(comment_perm)

        for codename in write_permissions:
            self.mark_as_checked(codename)
        self.remove_permission(f'ticket.{state}.read')

    def get_intent_content(self, data):
        action = data.get('action', '')
        if action == 'close':
            return {'state': Ticket.TicketState.CLOSED}
        elif action == 'archive':
            return {'archived': True}
        elif action == 'escalate':
            return {'state': data.get('to_state', '')}
        else:
            return {}

    def assertRunUpdate(self, ticket, updated_ticket, data):
        self.assertEqual(ticket.id, updated_ticket.id)
        action = data.get('action', '')
        if action == 'close':
            self.assertEqual(updated_ticket.state, Ticket.TicketState.CLOSED, data)
        elif action == 'archive':
            self.assertEqual(updated_ticket.archived, True, data)
        elif action == 'escalate':
            self.assertEqual(updated_ticket.state, data.get('to_state', ''), data)

    @override_settings(STACK_IS_SML=False)
    def ticket_intent_permission_test(self, ticket, state, states):
        def auth_url(*suffix):
            return self.ticket_url(ticket.id, 'authorization', *suffix)

        # if no ticket read permission nested views should return 404
        self.perform_get(auth_url(), 404)

        self.add_permission(f'ticket.{state}.read')
        self.perform_get(auth_url(), 403)
        actions = [
            (f'close', {'action': 'close'}),
            (f'archive', {'action': 'archive'}),
            *[(
                f'escalate.{to_state}', {'action': 'escalate', 'to_state': to_state}
            ) for to_state in states if state != to_state]
        ]
        for action, post_data in actions:
            perm_action = f'ticket.{state}.{action}'
            if state in EVENT_STATES:
                levels = AUTHORIZATION_LEVELS
            else:
                levels = filter(lambda s: s.startswith('authority'), AUTHORIZATION_LEVELS)
            for level in levels:
                # Authorizations
                perm_request = f'{perm_action}.authorization.{level}.request'
                perm_resolve = f'{perm_action}.authorization.{level}.resolve'
                perm_read = f'{perm_action}.authorization.{level}.read'
                # list
                self.perform_get(auth_url(), 403)
                self.add_permission(perm_read)
                self.perform_get(auth_url(), 200, count=0)

                # request
                self.perform_post(auth_url(), 403, post_data)

                self.add_permission(perm_request)
                authorization_data = self.perform_post(auth_url(), 201, post_data)

                # deny
                self.perform_post(auth_url(authorization_data['id'], 'deny'), 403)
                self.add_permission(perm_resolve)
                self.perform_post(auth_url(authorization_data['id'], 'deny'), 200)
                self.remove_permission(perm_resolve)

                # recreate authorization
                authorization_data = self.perform_post(auth_url(), 201, post_data)

                # approve
                self.perform_post(auth_url(authorization_data['id'], 'approve'), 403)
                self.add_permission(perm_resolve)
                self.perform_post(auth_url(authorization_data['id'], 'approve'), 200)
                self.remove_permission(perm_resolve)

                # read the two authorizations
                self.perform_get(auth_url(), 200, count=2)

                self.mark_as_checked(perm_request)
                self.mark_as_checked(perm_resolve)
                self.mark_as_checked(perm_read)

            # Intent
            intent_url = self.api_url('target', self.target, 'status', self.module, 'intent')
            intent_content = self.get_intent_content(post_data)

            # no permission
            self.perform_post(intent_url, 403, intent_content)

            # retry with permission
            # wrapped in a rollback to prevent ticket update affecting following tests
            self.add_permission(perm_action)
            try:
                with transaction.atomic():
                    data = self.perform_post(intent_url, 201, intent_content)

                    updated_ticket = Ticket.objects.get(id=ticket.id)

                    self.assertEqual(data['intent']['issue'], UserIntent.IssueOptions.NO_ISSUE)
                    self.assertRunUpdate(ticket, updated_ticket, post_data)
                    raise RollbackException()
            except RollbackException:
                pass

            self.mark_as_checked(perm_action)

    def ticket_permissions_test(self, states):
        with target_controllers.collector.override(TEST_CONTROLLERS):
            for state in states:
                with self.subTest(f'testing permissions for state {state}'):
                    try:
                        with transaction.atomic():
                            ticket, second_ticket = self.setup_tickets(state)
                            self.ticket_read_permission_test(ticket, second_ticket, state)
                            self.ticket_log_comment_write_permission_test(ticket, second_ticket, state)
                            self.ticket_intent_permission_test(ticket, state, states)
                            raise RollbackException()
                    except RollbackException:
                        pass

    def closed_ticket_test(self):
        with self.subTest(f'testing permissions for state {CLOSED}'):
            try:
                with transaction.atomic():
                    ticket, second_ticket = self.setup_tickets(CLOSED)
                    self.ticket_read_permission_test(ticket, second_ticket, CLOSED)
                    self.mark_as_checked(f'ticket.{CLOSED}.log.write')
                    raise RollbackException()
            except RollbackException:
                pass

    @tag('slow')
    def test_ticket_permissions(self):
        all_states = [*EVENT_STATES, *ALERT_STATES, CLOSED]
        q_filters = list(map(lambda s: Q(codename__startswith=f'ticket.{s}.'), all_states))
        query = Permission.objects.filter(content_type__app_label='targets').filter(
            reduce(lambda acc, q: acc | q, q_filters))
        self.permissions = {p.codename: False for p in query}
        # permissions is a dict with permission codename as key and a "tested" flag as value
        # at the end of this test it will help check that every permission queried was tested
        self.assertTrue(len(self.permissions) > 0)

        for states in [EVENT_STATES, ALERT_STATES]:
            self.ticket_permissions_test(states)

        self.closed_ticket_test()

        # assert all event permissions were tested
        self.assertTrue(all(self.permissions.values()))

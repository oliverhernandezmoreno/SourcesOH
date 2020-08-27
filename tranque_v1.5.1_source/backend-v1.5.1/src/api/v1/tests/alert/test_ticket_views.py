import secrets
from unittest.mock import patch

from django.test import override_settings

from alerts import engine
from alerts.collector import target_controllers
from alerts.models import Ticket, TicketLog, Broadcast, AuthorizationRequest
from alerts.modules.rules import Rule
from alerts.tests.base import with_test_modules
from api.tests.base import BaseTestCase
from api.v1.handlers.alert_utils import get_ticket_bucket
from api.v1.serializers.user_serializers import serialize_author
from documents.tests.utils import with_fake_docs
from remotes.models import Remote


@override_settings(STACK_IS_SML=False)
class TicketViewTestCase(BaseTestCase):

    def api_url(self, *suffixes):
        prefix = f"/api/{self.api_version}/target/{self.target}/ticket"
        url = "/".join([
            prefix,
            *suffixes
        ])
        return url + ("" if url.endswith("/") else "/")

    @with_test_modules
    def setUp(self):
        self.tickets = []
        self.controllers = target_controllers(self.target_object)
        for index, (module, controller) in enumerate(self.controllers.items()):
            ticket = Ticket.objects.create(
                module=module,
                state=list(controller.states)[0],
                result_state={"level": index, "short_message": "test"},
                target=self.target_object,
                archived=index % 2 != 0,
                evaluable=index % 3 == 0,
                groups="/" + "/".join(controller.visibility_groups) + "/",
            )
            TicketLog.objects.create(
                ticket=ticket,
                meta={"description": "testestest 1"},
            )
            TicketLog.objects.create(
                ticket=ticket,
                meta={"description": "testestest 2"},
            )
            Broadcast.objects.create(
                ticket=ticket,
                handlers=[],
            )
            self.tickets.append(ticket)
        module, controller = next(iter(self.controllers.items()))
        self.tickets.append(Ticket.objects.create(
            module=module,
            state=Ticket.TicketState.CLOSED,
            target=self.target_object,
            groups="/" + "/".join(controller.visibility_groups) + "/",
        ))
        self.as_authority()

    @with_test_modules
    def test_list_tickets(self):
        with self.subTest("unfiltered"):
            response = self.client_get(self.api_url())
            self.assertResponseOk(response)
            self.assertEqual(response.data["count"], len(self.tickets))

        with self.subTest("open"):
            response = self.client_get(self.api_url(), {"open": "yEs"})
            self.assertResponseOk(response)
            self.assertEqual(
                response.data["count"],
                len([t for t in self.tickets if t.state != Ticket.TicketState.CLOSED])
            )

        with self.subTest("closed"):
            response = self.client_get(self.api_url(), {"open": "nO"})
            self.assertResponseOk(response)
            self.assertEqual(
                response.data["count"],
                len([t for t in self.tickets if t.state == Ticket.TicketState.CLOSED])
            )

        with self.subTest("archived"):
            response = self.client_get(self.api_url(), {"archived": "true"})
            self.assertResponseOk(response)
            self.assertTrue(all(t["archived"] for t in response.data["results"]))

        with self.subTest("not evaluable"):
            response = self.client_get(self.api_url(), {"evaluable": "false"})
            self.assertResponseOk(response)
            self.assertTrue(all(not t["evaluable"] for t in response.data["results"]))

        with self.subTest("by module"):
            module = list(self.controllers)[0]
            response = self.client_get(self.api_url(), {"module": module})
            self.assertResponseOk(response)
            self.assertEqual(
                response.data["count"],
                len([t for t in self.tickets if t.module == module])
            )

        with self.subTest("by level range"):
            response = self.client_get(self.api_url(), {"level_gt": 2, "level_lte": 4})
            self.assertResponseOk(response)
            self.assertTrue(all(
                t["result_state"]["level"] in (3, 4) for t in response.data["results"]
            ))

        with self.subTest("by group"):
            response = self.client_get(self.api_url(), {"group": "loremipsum"})
            self.assertResponseOk(response)
            self.assertEqual(
                response.data["count"],
                len([
                    t for t in self.tickets
                    if "loremipsum" in t.base_controller.visibility_groups
                ])
            )

    @with_test_modules
    def test_read_ticket(self):
        response = self.client_get(self.api_url(self.tickets[0].pk))
        self.assertResponseOk(response)
        self.assertEqual(len(response.data["logs"]), self.tickets[0].logs.count())
        self.assertEqual(len(response.data["broadcasts"]), self.tickets[0].broadcasts.count())

    @with_test_modules
    def test_archive_ticket(self):
        with self.subTest("fail without description"):
            response = self.client_post(self.api_url(self.tickets[0].pk, "archive"), data={
                "archived": True,
            })
            self.assertResponseStatus(400, response)

        with self.subTest("archive normally"):
            response = self.client_post(self.api_url(self.tickets[0].pk, "archive"), data={
                "archived": True,
                "description": "Because it bored me",
            })
            self.assertResponseOk(response)
            self.assertEqual(response.data["archived"], True)
            log = response.data["logs"][0]
            self.assertEqual(log["meta"]["description"], "Because it bored me")
            self.assertEqual(log["meta"].get("previous_archived"), False)
            self.assertEqual(log["meta"].get("next_archived"), True)
            self.assertEqual(log["author"]["username"], self.authority_user["username"])

        with self.subTest("archive a second time (noop)"):
            response = self.client_post(self.api_url(self.tickets[0].pk, "archive"), data={
                "archived": True,
                "description": "No reason",
            })
            self.assertResponseOk(response)
            self.assertEqual(response.data["archived"], True)
            log = response.data["logs"][0]
            self.assertNotEqual(log["meta"]["description"], "No reason")

        with self.subTest("unarchive normally"):
            response = self.client_post(self.api_url(self.tickets[0].pk, "archive"), data={
                "archived": False,
                "description": "Because I'm not bored anymore",
            })
            self.assertResponseOk(response)
            self.assertEqual(response.data["archived"], False)
            log = response.data["logs"][0]
            self.assertEqual(log["meta"]["description"], "Because I'm not bored anymore")
            self.assertEqual(log["meta"].get("previous_archived"), True)
            self.assertEqual(log["meta"].get("next_archived"), False)
            self.assertEqual(log["author"]["username"], self.authority_user["username"])

    @with_test_modules
    def test_list_broadcasts(self):
        response = self.client_get(self.api_url(self.tickets[0].pk, "broadcast"))
        self.assertResponseOk(response)
        self.assertEqual(response.data["count"], self.tickets[0].broadcasts.count())

    @with_test_modules
    def test_read_broadcast(self):
        response = self.client_get(self.api_url(
            self.tickets[0].pk,
            "broadcast",
            self.tickets[0].broadcasts.first().pk
        ))
        self.assertResponseOk(response)
        self.assertEqual(response.data["id"], self.tickets[0].broadcasts.first().pk)

    @with_test_modules
    def test_create_broadcast(self):
        response = self.client_post(
            self.api_url(self.tickets[0].pk, "broadcast"),
            {"handlers": [{"name": "testestest"}]},
        )
        self.assertResponseOk(response)
        self.assertEqual(
            response.data["id"],
            Broadcast.objects.filter(ticket=self.tickets[0]).first().pk,
        )

    def setup_manual_action(self):
        module = '_.ipsum.dolor'
        # close any ticket open in setup
        Ticket.objects.filter(module=module).update(state=Ticket.TicketState.CLOSED)
        # create new ticket to test on
        ticket = Ticket.objects.create(
            module=module,
            state='A',
            target=self.target_object
        )

        # run engine to update conditions
        engine.run(self.target_object, [module])
        ticket.refresh_from_db()
        self.assertTrue(len(ticket.close_conditions) > 0)
        self.assertTrue(len(ticket.archive_conditions) > 0)
        self.assertIn('B', ticket.escalate_conditions)
        return ticket, module

    @with_test_modules
    def test_create_authorization_request(self):
        ticket, module = self.setup_manual_action()

        with self.subTest('close'):
            # required authorizations (from _.ipsum.dolor definition)
            required_authorizations = [
                'ticket.A.close.authorization.miner-2',
                'ticket.A.close.authorization.miner-3',
                'ticket.A.close.authorization.authority-3',
            ]

            def execute_request():
                return self.client_post(
                    self.api_url(ticket.pk, "authorization"),
                    {"action": 'close'},
                )

            # Check whether there are no logs at the begining
            logs = TicketLog.objects.filter(ticket=ticket)
            self.assertEqual(len(logs), 0)

            # create first authorization
            response = execute_request()
            self.assertResponseOk(response)
            auth_request = AuthorizationRequest.objects.filter(ticket=ticket, id=response.data["id"]).first()
            self.assertIsNotNone(auth_request)

            self.assertEqual(auth_request.authorization, required_authorizations[0])
            self.assertEqual(auth_request.status, AuthorizationRequest.Status.PENDING)
            self.assertDictEqual(auth_request.created_by, serialize_author(self.authority_user_object))
            self.assertIsNotNone(auth_request.created_at)
            self.assertIsNone(auth_request.resolved_by)
            self.assertIsNone(auth_request.resolved_at)
            self.assertIsNone(auth_request.comment)

            # Check there is a new log entry related to the created request
            logs = TicketLog.objects.filter(ticket=ticket)
            self.assertEqual(len(logs), 1)
            self.assertEqual(logs.first().meta['description'], Rule.ActionDescription.REQUEST)

            # try to create again
            response = execute_request()
            # can not create again because of pending request
            self.assertResponseStatus(400, response)

            # Check there is no new log entry after trying to create the request again
            logs = TicketLog.objects.filter(ticket=ticket)
            self.assertEqual(len(logs), 1)

            # deny first request
            auth_request.status = AuthorizationRequest.Status.DENIED
            auth_request.save()

            # create and approve all three authorizations
            for authorization in required_authorizations:
                response = execute_request()
                self.assertResponseOk(response)
                auth_request = AuthorizationRequest.objects.get(id=response.data["id"])
                self.assertEqual(auth_request.authorization, authorization)

                # approve first request
                auth_request.status = AuthorizationRequest.Status.APPROVED
                auth_request.save()
                # run engine to update conditions
                engine.run(self.target_object, [module])

            # try to create a fourth request
            response = execute_request()
            # can not create because all possible request are already approved
            self.assertResponseStatus(400, response)

        with self.subTest('archive'):
            # create archive authorization
            response = self.client_post(
                self.api_url(ticket.pk, "authorization"),
                {"action": 'archive'},
            )
            self.assertResponseOk(response)
            auth_request = AuthorizationRequest.objects.filter(ticket=ticket, id=response.data["id"]).first()
            self.assertIsNotNone(auth_request)

            # required authorizations (from _.ipsum.dolor definition)
            self.assertEqual(auth_request.authorization, 'ticket.A.archive.authorization.authority-3')

        with self.subTest('escalate'):
            # create escalate authorization
            response = self.client_post(
                self.api_url(ticket.pk, "authorization"),
                {"action": 'escalate', "to_state": 'B'},
            )
            self.assertResponseOk(response)
            auth_request = AuthorizationRequest.objects.filter(ticket=ticket, id=response.data["id"]).first()
            self.assertIsNotNone(auth_request)

            # required authorizations (from _.ipsum.dolor definition)
            self.assertEqual(auth_request.authorization, 'ticket.A.escalate.B.authorization.miner-3')

        with self.subTest('invalid escalate state'):
            # to state None
            self.assertResponseStatus(400, self.client_post(
                self.api_url(ticket.pk, "authorization"),
                {"action": 'escalate'},
            ))

            # to state without conditions
            self.assertResponseStatus(400, self.client_post(
                self.api_url(ticket.pk, "authorization"),
                {"action": 'escalate', "to_state": 'C'},
            ))

            # to state invalid
            self.assertResponseStatus(400, self.client_post(
                self.api_url(ticket.pk, "authorization"),
                {"action": 'escalate', "to_state": 'a non existent level'},
            ))

        with self.subTest('action does not exists'):
            response = self.client_post(
                self.api_url(ticket.pk, "authorization"),
                {"action": "invalid action"},
            )
            self.assertResponseStatus(400, response)

        with self.subTest('saving generic state letter'):
            module = '_.ipsum.amet'
            # create new ticket to test on
            ticket = Ticket.objects.create(
                module=module,
                state='A1',
                target=self.target_object
            )
            # run engine to update conditions
            engine.run(self.target_object, [module])
            ticket.refresh_from_db()

            # create escalate authorization
            response = self.client_post(
                self.api_url(ticket.pk, "authorization"),
                {"action": 'escalate', "to_state": 'B'},
            )
            self.assertResponseOk(response)
            auth_request = AuthorizationRequest.objects.filter(ticket=ticket, id=response.data["id"]).first()
            self.assertIsNotNone(auth_request)
            # Authorization string must have a generic state A, instead of A1
            self.assertEqual(auth_request.authorization, 'ticket.A.escalate.B.authorization.miner-3')

            # Update ticket state to B1-1
            Ticket.objects.filter(module=module).update(state='B1-1')
            # run engine to update conditions
            engine.run(self.target_object, [module])
            ticket.refresh_from_db()
            # create another escalate authorization
            response = self.client_post(
                self.api_url(ticket.pk, "authorization"),
                {"action": 'escalate', "to_state": 'C'},
            )
            self.assertResponseOk(response)
            auth_request = AuthorizationRequest.objects.filter(ticket=ticket, id=response.data["id"]).first()
            self.assertIsNotNone(auth_request)
            # Authorization string must have a generic state B, instead of B1-1
            self.assertEqual(auth_request.authorization, 'ticket.B.escalate.C.authorization.miner-3')

    @with_test_modules
    @override_settings(STACK_IS_SML=True, SMC_BROKER_URL='smc-broker')
    @patch('remotes.dispatch.send_messages')
    def test_create_authorization_request_sml_sends_message(self, send_messages):
        ticket, module = self.setup_manual_action()

        # only authority authorizations required messages between sml-smc
        close_authorizations = [
            ('ticket.A.close.authorization.miner-2', False),
            ('ticket.A.close.authorization.miner-3', False),
            ('ticket.A.close.authorization.authority-3', True),
        ]

        # create and approve all three authorizations
        for authorization, should_send_message in close_authorizations:
            send_messages.reset_mock()
            response = self.client_post(
                self.api_url(ticket.pk, "authorization"),
                {"action": 'close'},
            )
            self.assertResponseOk(response)
            auth_request = AuthorizationRequest.objects.get(id=response.data["id"])
            self.assertEqual(auth_request.authorization, authorization)

            if should_send_message:
                # assert send_messages was called with execute intent command
                send_messages.assert_called_once()
                (messages, broker_url, broker_connection_ssl), _ = send_messages.call_args
                self.assertEqual(len(messages), 1)
                self.assertEqual(broker_url, 'smc-broker')
                self.assertEqual(messages[0].command, 'alerts.ticket.authorization.create')
                self.assertEqual(messages[0].body['id'], auth_request.id)
            else:
                send_messages.assert_not_called()

            # approve request
            auth_request.status = AuthorizationRequest.Status.APPROVED
            auth_request.save()
            # run engine to update conditions
            engine.run(self.target_object, [module])

    def assertUpdateRequest(self, ticket, url, comment, result_status, origin, docs):
        auth_request = AuthorizationRequest.objects.create(
            id=f'random_id-{secrets.token_urlsafe(8)}',
            ticket=ticket,
            authorization='ticket.A.close.authorization.authority-3',
            origin=origin
        )
        response = self.client.post(
            self.api_url(ticket.pk, "authorization", auth_request.pk, url),
            {
                "comment": comment,
                **{doc.name: doc.file for doc in docs}
            }
        )
        self.assertResponseOk(response)
        auth_request.refresh_from_db()
        self.assertEqual(auth_request.status, result_status)
        self.assertEqual(auth_request.comment, comment)
        self.assertEqual(auth_request.resolved_by, serialize_author(self.authority_user_object))
        ticket.refresh_from_db()
        return auth_request

    @patch('remotes.dispatch.send_messages')
    def assertUpdateRequestFromSMC(self, ticket, url, comment, docs, result_status, send_messages):
        target = ticket.target
        target.remote = Remote.objects.create(namespace='sml_namespace', exchange='sml_exchange', bucket='sml_bucket')
        target.save()

        auth_request = self.assertUpdateRequest(ticket, url, comment, result_status, 'sml_namespace', docs)

        send_messages.assert_called_once()
        (messages, broker_url, broker_connection_ssl), _ = send_messages.call_args
        self.assertEqual(len(messages), 1)
        self.assertEqual(messages[0].command, 'alerts.ticket.authorization.update')
        self.assertEqual(messages[0].body['id'], auth_request.id)
        self.assertEqual(messages[0].body['status'], auth_request.status)
        self.assertEqual(messages[0].body['comment'], auth_request.comment)
        self.assertDictEqual(messages[0].body['resolved_by'], auth_request.resolved_by)
        self.assertEqual(messages[0].exchange, target.remote.exchange)
        self.assertEqual(broker_url, 'smc_broker')

    @with_test_modules
    @override_settings(STACK_IS_SML=True)
    @with_fake_docs(count=3)
    def test_approve_authorization_request(self, docs):
        ticket, _ = self.setup_manual_action()
        self.assertFalse(ticket.close_conditions[2]['complete'])
        self.assertUpdateRequest(ticket, "approve", "a comment", AuthorizationRequest.Status.APPROVED, 'origin', docs)
        self.assertTrue(ticket.close_conditions[2]['complete'])

        # Check there is a new log entry with the positive resolution
        logs = TicketLog.objects.filter(ticket=ticket)
        self.assertEqual(len(logs), 1)
        self.assertEqual(logs.first().meta['description'], Rule.ActionDescription.AUTHORIZATION)
        self.assertEqual(logs.first().meta['status'], AuthorizationRequest.Status.APPROVED)
        self.assertEqual(logs.first().meta['comment'], "a comment")
        self.assertEqual(logs.first().documents.count(), 3)

    @with_test_modules
    @override_settings(STACK_IS_SML=False, BROKER_URL='smc_broker', NAMESPACE='smc_namespace')
    @patch('documents.utils.upload_doc')
    @with_fake_docs(count=8)
    def test_approve_authorization_smc_request(self, upload_doc, docs):
        upload_doc.return_value = True
        ticket, _ = self.setup_manual_action()
        self.assertUpdateRequestFromSMC(ticket, "approve", "a comment", docs[1:4], AuthorizationRequest.Status.APPROVED)
        self.assertEqual(upload_doc.call_count, 3)
        doc_names = [doc.name for doc in docs[1:4]]
        for call in upload_doc.call_args_list:
            # call == ((doc, s3, bucket, file_path), ())
            self.assertEqual(len(call[0]), 4)
            self.assertIn(call[0][0].name, doc_names)
            self.assertEqual(call[0][2], get_ticket_bucket(ticket))
        # false after approval because update has to be done in SML
        self.assertFalse(ticket.close_conditions[2]['complete'])

    @with_test_modules
    @override_settings(STACK_IS_SML=True)
    @with_fake_docs(count=3)
    def test_deny_authorization_request(self, docs):
        ticket, _ = self.setup_manual_action()
        self.assertUpdateRequest(ticket, "deny", "denied comment", AuthorizationRequest.Status.DENIED, 'origin', docs)
        self.assertFalse(ticket.close_conditions[2]['complete'])

        # Check there is a new log entry with the negative resolution
        logs = TicketLog.objects.filter(ticket=ticket)
        self.assertEqual(len(logs), 1)
        self.assertEqual(logs.first().meta['description'], Rule.ActionDescription.AUTHORIZATION)
        self.assertEqual(logs.first().meta['status'], AuthorizationRequest.Status.DENIED)
        self.assertEqual(logs.first().meta['comment'], "denied comment")
        self.assertEqual(logs.first().documents.count(), 3)

    @with_test_modules
    @override_settings(STACK_IS_SML=False, BROKER_URL='smc_broker', NAMESPACE='smc_namespace')
    def test_deny_authorization_smc_request(self):
        ticket, _ = self.setup_manual_action()
        self.assertUpdateRequestFromSMC(ticket, "deny", "denied comment", [], AuthorizationRequest.Status.DENIED)
        self.assertFalse(ticket.close_conditions[2]['complete'])

    @with_test_modules
    def test_list_logs(self):
        response = self.client_get(self.api_url(self.tickets[0].pk, "log"))
        self.assertResponseOk(response)
        self.assertEqual(response.data["count"], self.tickets[0].logs.count())

    @with_test_modules
    def test_read_log(self):
        response = self.client_get(self.api_url(
            self.tickets[0].pk,
            "log",
            self.tickets[0].logs.first().pk,
        ))
        self.assertResponseOk(response)
        self.assertEqual(response.data["id"], self.tickets[0].logs.first().pk)

    @with_test_modules
    @with_fake_docs(count=5)
    def test_create_log(self, docs):
        ticket = self.tickets[0]

        with self.subTest("without documents"):
            response = self.client_post(
                self.api_url(self.tickets[0].pk, "log"),
                {"message": "Test without documents"},
            )
            self.assertResponseOk(response)
            log = TicketLog.objects.filter(ticket=ticket).first()
            self.assertNotEqual(log, None)
            self.assertEqual(response.data["id"], log.pk)
            self.assertEqual(log.documents.count(), 0)

        with self.subTest("with documents"):
            response = self.client_post(
                self.api_url(self.tickets[0].pk, "log"),
                {
                    **{doc.name: doc.file for doc in docs[0:3]},
                    "message": "Test with documents",
                },
                format='multipart'
            )
            self.assertResponseOk(response)
            log = TicketLog.objects.filter(ticket=ticket).first()
            self.assertIsNotNone(log)
            self.assertEqual(response.data["id"], log.pk)
            self.assertEqual(log.documents.count(), 3)

    @with_test_modules
    def test_read_all_authorization_requests(self):
        auth_requests = [
            AuthorizationRequest.objects.create(
                id=f'random_id-{secrets.token_urlsafe(8)}',
                ticket=self.tickets[0],
                authorization='ticket.A.close.authorization.authority-3',
                origin='origin'
            ),
            AuthorizationRequest.objects.create(
                id=f'random_id-{secrets.token_urlsafe(8)}',
                ticket=self.tickets[1],
                authorization='ticket.B.archive.authorization.miner-1',
                origin='origin'
            ),
            AuthorizationRequest.objects.create(
                id=f'random_id-{secrets.token_urlsafe(8)}',
                ticket=self.tickets[2],
                authorization='ticket.A.escalate.authorization.authority-2',
                origin='origin'
            )
        ]
        response = self.client_get(f'/api/{self.api_version}/ticket-requests/')
        self.assertResponseOk(response)
        self.assertEqual(len(response.data["results"]), len(auth_requests))

import secrets
import tempfile
from pathlib import Path
from unittest.mock import patch

from django.test import override_settings

from alerts.collector import target_controllers
from alerts.models import Ticket, ContributingDocument
from alerts.tests.base import with_test_modules
from api.tests.base import BaseTestCase
from api.v1.serializers.user_serializers import serialize_author
from remotes.models import Remote
from targets.models import DataSourceGroup


class StatusViewTestCase(BaseTestCase):

    @with_test_modules
    def setUp(self):
        self.g1 = DataSourceGroup.objects.create(
            target=self.target_object,
            name=f"test-group-1-{secrets.token_urlsafe(4)}",
        )
        self.g2 = DataSourceGroup.objects.create(
            target=self.target_object,
            name=f"test-group-2-{secrets.token_urlsafe(4)}",
        )
        self.controllers = target_controllers(self.target_object)

    def api_url(self, *suffixes):
        prefix = f"/api/{self.api_version}/target/{self.target}/status"
        url = "/".join([
            prefix,
            *suffixes
        ])
        return url + ("" if url.endswith("/") else "/")

    def assert_status_well_formed(self, response):
        self.assertIn("result_state", response.data)
        self.assertIn("status", response.data)
        self.assertIn("level", response.data["result_state"])
        self.assertIn("short_message", response.data["result_state"])
        self.assertIn("message", response.data["result_state"])
        self.assertTrue(isinstance(response.data["status"], (list, tuple)))
        self.assertEqual(
            response.data["result_state"]["level"],
            max([0, *(
                s["result_state"]["level"]
                for s in response.data["status"]
                if s["ticket"] is None
                or s["ticket"]["evaluable"]
            )]),
        )

    @with_test_modules
    def test_status_list_without_tickets(self):
        self.as_authority()
        response = self.client_get(self.api_url())
        self.assertResponseOk(response)
        self.assert_status_well_formed(response)
        self.assertEqual(len(response.data["status"]), len(self.controllers.keys()))
        response_filtered = self.client_get(self.api_url(), {"group": "foobar"})
        self.assertResponseOk(response_filtered)
        self.assert_status_well_formed(response_filtered)
        self.assertEqual(
            len(response_filtered.data["status"]),
            len([
                c
                for c in self.controllers.values()
                if "foobar" in c.visibility_groups
            ])
        )
        response_filtered_no_match = self.client_get(self.api_url(), {"group": "unmatched"})
        self.assertResponseOk(response_filtered_no_match)
        self.assert_status_well_formed(response_filtered_no_match)

    @with_test_modules
    def test_status_list_with_tickets(self):
        controllers = iter(self.controllers.values())
        controller1, controller2 = next(controllers), next(controllers)
        Ticket.objects.create(
            module=controller1.module,
            target=self.target_object,
            state=list(controller1.states)[0]
        )
        # not evaluable ticket, shouldn't be considered in the summary
        Ticket.objects.create(
            module=controller2.module,
            target=self.target_object,
            state=list(controller2.states)[-1],
            evaluable=False,
            result_state={"level": 1000, "short_message": "test"},
        )
        self.as_authority()
        response = self.client_get(self.api_url())
        self.assertResponseOk(response)
        self.assert_status_well_formed(response)
        self.assertEqual(len(response.data["status"]), len(self.controllers.keys()))
        self.assertNotEqual(
            next((t["ticket"] for t in response.data["status"] if t["module"] == controller1.module), None),
            None,
        )
        self.assertNotEqual(
            next((t["ticket"] for t in response.data["status"] if t["module"] == controller2.module), None),
            None,
        )
        self.assertEqual(response.data["result_state"]["level"], 0)

    @with_test_modules
    def test_status_detail(self):
        controller = next(iter(self.controllers.values()))
        Ticket.objects.create(
            module=controller.module,
            target=self.target_object,
            state=list(controller.states)[0]
        )
        self.as_authority()
        response = self.client_get(self.api_url(controller.module))
        self.assertResponseOk(response)

    @with_test_modules
    def test_create_intent(self):
        module = "_.foo"
        ticket = Ticket.objects.create(
            module=module,
            target=self.target_object,
            state="A"
        )
        self.as_authority()
        response = self.client_post(self.api_url(module, "intent"), {
            "state": Ticket.TicketState.CLOSED,
        })
        self.assertResponseOk(response)
        self.assertIsNotNone(response.data["intent"].get("attended_at", None))
        self.assertEqual(next((t["id"] for t in response.data["tickets"]), None), ticket.id)

    @override_settings(NAMESPACE='not_ticket_origin', STACK_IS_SML=False, BROKER_URL='smc_broker')
    @with_test_modules
    @patch('remotes.dispatch.send_messages')
    def test_create_intent_for_other_origin_sends_message(self, send_messages):
        # create remote for target
        remote = Remote.objects.create(
            namespace="remote_ticket_origin",
            exchange="federated.remote_ticket_origin",
            bucket="test_bucket"
        )
        remote.targets.add(self.target_object)
        module = "_.foo"
        Ticket.objects.create(
            module=module,
            target=self.target_object,
            state="A",
            origin=remote.namespace
        )
        self.as_authority()
        user = self.authority_user_object
        # request ticket escalation
        content = {
            "state": "B",
        }
        response = self.client_post(self.api_url(module, "intent"), content)
        self.assertResponseOk(response)
        intent = response.data["intent"]
        # ticket is marked as attended so it is ignored by local e&a engine
        self.assertIsNotNone(intent.get("attended_at", None))
        self.assertIsNone(intent.get("attended_by_destination_at", None))
        self.assertIsNotNone(intent.get("sent_to_destination_at", None))
        self.assertEqual(intent.get("issue", None), "")
        # no ticket was modified
        self.assertEqual(response.data["tickets"], [])
        # assert send_messages was called with execute intent command
        send_messages.assert_called_once()
        (messages, broker_url, broker_connection_ssl), _ = send_messages.call_args
        self.assertEqual(broker_url, 'smc_broker')
        self.assertEqual(len(messages), 1)
        msg = messages[0]
        self.assertEqual(msg.exchange, remote.exchange)
        self.assertEqual(msg.command, 'alerts.ticket.intent')
        self.assertEqual(msg.body['id'], intent.get("id"))
        self.assertEqual(msg.body['module'], module)
        self.assertEqual(msg.body['target__canonical_name'], self.target_object.canonical_name)
        self.assertDictEqual(msg.body['content'], content)
        self.assertDictEqual(msg.body['serialized_user'], serialize_author(user))

    @with_test_modules
    def test_upload_document(self):
        controller = next(iter(self.controllers.values()))
        self.as_authority()
        with tempfile.NamedTemporaryFile() as f:
            f.write(b"testestest")
            f.flush()
            f.seek(0)
            response = self.client_post(
                self.api_url(controller.module, "document", "upload"),
                {"file": f, "filename": Path(f.name).name},
                format="multipart",
            )
        self.assertResponseOk(response)
        self.assertTrue(ContributingDocument.objects.filter(
            target=self.target_object,
            document__pk=response.data["id"],
            module=controller.module,
        ).exists())

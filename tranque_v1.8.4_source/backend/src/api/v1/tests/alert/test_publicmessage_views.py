from alerts.models import PublicAlertMessage
from alerts.tests.base import with_test_modules
from api.tests.base import BaseTestCase

import datetime


class PublicMessageViewTestCase(BaseTestCase):

    def api_url(self, *suffixes):
        prefix = f"/api/{self.api_version}/target/{self.target}/publicmessage"
        url = "/".join([
            prefix,
            *suffixes
        ])
        return url + ("" if url.endswith("/") else "/")

    @with_test_modules
    def setUp(self):
        self.publicMessages = []
        pm1 = PublicAlertMessage.objects.create(
            target=self.target_object,
            scope="ef",
            alert_type="RED",
            content="Mensaje público",
            created_by="message-adder",
            created_at=datetime.datetime.now()
        )
        self.publicMessages.append(pm1)

        pm2 = PublicAlertMessage.objects.create(
            target=self.target_object,
            scope="emac",
            alert_type="YELLOW",
            content="Mensaje público",
            created_by="message-adder",
            created_at=datetime.datetime.now()
        )
        self.publicMessages.append(pm2)

        pm3 = PublicAlertMessage.objects.create(
            target=self.target_object,
            scope="ef",
            alert_type="GREEN",
            content="Mensaje público",
            created_by="message-adder",
            created_at=datetime.datetime.now()
        )
        self.publicMessages.append(pm3)

        pm4 = PublicAlertMessage.objects.create(
            target=self.target_object,
            scope="emac",
            alert_type="GRAY",
            content="Mensaje público",
            created_by="message-adder",
            created_at=datetime.datetime.now()
        )
        self.publicMessages.append(pm4)

    @with_test_modules
    def test_publicmessage_list(self):
        self.as_authority()

        response = self.client_get(self.api_url())
        self.assertResponseOk(response)
        self.assertEqual(response.data["count"], len(self.publicMessages))

        response_filtered_scope_ef = self.client_get(self.api_url(), {"scope": "ef"})
        self.assertResponseOk(response_filtered_scope_ef)
        self.assertEqual(
            response_filtered_scope_ef.data["count"],
            len(list(filter(lambda x: x.scope == "ef", self.publicMessages)))
        )

        response_filtered_scope_emac = self.client_get(self.api_url(), {"scope": "emac"})
        self.assertResponseOk(response_filtered_scope_emac)
        self.assertEqual(
            response_filtered_scope_emac.data["count"],
            len(list(filter(lambda x: x.scope == "emac", self.publicMessages)))
        )

        response_filtered_scope_nomatch = self.client_get(self.api_url(), {"scope": "lorem"})
        self.assertResponseOk(response_filtered_scope_nomatch)
        self.assertEqual(
            response_filtered_scope_nomatch.data["count"],
            len(list(filter(lambda x: x.scope == "lorem", self.publicMessages)))
        )

        response_filtered_alert_type_red = self.client_get(self.api_url(), {"alert_type": "RED"})
        self.assertResponseOk(response_filtered_alert_type_red)
        self.assertEqual(
            response_filtered_alert_type_red.data["count"],
            len(list(filter(lambda x: x.alert_type == "RED", self.publicMessages)))
        )

        response_filtered_alert_type_yellow = self.client_get(self.api_url(), {"alert_type": "YELLOW"})
        self.assertResponseOk(response_filtered_alert_type_yellow)
        self.assertEqual(
            response_filtered_alert_type_yellow.data["count"],
            len(list(filter(lambda x: x.alert_type == "YELLOW", self.publicMessages)))
        )

        response_filtered_alert_type_green = self.client_get(self.api_url(), {"alert_type": "GREEN"})
        self.assertResponseOk(response_filtered_alert_type_green)
        self.assertEqual(
            response_filtered_alert_type_green.data["count"],
            len(list(filter(lambda x: x.alert_type == "GREEN", self.publicMessages)))
        )

        response_filtered_alert_type_gray = self.client_get(self.api_url(), {"alert_type": "GRAY"})
        self.assertResponseOk(response_filtered_alert_type_gray)
        self.assertEqual(
            response_filtered_alert_type_gray.data["count"],
            len(list(filter(lambda x: x.alert_type == "GRAY", self.publicMessages)))
        )

        response_filtered_alert_type_nomatch = self.client_get(self.api_url(), {"alert_type": "GrEllow"})
        self.assertResponseOk(response_filtered_alert_type_nomatch)
        self.assertEqual(
            response_filtered_alert_type_nomatch.data["count"],
            len(list(filter(lambda x: x.alert_type == "GrEllow", self.publicMessages)))
        )

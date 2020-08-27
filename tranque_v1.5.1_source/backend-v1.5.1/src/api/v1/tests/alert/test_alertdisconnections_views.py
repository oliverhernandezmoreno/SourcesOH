from alerts.models import AlertDisconnection
from alerts.tests.base import with_test_modules
from api.tests.base import BaseTestCase

import datetime


class TargetAlertDisconnectionsViewTestCase(BaseTestCase):

    def api_url(self, *suffixes):
        prefix = f"/api/{self.api_version}/target/{self.target}/disconnection"
        url = "/".join([
            prefix,
            *suffixes
        ])
        return url + ("" if url.endswith("/") else "/")

    @with_test_modules
    def setUp(self):
        self.alertDisconnections = []
        ad1 = AlertDisconnection.objects.create(
            target=self.target_object,
            scope="ef",
            comment="Justificación de desconexión de alerta",
            created_by="message-adder",
            created_at=datetime.datetime.now()
        )
        self.alertDisconnections.append(ad1)

        ad2 = AlertDisconnection.objects.create(
            target=self.target_object,
            scope="emac",
            comment="Justificación de desconexión de alerta",
            created_by="message-adder",
            created_at=datetime.datetime.now()
        )
        self.alertDisconnections.append(ad2)

    @with_test_modules
    def test_alertdisconnection_list(self):
        self.as_authority()

        response = self.client_get(self.api_url())
        self.assertResponseOk(response)
        self.assertEqual(response.data["count"], len(self.alertDisconnections))

        response_filtered = self.client_get(self.api_url(), {"scope": "ef"})
        self.assertResponseOk(response_filtered)
        self.assertEqual(
            response_filtered.data["count"],
            len(list(filter(lambda x: x.scope == 'ef', self.alertDisconnections)))
        )

        response_filtered_nomatch = self.client_get(self.api_url(), {"scope": "lorem"})
        self.assertResponseOk(response_filtered_nomatch)
        self.assertEqual(
            response_filtered_nomatch.data["count"],
            len(list(filter(lambda x: x.scope == 'lorem', self.alertDisconnections)))
        )

    @with_test_modules
    def test_alert_connection(self):
        response = self.client_put(
            self.api_url(self.alertDisconnections[0].pk),
            {"closed": True}
        )
        self.assertResponseOk(response)
        updatedAlertDisconnection = AlertDisconnection.objects.get(id=self.alertDisconnections[0].pk)
        self.assertEqual(response.data["closed"], updatedAlertDisconnection.closed)

    @with_test_modules
    def test_read_ticket(self):
        responseEF = self.client_get(self.api_url(self.alertDisconnections[0].pk))
        self.assertResponseOk(responseEF)
        self.assertEqual(responseEF.data["scope"], self.alertDisconnections[0].scope)
        responseEMAC = self.client_get(self.api_url(self.alertDisconnections[1].pk))
        self.assertResponseOk(responseEMAC)
        self.assertEqual(responseEMAC.data["scope"], self.alertDisconnections[1].scope)

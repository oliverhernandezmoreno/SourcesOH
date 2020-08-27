from alerts.models import AlertDisconnection
from alerts.tests.base import with_test_modules
from api.tests.base import BaseTestCase

import datetime


class AlertDisconnectionsViewTestCase(BaseTestCase):

    def api_url(self, *suffixes):
        prefix = f"/api/{self.api_version}/disconnections"
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

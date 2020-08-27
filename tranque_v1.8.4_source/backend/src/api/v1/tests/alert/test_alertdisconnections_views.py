import tempfile
import datetime

from alerts.models import AlertDisconnection
from alerts.tests.base import with_test_modules
from api.tests.base import BaseTestCase
from documents.tests.utils import with_fake_docs


class TargetAlertDisconnectionsViewTestCase(BaseTestCase):

    def api_url(self, *suffixes):
        prefix = f"/api/{self.api_version}/target/{self.target}/disconnection"
        url = "/".join([
            prefix,
            *suffixes
        ])
        return url + ("" if url.endswith("/") else "/")

    @with_test_modules
    @with_fake_docs(count=3)
    def setUp(self, docs):
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

        for doc in docs:
            ad1.documents.add(doc)
            ad2.documents.add(doc)

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
        self.as_authority()
        response = self.client_put(
            self.api_url(self.alertDisconnections[0].pk),
            {"closed": True}
        )
        self.assertResponseOk(response)
        updatedAlertDisconnection = AlertDisconnection.objects.get(id=self.alertDisconnections[0].pk)
        self.assertEqual(response.data["closed"], updatedAlertDisconnection.closed)

    @with_test_modules
    def test_read_disconnection(self):
        self.as_authority()
        responseEF = self.client_get(self.api_url(self.alertDisconnections[0].pk))
        self.assertResponseOk(responseEF)
        self.assertEqual(responseEF.data["scope"], self.alertDisconnections[0].scope)
        responseEMAC = self.client_get(self.api_url(self.alertDisconnections[1].pk))
        self.assertResponseOk(responseEMAC)
        self.assertEqual(responseEMAC.data["scope"], self.alertDisconnections[1].scope)

    @with_test_modules
    def test_disconnection_document_upload(self):
        self.as_authority()
        initialDocsLen = len(self.alertDisconnections[0].documents.all())
        with tempfile.NamedTemporaryFile() as f:
            f.write(b"testestest")
            f.flush()
            f.seek(0)
            response = self.client_post(
                self.api_url(self.alertDisconnections[0].pk, "document", "upload"),
                data={"file": f, "filename": "testfile.txt"},
                format="multipart"
            )
            self.assertResponseOk(response)
            self.assertEqual(initialDocsLen+1, len(self.alertDisconnections[0].documents.all()))

    @with_test_modules
    def test_disconnection_document_list(self):
        self.as_authority()
        response = self.client_get(self.api_url())
        self.assertResponseOk(response)
        self.assertEqual(
            len(response.data['results'][0]['documents']),
            len(self.alertDisconnections[0].documents.all())
        )
        self.assertEqual(
            len(response.data['results'][1]['documents']),
            len(self.alertDisconnections[1].documents.all())
        )

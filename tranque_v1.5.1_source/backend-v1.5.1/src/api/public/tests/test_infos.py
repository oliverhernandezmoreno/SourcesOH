from api.tests.base import BaseTestCase
from infos.models import SiteParameter


class InfoViewTestCase(BaseTestCase):

    def test_list(self):
        response = self.client_get(f"/api/{self.api_version}/info/")
        self.assertResponseOk(response)


class SiteParameterViewTestCase(BaseTestCase):

    def test_list(self):
        SiteParameter.objects.create(name='param1', value='value1')
        SiteParameter.objects.create(name='param2', value='value2')

        response = self.client_get(f"/api/{self.api_version}/site-parameter/")
        self.assertResponseOk(response)

        self.assertIn('param1', response.data)
        self.assertEqual(response.data['param1'], 'value1')

        self.assertIn('param2', response.data)
        self.assertEqual(response.data['param2'], 'value2')

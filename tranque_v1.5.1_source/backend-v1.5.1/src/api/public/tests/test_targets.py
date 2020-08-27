from api.tests.base import BaseTestCase
from targets.models import Target
from targets.models import Zone


class TargetViewTestCase(BaseTestCase):

    def test_filter_zone(self):
        response = self.client_get(
            f"/api/{self.api_version}/target/",
            {"zone": "lOs ViLoS"},
        )
        self.assertResponseOk(response)
        self.assertTrue(response.data["results"])
        zone = Zone.objects.get(canonical_name="los-vilos")
        self.assertTrue(all(
            result["zone"] == zone.id
            for result in response.data["results"]
        ))

    def test_retrieve(self):
        canonical_name = Target.objects.values("canonical_name").first()["canonical_name"]
        response = self.client_get(f"/api/{self.api_version}/target/{canonical_name}/")
        self.assertResponseOk(response)

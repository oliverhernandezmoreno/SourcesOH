from api.tests.base import BaseTestCase
from targets.models import Zone


class TestZones(BaseTestCase):

    def test_zone_hierarchy(self):
        for z in Zone.objects.all().only("id", "natural_name", "parent_id"):
            hierarchy = reversed(z.zone_hierarchy().values("id", "parent_id"))
            zones = [{"id": z.id, "parent_id": z.parent_id}, *hierarchy]
            self.assertTrue(all(
                child["parent_id"] == parent["id"]
                for child, parent in zip(zones[:-1], zones[1:])
            ))

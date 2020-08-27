from api.tests.base import BaseTestCase
from targets.profiling.base import N, V


class TemplateEndpointTestCase(BaseTestCase):

    def setUp(self):
        from targets.profiling import FOREST
        FOREST["test/template/test-1"] = N(
            inputs=(),
            value=V(
                name="test 1",
                canonical_name="test.template.test-1",
                category="test-category-1",
                description=None,
                highlight=True,
                type="raw",
                space_coords=None,
                choices=None,
                unit=None,
                x_unit=None,
                y_unit=None,
                z_unit=None,
                script=None,
                script_version=None,
                range_gte=None,
                range_gt=None,
                range_lte=None,
                range_lt=None,
                thresholds=None,
                scope=None,
                groups=None,
                frequencies=None,
                meta=None,
            ),
        )
        FOREST["test/template/test-2"] = N(
            inputs=(),
            value=V(
                name="test 2",
                canonical_name="test.template.test-2",
                category="test-category-2",
                description=None,
                highlight=True,
                type="raw",
                space_coords=None,
                choices=None,
                unit=None,
                x_unit=None,
                y_unit=None,
                z_unit=None,
                script=None,
                script_version=None,
                range_gte=None,
                range_gt=None,
                range_lte=None,
                range_lt=None,
                thresholds=None,
                scope=None,
                groups=None,
                frequencies=None,
                meta=None,
            ),
        )
        FOREST["test/template/test-3"] = N(
            inputs=(),
            value=V(
                name="test 3",
                canonical_name="test.template.test-3",
                category="test-category-2",
                description=None,
                highlight=True,
                type="raw",
                space_coords=None,
                choices=None,
                unit=None,
                x_unit=None,
                y_unit=None,
                z_unit=None,
                script=None,
                script_version=None,
                range_gte=None,
                range_gt=None,
                range_lte=None,
                range_lt=None,
                thresholds=None,
                scope=None,
                groups=None,
                frequencies=None,
                meta=None,
            ),
        )

    def test_filter_templates(self):
        response = self.client_get(f"/api/{self.api_version}/template/")
        self.assertResponseOk(response)
        self.assertNotEqual(response.data["count"], 0)
        response = self.client_get(f"/api/{self.api_version}/template/", {"category": "non-existent"})
        self.assertResponseOk(response)
        self.assertEqual(response.data["count"], 0)
        response = self.client_get(f"/api/{self.api_version}/template/", {"category": "test-category-1"})
        self.assertResponseOk(response)
        self.assertEqual(response.data["count"], 1)
        response = self.client_get(f"/api/{self.api_version}/template/", {"category": "test-category-2"})
        self.assertResponseOk(response)
        self.assertEqual(response.data["count"], 2)

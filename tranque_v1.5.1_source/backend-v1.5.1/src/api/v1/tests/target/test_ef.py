import math
import secrets

from api.tests.base import BaseTestCase
from api.v1.serializers.ef_serializers import EFProfilePiezometerSerializer, EFTopographyProfileSerializer
from targets import elastic
from targets.models import Target, TargetType, TargetState, Timeseries, DataSource, DataSourceGroup


class TopographyProfileTestCase(BaseTestCase):

    # some markers to easily distinguish events
    PI = 3.1415
    E = 2.71828
    PHI = 1.61803

    def setUp(self):
        self.test_target = Target.objects.create(
            name="Test",
            canonical_name=f"test-{secrets.token_urlsafe(6)}",
            type=TargetType.objects.first(),
            state=TargetState.objects.first(),
        )
        profiles_group = DataSourceGroup.objects.create(
            target=self.test_target,
            canonical_name=EFTopographyProfileSerializer.GROUP_CANONICAL_NAME,
            name="Perfil transversal",
        )
        piezometers_group = DataSourceGroup.objects.create(
            target=self.test_target,
            canonical_name=EFProfilePiezometerSerializer.GROUP_CANONICAL_NAME,
            name="Piezómetros",
        )
        self.timeseries = []
        self.profiles = [
            DataSource.objects.create(
                hardware_id=f"perfil-{secrets.token_urlsafe(6)}",
                name="Perfil test 1",
                canonical_name="perfil-1",
                target=self.test_target,
            ),
            DataSource.objects.create(
                hardware_id=f"perfil-{secrets.token_urlsafe(6)}",
                name="Perfil test 2",
                canonical_name="perfil-2",
                target=self.test_target,
            ),
        ]
        for p in self.profiles:
            p.groups.set([profiles_group])
            for template in EFTopographyProfileSerializer.TEMPLATE_NAMES:
                canonical_name = f"ts-{secrets.token_urlsafe(6)}"
                self.timeseries.append(Timeseries.objects.create(
                    name=f"Test {secrets.token_urlsafe(6)}",
                    canonical_name=canonical_name,
                    template_name=template,
                    target=self.test_target,
                    data_source=p
                ))
                elastic.bulk_index([{
                    "name": canonical_name,
                    "value": self.PI,
                    "@timestamp": "2000-01-01T00:00:00.000Z",
                    "coords": {"x": 5},
                    "meta": {"coordinates": [1, 1, 2, 2]}
                }, {
                    "name": canonical_name,
                    "value": self.PI,
                    "@timestamp": "2000-01-01T00:00:00.000Z",
                    "coords": {"x": 10},
                    "meta": {"coordinates": [1, 1, 2, 2]}
                }], refresh="wait_for")

        self.piezometers = [
            DataSource.objects.create(
                hardware_id=f"pz-{secrets.token_urlsafe(6)}",
                name="PZ1",
                canonical_name="pz-1",
                target=self.test_target,
                # forms an isosceles right triangle: expect the
                # projected coordinate to be at 10 / sqrt(2) - sqrt(2)
                coords={'x': 10, 'y': 0}
            ),
            DataSource.objects.create(
                hardware_id=f"pz-{secrets.token_urlsafe(6)}",
                name="PZ2",
                canonical_name="pz-2",
                target=self.test_target,
                # forms an isosceles right triangle: expect the
                # projected coordinate to be at -(20 / sqrt(2) + sqrt(2))
                coords={'x': -20, 'y': 0}
            ),
        ]
        for pz in self.piezometers:
            pz.groups.set([piezometers_group])
            for template in EFProfilePiezometerSerializer.TEMPLATE_NAMES:
                canonical_name = f"ts-{secrets.token_urlsafe(6)}"
                self.timeseries.append(Timeseries.objects.create(
                    name=f"Test {secrets.token_urlsafe(6)}",
                    canonical_name=canonical_name,
                    template_name=template,
                    target=self.test_target,
                    data_source=pz,
                ))
                elastic.bulk_index([{
                    "name": canonical_name,
                    "value": self.E,
                    "@timestamp": "2000-01-01T00:00:00.000Z"
                }, {
                    "name": canonical_name,
                    "value": self.PHI,
                    "@timestamp": "2001-01-01T00:00:00.000Z"
                }], refresh="wait_for")

        self.as_superuser()

    def test_proper_coordinates_projection(self):
        with self.subTest("without date_to parameter"):
            response = self.client_get(
                f"/api/{self.api_version}"
                f"/target/{self.test_target.canonical_name}"
                f"/ef/topography-profile/{self.profiles[0].id}/"
            )
            self.assertResponseOk(response)

            projected_source_pz_1 = next(
                source
                for source in response.data["projected_sources"]
                if source["name"] == "PZ1"
            )
            event_pz_1 = projected_source_pz_1["timeseries"][0]["events"][0]
            self.assertEqual(event_pz_1["value"], self.PHI)
            self.assertAlmostEqual(event_pz_1["coords"]["x"], 4 * math.sqrt(2))

            projected_source_pz_2 = next(
                source
                for source in response.data["projected_sources"]
                if source["name"] == "PZ2"
            )
            event_pz_2 = projected_source_pz_2["timeseries"][0]["events"][0]
            self.assertEqual(event_pz_2["value"], self.PHI)
            self.assertAlmostEqual(event_pz_2["coords"]["x"], -11 * math.sqrt(2))

        with self.subTest("with a date_to parameter"):
            response = self.client_get(
                f"/api/{self.api_version}"
                f"/target/{self.test_target.canonical_name}"
                f"/ef/topography-profile/{self.profiles[1].id}/",
                {"date_to": "2000-06-01T00:00:00.000Z"}
            )
            self.assertResponseOk(response)

            projected_source_pz_1 = next(
                source
                for source in response.data["projected_sources"]
                if source["name"] == "PZ1"
            )
            event_pz_1 = projected_source_pz_1["timeseries"][0]["events"][0]
            self.assertEqual(event_pz_1["value"], self.E)
            self.assertAlmostEqual(event_pz_1["coords"]["x"], 4 * math.sqrt(2))

            projected_source_pz_2 = next(
                source
                for source in response.data["projected_sources"]
                if source["name"] == "PZ2"
            )
            event_pz_2 = projected_source_pz_2["timeseries"][0]["events"][0]
            self.assertEqual(event_pz_2["value"], self.E)
            self.assertAlmostEqual(event_pz_2["coords"]["x"], -11 * math.sqrt(2))

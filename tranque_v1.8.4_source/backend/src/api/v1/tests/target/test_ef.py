import math
import secrets
import decimal

from api.tests.base import BaseTestCase
from api.v1.serializers.ef_serializers import (
    EFProfilePiezometerSerializer,
    EFTopographyProfileSerializer
)
from api.v1.serializers.ef_serializers import (
    EFDepthDeformationSerializer,
    EFInclinometerPointDeformationSerializer
)
from targets import elastic
from targets.models import (
    Target,
    TargetType,
    TargetState,
    Timeseries,
    Threshold,
    DataSource,
    DataSourceGroup
)


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


class DeformationProfileTestCase(BaseTestCase):
    # python manage.py test --keepdb -v 2 api.v1.tests.target.test_ef.DeformationProfileTestCase

    def setUp(self):
        self.test_target = Target.objects.create(
            name="Test",
            canonical_name=f"test-{secrets.token_urlsafe(6)}",
            type=TargetType.objects.first(),
            state=TargetState.objects.first(),
        )
        # Setup inclinometers group
        self.inclinometers_group = DataSourceGroup.objects.create(
            target=self.test_target,
            canonical_name=EFDepthDeformationSerializer.GROUP_CANONICAL_NAME,
            name="inclinometros",
        )
        # Setup 2 inclinometers
        self.inclinometers = [
            DataSourceGroup.objects.create(
                target=self.test_target,
                canonical_name='inclinometro-01',
                name='Inclinómetro 1'
            ),
            DataSourceGroup.objects.create(
                target=self.test_target,
                canonical_name='inclinometro-02',
                name='Inclinómetro 2'
            ),
        ]
        for inc in self.inclinometers:
            inc.parents.set([self.inclinometers_group])
            inc.save()
        # Setup 10 measurement points per inclinometer
        self.measument_points = {}
        for inclinometer_index in range(len(self.inclinometers)):
            inclinometer = self.inclinometers[inclinometer_index]
            inclinometer_name = inclinometer.name
            # inclinometer.groups.set([self.inclinometers_group])
            for measurement_point_index in range(10):
                meas_point = DataSource.objects.create(
                    hardware_id=f"iz-0{inclinometer_index}-1{measurement_point_index}0",
                    name=f"Punto de inclinómetro 0{inclinometer_index} cota 1{measurement_point_index}0",
                    canonical_name=f"punto-de-inclinometro-0{inclinometer_index}-cota-1{measurement_point_index}0",
                    target=self.test_target,
                )
                meas_point.groups.set([inclinometer])
                if inclinometer_name in self.measument_points:
                    self.measument_points[inclinometer_name].append(meas_point)
                else:
                    self.measument_points[inclinometer_name] = [meas_point]
        # Setup axis data points per measurement point
        self.timeseries = []
        for inc_key in self.measument_points:
            mp_list = self.measument_points[inc_key]
            inclinometer = [inc for inc in self.inclinometers if inc.name == inc_key][0]
            value_index = 0
            for mp in mp_list:
                mp.groups.set([inclinometer])
                # Setup 2 x, y and z data points
                for template in EFInclinometerPointDeformationSerializer.TEMPLATE_NAMES:
                    canonical_name = f"{self.test_target.canonical_name}.s-{mp.hardware_id}.{template}"
                    ts = Timeseries.objects.create(
                        name=f"Test {secrets.token_urlsafe(6)}",
                        canonical_name=canonical_name,
                        template_name=template,
                        target=self.test_target,
                        data_source=mp
                    )
                    Threshold.objects.create(
                        upper=decimal.Decimal(20),
                        timeseries=ts
                    )
                    self.timeseries.append(ts)
                    elastic.bulk_index([{
                        "name": canonical_name,
                        "value": value_index,
                        "@timestamp": "2000-01-01T00:00:00.000Z",
                    }, {
                        "name": canonical_name,
                        "value": value_index+999,
                        "@timestamp": "2000-02-01T00:00:00.000Z",
                    }], refresh="wait_for")
                    value_index += 2
        self.as_superuser()

    def test_deformation_profile(self):
        with self.subTest("without date_to parameter"):
            response = self.client_get(
                f"/api/{self.api_version}"
                f"/target/{self.test_target.canonical_name}"
                f"/ef/deformation-profile/"
            )
            self.assertResponseOk(response)

            results = response.data['results']
            self.assertEqual(len(results), len(self.inclinometers))
            inclinometer = [r['inclinometer'] for r in results]
            self.assertEqual(
                [inc['canonical_name'] for inc in inclinometer],
                [inc.canonical_name for inc in self.inclinometers]
            )

            for inc_index, inc in enumerate(inclinometer):
                inclinometer_points = inc['inclinometer_points']
                values = [ip['values'] for ip in inclinometer_points]
                thresholds = [ip['thresholds'] for ip in inclinometer_points]
                for i, val in enumerate(values):
                    expected_values = {
                        'z': float(f'1{i}0'),
                        'x': 4 * i + 999,
                        'y': 4 * i + 2 + 999,
                    }
                    self.assertEqual(val, expected_values)
                for i, t in enumerate(thresholds):
                    expected_thresholds = {
                        'x': [{
                            'upper': '20.00000000',
                            'lower': None,
                            'kind': None,
                        }],
                        'y': [{
                            'upper': '20.00000000',
                            'lower': None,
                            'kind': None,
                        }],
                    }
                    self.assertEqual(t, expected_thresholds)

        with self.subTest("with date_to parameter"):
            response = self.client_get(
                f"/api/{self.api_version}"
                f"/target/{self.test_target.canonical_name}"
                f"/ef/deformation-profile/",
                {"date_to": "2000-01-02T00:00:00.000Z"}
            )
            self.assertResponseOk(response)

            results = response.data['results']
            self.assertEqual(len(results), len(self.inclinometers))
            inclinometer = [r['inclinometer'] for r in results]
            self.assertEqual(
                [inc['canonical_name'] for inc in inclinometer],
                [inc.canonical_name for inc in self.inclinometers]
            )

            for inc_index, inc in enumerate(inclinometer):
                inclinometer_points = inc['inclinometer_points']
                values = [ip['values'] for ip in inclinometer_points]
                for i, val in enumerate(values):
                    expected_values = {
                        'z': float(f'1{i}0'),
                        'x': 4 * i,
                        'y': 4 * i + 2,
                    }
                    self.assertEqual(val, expected_values)

import secrets
from unittest.mock import patch

from django.urls import reverse
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from api.tests.base import BaseTestCase
from remotes.models import Remote, DataDumpRequest, DataRequestState
from targets.models import Target, TargetMap
from targets.models import Zone

from documents.tests.utils import with_fake_images


class TargetsEndpointTestCase(BaseTestCase):

    def setUp(self):
        self.test_remote = Remote.objects.create(
            namespace=f"test-namespace-{secrets.token_urlsafe(8)}",
            exchange=f"test-exchange-{secrets.token_urlsafe(8)}",
            bucket=f"test-bucket-{secrets.token_urlsafe(8)}",
            last_seen=timezone.now(),
        )
        self.test_remote.targets.set([self.target_object])
        self.total_targets = Target.objects.count()
        self.test_target_map = TargetMap.objects.create(
            name='Target Map Example',
            canonical_name='instruments-map',
            lower_left_coords={"x": 100, "y": 200},
            upper_right_coords={"x": 200, "y": 100},
            target=self.target_object
        )
        self.as_superuser()

    @with_fake_images(count=1)
    def test_target_map(self, fake_images):
        self.test_target_map.image = fake_images[0]
        self.test_target_map.save()
        target_canonical_name = self.target_object.canonical_name
        response = self.client_get(f"/api/{self.api_version}/target/{target_canonical_name}/maps/")
        self.assertResponseOk(response)
        self.assertEqual(len(response.data["results"]), 1)

    def test_filter_zone(self):
        response = self.client_get(
            f"/api/{self.api_version}/target/",
            {"zone": "lOs ViLoS"},
        )
        self.assertResponseOk(response)
        self.assertTrue(response.data["results"])
        zone = Zone.objects.get(canonical_name="los-vilos")
        self.assertTrue(all(
            result["zone"]["id"] == zone.id
            for result in response.data["results"]
        ))

    def test_filter_remote(self):
        response_unfiltered = self.client_get(
            f"/api/{self.api_version}/target/",
            {"page_size": self.total_targets},
        )
        self.assertResponseOk(response_unfiltered)
        self.assertEqual(len([
            result
            for result in response_unfiltered.data["results"]
            if result["remote"] is not None
            if result["remote"]["namespace"] == self.test_remote.namespace
        ]), 1)

        response_filtered_true = self.client_get(
            f"/api/{self.api_version}/target/",
            {
                "page_size": self.total_targets,
                "with_remote": True,
            },
        )
        self.assertResponseOk(response_filtered_true)
        self.assertEqual(len([
            result
            for result in response_filtered_true.data["results"]
            if result["remote"] is not None
            if result["remote"]["namespace"] == self.test_remote.namespace
        ]), 1)

        response_filtered_false = self.client_get(
            f"/api/{self.api_version}/target/",
            {
                "page_size": self.total_targets,
                "with_remote": False,
            },
        )
        self.assertResponseOk(response_filtered_false)
        self.assertEqual(len([
            result
            for result in response_filtered_false.data["results"]
            if result["remote"] is not None
        ]), 0)

    def test_retrieve(self):
        canonical_name = Target.objects.values("canonical_name").first()["canonical_name"]
        response = self.client_get(f"/api/{self.api_version}/target/{canonical_name}/")
        self.assertResponseOk(response)

    @patch('api.v1.views.target_views.send_simple_message')
    def test_dump_request_creation(self, mock_ssm):
        self.assertFalse(DataDumpRequest.objects.filter(target=self.target_object).exists())
        url = reverse(f"{self.api_version}:target-dump-request-list", args=[self.target])
        post_params = {
            "profile": f"profile-{secrets.token_urlsafe(8)}",
            "date_from": "2000-01-01T00:00:00Z",
            "date_to": "2000-01-03T00:00:00Z"
        }
        response = self.client_post(url, post_params)
        self.assertResponseOk(response)

        self.assertEqual(DataDumpRequest.objects.filter(target=self.target_object).count(), 1)

        dump_request = DataDumpRequest.objects.filter(target=self.target_object).first()
        self.assertEqual(dump_request.target.canonical_name, self.target_object.canonical_name)
        self.assertEqual(dump_request.profile, post_params['profile'])
        self.assertEqual(dump_request.date_from, parse_datetime(post_params['date_from']))
        self.assertEqual(dump_request.date_to, parse_datetime(post_params['date_to']))
        self.assertEqual(dump_request.state, DataRequestState.WAITING_RESPONSE)

        mock_ssm.assert_called_with(**dump_request.get_message_args())

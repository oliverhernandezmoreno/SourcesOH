import secrets

from django.urls import reverse

from api.tests.base import BaseTestCase
from targets.models import DataSource, DataSourceGroup
from targets.profiling import MANIFESTS, apply_manifest


class TemplateScopeEndpointTestCase(BaseTestCase):

    def setUp(self):
        spreadgroup, _ = DataSourceGroup.objects.get_or_create(
            target=self.target_object,
            canonical_name="fake-things",
        )
        sources = list(DataSource.objects.filter(target=self.target_object, groups=spreadgroup))
        for _ in range(4):
            source = DataSource.objects.create(
                target=self.target_object,
                hardware_id=f"scopetest-{secrets.token_urlsafe(4)}",
                canonical_name="scopetest-{secrets.token_urlsafe(4)}",
            )
            source.groups.set([spreadgroup])
            sources.append(source)
        self.sources = sources
        apply_manifest(next(iter(MANIFESTS.values())), self.target_object)
        self.group = DataSourceGroup.objects.filter(target=self.target_object, canonical_name="fake-group-1").first()
        self.as_superuser()

    def test_scope(self):
        template_spread = "fake.raw"
        response_spread = self.client_get(
            reverse(f"{self.api_version}:target-template-scope", args=[self.target, template_spread]),
        )
        self.assertResponseOk(response_spread)
        self.assertEqual(response_spread.data.get("scope"), "spread")
        self.assertEqual(response_spread.data.get("target"), self.target)
        self.assertEqual(
            sorted(source["id"] for source in response_spread.data.get("sources", [])),
            sorted(source.id for source in self.sources),
        )
        self.assertEqual(response_spread.data.get("groups"), None)

        template_group = "fake.isolation-test.group"
        response_group = self.client_get(
            reverse(f"{self.api_version}:target-template-scope", args=[self.target, template_group]),
        )
        self.assertResponseOk(response_group)
        self.assertEqual(response_group.data.get("scope"), "group")
        self.assertEqual(response_group.data.get("target"), self.target)
        self.assertEqual(response_group.data.get("sources"), None)
        self.assertEqual(
            response_group.data.get("groups", [{}])[0].get("id"),
            self.group.id,
        )

        template_none = "fake.compound"
        response_none = self.client_get(
            reverse(f"{self.api_version}:target-template-scope", args=[self.target, template_none]),
        )
        self.assertResponseOk(response_none)
        self.assertEqual(response_none.data.get("scope"), None)
        self.assertEqual(response_none.data.get("target"), self.target)
        self.assertEqual(response_none.data.get("sources"), None)
        self.assertEqual(response_none.data.get("groups"), None)

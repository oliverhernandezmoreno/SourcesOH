import secrets

from django.core import management

from api.tests.base import BaseTestCase
from targets.models import Timeseries, Target, DataSource, DataSourceGroup


class TestApplyTargetManifestCommand(BaseTestCase):

    def create_source(self, *groups):
        gs = [
            group
            for group, _ in (
                DataSourceGroup.objects.get_or_create(
                    target=self.test_target,
                    canonical_name=g,
                    defaults={"name": f"Test {secrets.token_urlsafe(4)}"},
                )
                for g in groups
            )
        ]
        source = DataSource.objects.create(
            target=self.test_target,
            name=f"Test {secrets.token_urlsafe(8)}",
            hardware_id=secrets.token_urlsafe(16),
        )
        source.groups.set(gs)
        return source

    def create_group(self, *parents):
        gs = [
            group
            for group, _ in (
                DataSourceGroup.objects.get_or_create(
                    target=self.test_target,
                    canonical_name=g,
                    defaults={"name": f"Test {secrets.token_urlsafe(4)}"},
                )
                for g in parents
            )
        ]
        group = DataSourceGroup.objects.create(
            target=self.test_target,
            name=f"Test {secrets.token_urlsafe(8)}",
            canonical_name=secrets.token_urlsafe(16),
        )
        group.parents.set(gs)
        return group

    def setUp(self):
        from targets.profiling import MANIFESTS
        self.manifest = list(MANIFESTS.items())[0]
        self.manifest_version = self.manifest[1]["version"]
        self.test_target = Target.objects.exclude(canonical_name=self.target).first()
        self.sources = [
            self.create_source("fake-things")
            for _ in range(10)
        ]
        self.groups = [
            self.create_group("fake-groups")
            for _ in range(2)
        ]

    def tearDown(self):
        from targets.profiling import FOREST, init
        self.manifest[1]["version"] = self.manifest_version
        fresh_forest = init()
        for k in FOREST:
            FOREST[k] = fresh_forest[k] if k in fresh_forest else FOREST[k]

    def do_command(self):
        management.call_command(
            "applytargetmanifest",
            self.test_target.canonical_name,
            self.manifest[0],
            verbosity=0,
        )

    def update_version(self, v):
        from targets.profiling import FOREST, init
        fresh_forest = init(script_version=v)
        for k in FOREST:
            FOREST[k] = fresh_forest[k] if k in fresh_forest else FOREST[k]

    def test_applytargetmanifest_command(self):
        # The target is not intervened
        self.assertFalse(Timeseries.objects.filter(target=self.test_target).exists())
        self.do_command()
        # The target was intervened
        self.assertTrue(Timeseries.objects.filter(target=self.test_target).exists())

    def test_command_prunes_old_timeseries(self):
        self.do_command()
        self.assertTrue(Timeseries.objects.filter(
            target=self.test_target,
            script_version=self.manifest_version
        ).exists())
        # Alter the manifest version
        self.manifest[1]["version"] = self.manifest_version.split(":")[0] + ":" + secrets.token_hex(10)
        self.update_version(self.manifest[1]["version"])
        self.do_command()
        # No timeseries of the previous version remain
        self.assertFalse(Timeseries.objects.filter(
            target=self.test_target,
            script_version=self.manifest_version
        ).exists())
        # Timeseries exist for the new version
        self.assertTrue(Timeseries.objects.filter(
            target=self.test_target,
            script_version=self.manifest[1]["version"]
        ).exists())

    def test_command_prunes_isolated_timeseries(self):
        # manually prepared variable in test-profiles/fake
        raw_template = "fake.isolation-test.raw"
        group_template = "fake.isolation-test.group"
        isolated_template = "fake.isolation-test.isolated"
        # add fake things and fake groups but don't link them
        self.do_command()
        # Expect some raw variables
        self.assertEqual(
            Timeseries.objects.filter(target=self.test_target, template_name=raw_template).count(),
            10
        )
        # Expect no group variables (because of missing links)
        self.assertEqual(
            Timeseries.objects.filter(target=self.test_target, template_name=group_template).count(),
            0
        )
        # Expect no isolated variable (because of the missing links)
        self.assertEqual(
            Timeseries.objects.filter(target=self.test_target, template_name=isolated_template).count(),
            0
        )
        # Place sources within a single group
        for source in self.sources:
            source.groups.add(self.groups[0])
            source.save()
        self.do_command()
        # Expect one group variable
        self.assertEqual(
            Timeseries.objects.filter(target=self.test_target, template_name=group_template).count(),
            1
        )
        # Expect all isolated variables
        self.assertEqual(
            Timeseries.objects.filter(target=self.test_target, template_name=isolated_template).count(),
            10
        )

import secrets

from api.tests.base import BaseTestCase
from base.serializers import freeze
from targets.models import DataSource
from targets.models import DataSourceGroup
from targets.models import Target
from targets.models import Timeseries


class TestProfileForest(BaseTestCase):

    def test_profiles_are_well_defined(self):
        from targets.profiling import FOREST
        self.assertTrue(bool(FOREST))
        target = Target.objects.get(canonical_name=self.target)
        profile = "fake/compound"
        self.assertTrue(profile in FOREST)
        target.apply_profile(profile)
        self.assertTrue(
            Timeseries.objects.filter(
                target=target,
                canonical_name=f"{target.canonical_name}.none.{FOREST[profile].value.canonical_name}",
            ).exists(),
        )

    def test_get_nodes_by(self):
        from targets.profiling import get_nodes_by

        self.assertEqual(len(get_nodes_by('category', 'not-fake-variable')), 0)
        self.assertEqual(len(get_nodes_by('category', 'fake-variable')), 2)

        category = 'fake-index'
        by_index_category = get_nodes_by('category', category)
        self.assertEqual(len(by_index_category), 2)
        for x in by_index_category:
            self.assertTrue(category in x.value.category)

        canonical_name = 'fake.raw'
        by_name = get_nodes_by('canonical_name', canonical_name)

        self.assertEqual(len(by_name), 1)
        self.assertEqual(by_name[0].value.canonical_name, canonical_name)
        self.assertEqual(len(get_nodes_by('canonical_name', 'totally_random_name-123123')), 0)

        self.assertEqual(len(get_nodes_by('category', ('fake-index', 'something-else'))), 1)
        self.assertEqual(len(get_nodes_by('category', ('fake-index', 'index-random'))), 0)

    def test_manifests_can_be_applied(self):
        from targets.profiling import MANIFESTS
        self.assertTrue(bool(MANIFESTS))
        target = Target.objects.get(canonical_name=self.target)
        manifest = "fake"
        self.assertTrue(manifest in MANIFESTS)
        target.apply_manifest(manifest)
        self.assertTrue(
            Timeseries.objects.filter(
                target=target,
                template_name=MANIFESTS[manifest]["entrypoints"][0],
            ).exists(),
        )

    def make_group(self):
        return DataSourceGroup.objects.create(
            target=self.target_object,
            canonical_name=secrets.token_urlsafe(8),
        )

    def make_source(self, *groups):
        source = DataSource.objects.create(
            hardware_id=secrets.token_urlsafe(8),
            target=self.target_object,
            canonical_name=secrets.token_urlsafe(8),
        )
        for g in groups:
            source.groups.add(g)
        return source

    def test_group_intersections_are_correctly_applied(self):
        from targets.profiling import FOREST
        from targets.profiling.base import Node
        first_group = self.make_group()
        second_group = self.make_group()
        first_source = self.make_source(first_group, second_group)
        self.make_source(first_group)  # second source
        third_source = self.make_source(first_group, second_group)

        with self.subTest("group intersection with spread scope"):
            test_profile = f"spread-{secrets.token_urlsafe(8)}"
            FOREST[test_profile] = Node(
                name="Testing spread with intersection",
                type="raw",
                canonical_name=test_profile,
                scope="spread",
                groups=freeze({
                    "operator": "and",
                    "items": [{
                        "canonical_name": first_group.canonical_name,
                    }, {
                        "canonical_name": second_group.canonical_name,
                    }]
                }),
                inputs=[],
            )
            self.target_object.apply_profile(test_profile)
            self.assertEqual(frozenset(
                t.data_source.id
                for t in Timeseries.objects.filter(
                    target=self.target_object,
                    template_name=test_profile,
                )
            ), frozenset(map(lambda ds: ds.id, (first_source, third_source))))

        with self.subTest("group intersection with group scope"):
            test_profile = f"group-{secrets.token_urlsafe(8)}"
            FOREST[test_profile] = Node(
                name="Testing group with intersection",
                type="raw",
                canonical_name=test_profile,
                scope="group",
                groups=freeze({
                    "operator": "and",
                    "items": [{
                        "canonical_name": first_group.canonical_name,
                    }, {
                        "canonical_name": second_group.canonical_name,
                    }]
                }),
                inputs=[],
            )
            self.target_object.apply_profile(test_profile)
            timeseries = Timeseries.objects.get(target=self.target_object, template_name=test_profile)
            self.assertEqual(frozenset(
                ds.id
                for ds in timeseries.data_source_group.data_sources.all()
            ), frozenset(map(lambda ds: ds.id, (first_source, third_source))))

    def test_parents_directive(self):
        from targets.profiling.base import Node, apply as apply_node

        with self.subTest("parents in 'groups' scope"):
            parent = self.make_group()
            group = self.make_group()
            group.parents.set([parent])
            group.save()
            node = Node(
                name="Testing parents directive through groups",
                type="raw",
                canonical_name=f"test-parents-{secrets.token_urlsafe(6)}",
                scope="group",
                groups=freeze({
                    "parents": [{
                        "canonical_name": parent.canonical_name,
                    }]
                }),
                inputs=[],
            )
            apply_node(node, self.target_object)
            self.assertTrue(Timeseries.objects.filter(
                target=self.target_object,
                data_source_group=group,
            ).exists())

        with self.subTest("parents in 'spread' scope"):
            parent = self.make_group()
            group = self.make_group()
            group.parents.set([parent])
            group.save()
            source = self.make_source(group)
            node = Node(
                name="Testing parents directive through groups",
                type="raw",
                canonical_name=f"test-parents-{secrets.token_urlsafe(6)}",
                scope="spread",
                groups=freeze({
                    "parents": [{
                        "canonical_name": parent.canonical_name,
                    }]
                }),
                inputs=[],
            )
            apply_node(node, self.target_object)
            self.assertTrue(Timeseries.objects.filter(
                target=self.target_object,
                data_source_group=group,
                data_source=source,
            ).exists())

        with self.subTest("multiple parents"):
            parent_a = self.make_group()
            parent_b = self.make_group()
            group = self.make_group()
            group.parents.set([parent_a, parent_b])
            group.save()
            unmatched_group = self.make_group()
            unmatched_group.parents.set([parent_b])
            unmatched_group.save()
            source = self.make_source(group)
            unmatched_source = self.make_source(unmatched_group)
            node = Node(
                name="Testing parents directive through groups",
                type="raw",
                canonical_name=f"test-parents-{secrets.token_urlsafe(6)}",
                scope="spread",
                groups=freeze({
                    "parents": [{
                        "canonical_name": parent_a.canonical_name,
                    }, {
                        "canonical_name": parent_b.canonical_name,
                    }]
                }),
                inputs=[],
            )
            apply_node(node, self.target_object)
            self.assertTrue(Timeseries.objects.filter(
                target=self.target_object,
                data_source_group=group,
                data_source=source,
            ).exists())
            self.assertFalse(Timeseries.objects.filter(
                target=self.target_object,
                data_source_group=unmatched_group,
                data_source=unmatched_source,
            ).exists())

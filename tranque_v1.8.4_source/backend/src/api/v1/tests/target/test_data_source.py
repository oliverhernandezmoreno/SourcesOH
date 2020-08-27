from api.tests.base import BaseTestCase
from targets.models import (
    Target,
    TargetState,
    TargetType,
    Timeseries,
    DataSource,
    DataSourceGroup
)
from documents.tests.utils import with_fake_docs


class NestedDataSourceTestCase(BaseTestCase):

    @classmethod
    def setUpTestData(cls):
        cls.test_target = Target.objects.create(
            canonical_name='datasource-test',
            state=TargetState.objects.first(),
            type=TargetType.objects.first(),
        )
        cls.test_parent_groups = [
            DataSourceGroup.objects.create(
                target=cls.test_target,
                canonical_name='parent-1',
                name='Parent'
            ),
            DataSourceGroup.objects.create(
                target=cls.test_target,
                canonical_name='parent-2',
                name='Parent'
            )
        ]
        cls.test_groups = [
            DataSourceGroup.objects.create(
                target=cls.test_target,
                canonical_name=f'group-{i}',
                name='Group'
            )
            for i in range(12)
        ]
        for i, g in enumerate(cls.test_groups):
            g.parents.set([] if i % 3 == 2 else [cls.test_parent_groups[i % 3]])
            g.save()
        cls.test_sources = [
            *(
                DataSource.objects.create(
                    target=cls.test_target,
                    hardware_id=f'datasource-{i}',
                    name='Data source',
                    canonical_name=f'datasource-{i}',
                    type='online',
                ) for i in range(10)
            ),
            *(
                DataSource.objects.create(
                    target=cls.test_target,
                    hardware_id=f'datasource-{i}',
                    name='Data source',
                    canonical_name=f'datasource-{i}',
                    type='offline',
                ) for i in range(10, 20)
            ),
            *(
                DataSource.objects.create(
                    target=cls.test_target,
                    hardware_id=f'datasource-{i}',
                    name='Data source',
                    canonical_name=f'datasource-{i}',
                    type=None,
                ) for i in range(20, 30)
            ),
        ]
        for i, s in enumerate(cls.test_sources):
            if i < 10:
                s.groups.set(cls.test_groups)
                s.save()
            elif i < 20:
                s.groups.set(
                    [g for j, g in enumerate(cls.test_groups) if j % 2 == 0]
                    if i % 2 == 0
                    else [g for j, g in enumerate(cls.test_groups) if j % 2 == 1]
                )
                s.save()
        for i, ds in enumerate(cls.test_sources[:5]):
            Timeseries.objects.create(
                canonical_name=f'test-ts-{i}',
                target=cls.test_target,
                data_source=ds,
                template_name='test.foo.bar',
            )

    def setUp(self):
        self.as_superuser()

    def api_url(self, source=None):
        prefix = f'/api/{self.api_version}/target/{self.test_target.canonical_name}/datasource/'
        return prefix if source is None else f'{prefix}{source}/'

    def test_list_sources_unfiltered(self):
        response = self.client_get(self.api_url())
        self.assertResponseOk(response)
        self.assertEqual(response.data["count"], 30)

    def test_read_single_source(self):
        response = self.client_get(self.api_url(self.test_sources[0].id))
        self.assertResponseOk(response)

    @with_fake_docs(count=1)
    def test_read_single_source_with_a_sheet(self, docs):
        data_source = self.test_sources[0]
        response = self.client_get(self.api_url(data_source.id))
        self.assertResponseOk(response)
        self.assertEqual(response.data['sheet'], None)
        # Add the sheet file
        data_source.sheet = docs[0]
        data_source.save()
        response = self.client_get(self.api_url(data_source.id))
        self.assertResponseOk(response)
        self.assertNotEqual(response.data['sheet'], None)
        self.assertEqual(response.data['sheet']['id'], docs[0].id)
        # Download the sheet file
        response = self.client_get(f'{self.api_url(data_source.id)}download_sheet/')
        self.assertResponseOk(response)

    def test_list_sources_with_filters(self):
        with self.subTest("type filter"):
            response_for_single_type = self.client_get(self.api_url(), {"type": "offline"})
            self.assertResponseOk(response_for_single_type)
            self.assertEqual(response_for_single_type.data["count"], 10)

        with self.subTest("profiled_by filter"):
            response_for_specific_profile = self.client_get(self.api_url(), {"profiled_by": "test.foo"})
            self.assertResponseOk(response_for_specific_profile)
            self.assertEqual(response_for_specific_profile.data["count"], 5)

        with self.subTest("single group filter"):
            response_for_specific_group = self.client_get(self.api_url(), {"group": "group-3"})
            self.assertResponseOk(response_for_specific_group)
            self.assertEqual(response_for_specific_group.data["count"], 15)
            # should match group-3
            self.assertTrue(all(
                "group-3" in s["groups"]
                for s in response_for_specific_group.data["results"])
            )

        with self.subTest("many groups filter"):
            response_for_multiple_groups = self.client_get(self.api_url(), {"group": "group-4,group-5"})
            self.assertResponseOk(response_for_multiple_groups)
            self.assertEqual(response_for_multiple_groups.data["count"], 20)
            # should match group-4, group-5
            self.assertTrue(all(
                any(g in s["groups"] for g in ("group-4", "group-5"))
                for s in response_for_multiple_groups.data["results"])
            )

        with self.subTest("single parent filter"):
            response_for_specific_parent = self.client_get(self.api_url(), {"group_parent": "parent-2"})
            self.assertResponseOk(response_for_specific_parent)
            self.assertEqual(response_for_specific_parent.data["count"], 20)
            # should match group-2, group-5, group-8, group-11
            self.assertTrue(all(
                any(g in s["groups"] for g in ("group-2", "group-5", "group-8", "group-11"))
                for s in response_for_specific_parent.data["results"])
            )

        with self.subTest("many parents filter"):
            response_for_multiple_parents = self.client_get(self.api_url(), {"group_parent": "parent-1,parent-2"})
            self.assertResponseOk(response_for_multiple_parents)
            self.assertEqual(response_for_multiple_parents.data["count"], 20)

import random

from django.urls import reverse

from api.tests.base import BaseTestCase
from targets.models import Target, DataSourceGroup, DataSource, TargetState, TargetType


class NestedDataSourceGroupTestCase(BaseTestCase):

    @classmethod
    def setUpTestData(cls):
        # get test target and a random target to create data sources and groups
        # targets where loaded in test runner (api.test.base.TestRunner) setup
        cls.test_target = Target.objects.create(
            canonical_name='el-datasourcegroup-test',
            state=TargetState.objects.first(),
            type=TargetType.objects.first()
        )
        cls.random_target = Target.objects.create(
            canonical_name='el-datasourcegroup-random',
            state=TargetState.objects.first(),
            type=TargetType.objects.first()
        )

        test_data_source_groups = [
            DataSourceGroup(target=cls.test_target, name='grupo1'),
            DataSourceGroup(target=cls.test_target, name='grupo2'),
            DataSourceGroup(target=cls.test_target, name='grupo3'),
        ]

        random_data_source_groups = [
            DataSourceGroup(target=cls.random_target, name='grupo1'),
            DataSourceGroup(target=cls.random_target, name='grupo2'),
            DataSourceGroup(target=cls.random_target, name='grupo4'),
            DataSourceGroup(target=cls.random_target, name='grupo5'),
        ]
        for i in test_data_source_groups:
            i.save()
        for i in random_data_source_groups:
            i.save()

        # set a parent for a single group: 'grupo2'
        test_data_source_groups[1].parents.set([
            DataSourceGroup.objects.create(target=cls.test_target, name='padre')
        ])

        cls.test_group_names = [x.canonical_name for x in test_data_source_groups]

        # data_sources
        cls.test_group_counts = [random.randint(10 + i, 100) for i in range(len(test_data_source_groups))]
        cls.random_group_count = [random.randint(10 + i, 100) for i in range(len(random_data_source_groups))]

        for i in range(len(test_data_source_groups)):
            for j in range(cls.test_group_counts[i]):
                source = DataSource(
                    target=cls.test_target,
                    name=f'source{i}-{j}',
                    hardware_id=f'source{i}-{j}'
                )
                source.save()
                test_data_source_groups[i].data_sources.add(source)

        for i in range(len(random_data_source_groups)):
            for j in range(cls.random_group_count[i]):
                source = DataSource(
                    target=cls.random_target,
                    name=f'source{i}-{j}',
                    hardware_id=f'source{i}-{j}'
                )
                source.save()
                random_data_source_groups[i].data_sources.add(source)

    def setUp(self):
        self.as_mine()

    def test_list_source_group_sources(self):
        with self.subTest('list target data source groups'):
            url = reverse(f'{self.api_version}:target-datasourcegroup-list', args=[self.test_target.canonical_name])

            response = self.client.get(url, format='json')

            self.assertResponseOk(response)

            self.assertEqual(response.data['count'], len(self.test_group_counts) + 1)  # extra one for 'padre'

            for x in response.data['results']:
                self.assertIn(x['canonical_name'], self.test_group_names + ['padre'])

        with self.subTest('list target data source groups with a parent filter'):
            url = reverse(f'{self.api_version}:target-datasourcegroup-list', args=[self.test_target.canonical_name])

            response = self.client.get(url, {'parent': 'padre'}, format='json')

            self.assertResponseOk(response)
            self.assertEqual(response.data['count'], 1)
            self.assertEqual(response.data['results'][0]['canonical_name'], 'grupo2')

        for j in range(len(self.test_group_names)):
            group_name = self.test_group_names[j]
            with self.subTest(f'detail data source group: {group_name}'):
                url = reverse(f'{self.api_version}:target-datasourcegroup-detail',
                              args=[self.test_target.canonical_name, group_name])

                response = self.client.get(url, format='json')

                self.assertResponseOk(response)

                self.assertEqual(len(response.data['data_sources']), self.test_group_counts[j])

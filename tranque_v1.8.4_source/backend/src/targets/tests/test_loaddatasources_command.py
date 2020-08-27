import os
from pathlib import Path
import tempfile

from django.core import management

from api.tests.base import BaseTestCase
from targets.models import DataSourceGroup, DataSource


class TestLoadDataSourcesCommand(BaseTestCase):

    def create_file(self, contents):
        fd, path = tempfile.mkstemp(suffix=".yml", text=True)
        os.close(fd)
        file = Path(path)
        self.files = [*getattr(self, "files", ()), file]
        with open(file, "w") as f:
            f.write(contents)
        return file

    def file_groups_sectors(self):
        s = '{s}'
        return f"""
target: {self.target}

groups:
  - name: "Sector {s}"
    canonical_name: "sector-{s}"
    with_s:
      - a
      - b
      - c"""

    def file_groups_inclinometers(self):
        i = '{i}'
        return f"""
target: {self.target}

groups:
  - name: "Inclinometro {i}"
    canonical_name: "inclinometro-{i}"
    with_i:
      range:
        start: 1
        stop: 16"""

    def file_sources_inclinometers_z(self):
        i = '{i}'
        g = '{g}'
        return f"""
groups:
  - name: "Sector HAHAHA"
    canonical_name: "sector-haha"
  - name: "Inclinometro {g}"
    canonical_name: "inclinometro-{g}"
    with_g:
      range:
        start: 1
        stop: 16

sources:
  - hardware_id: "iz-{g}_{i}"
    canonical_name: "iz-{g}_{i}"
    name: "Inclinometro {g} Z #{i}"
    groups:
      - "sector-haha"
      - "inclinometro-{g}"
    with_i:
      range:
        start: 10
        stop: 51
        step: 5
    with_g:
      range:
        start: 1
        stop: 6"""

    def file_imports_and_parents(self):
        return f"""
target: {self.target}

groups:
  - import_from: fake
    canonical_name: fake-groups

  - name: "Sector HAHAHA"
    canonical_name: "sector-haha"
    parents:
      - fake-groups

sources:
  - hardware_id: pz-1
    name: Piezómetro 1
    groups:
      - sector-haha"""

    def test_groups_sector(self):
        file_groups_sectors = self.create_file(self.file_groups_sectors())
        management.call_command(
            "loaddatasources",
            str(file_groups_sectors),
        )
        list_sectors = ['sector-a', 'sector-b', 'sector-c']
        sectors = DataSourceGroup.objects.filter(canonical_name__in=list_sectors)
        self.assertEqual(len(list_sectors), len(sectors))

        sector_a = DataSourceGroup.objects.get(canonical_name='sector-a')
        self.assertEqual(sector_a.name, 'Sector a')

    def test_groups_inclinometers(self):
        file_groups_inclinometers = self.create_file(self.file_groups_inclinometers())
        management.call_command(
            "loaddatasources",
            str(file_groups_inclinometers),
        )

        list_inclinometers = []
        for i in range(1, 16):
            list_inclinometers.append('inclinometro-' + str(i))
        inclinometers = DataSourceGroup.objects.filter(canonical_name__in=list_inclinometers)
        self.assertEqual(len(list_inclinometers), len(inclinometers))

        inclinometer_2 = DataSourceGroup.objects.get(canonical_name='inclinometro-2')
        self.assertEqual(inclinometer_2.name, 'Inclinometro 2')

    def test_sources_inclinometers_z(self):
        file_sources_inclinometers_z = self.create_file(self.file_sources_inclinometers_z())
        management.call_command(
            "loaddatasources",
            str(file_sources_inclinometers_z),
            self.target,  # give the target as a command argument
        )

        len_sources = (5 * 9)  # with_g(1..5) * with_i(10..50, step=5)
        sources = DataSource.objects.filter(name__startswith='Inclinometro')
        self.assertEqual(len_sources, len(sources))

        iz = DataSource.objects.get(target=self.target_object, hardware_id='iz-3_15')
        self.assertEqual(iz.name, 'Inclinometro 3 Z #15')
        self.assertEqual(iz.groups.count(), 2)
        self.assertEqual(
            [g.canonical_name for g in iz.groups.all().order_by('canonical_name')],
            ["inclinometro-3", "sector-haha"]
        )

    def test_imports_and_parents(self):
        file_imports_and_parents = self.create_file(self.file_imports_and_parents())
        management.call_command(
            "loaddatasources",
            str(file_imports_and_parents),
        )

        # find imported group 'fake-groups'
        self.assertTrue(
            DataSourceGroup.objects
            .filter(target=self.target_object, canonical_name="fake-groups")
            .exists()
        )
        # find created group 'sector-haha'
        self.assertTrue(
            DataSourceGroup.objects
            .filter(
                target=self.target_object,
                canonical_name="sector-haha",
                parents=DataSourceGroup.objects.filter(
                    target=self.target_object,
                    canonical_name="fake-groups"
                )[0:1]
            )
            .exists()
        )
        # find created source 'pz-1'
        self.assertTrue(
            DataSource.objects
            .filter(
                target=self.target_object,
                hardware_id="pz-1",
                groups=DataSourceGroup.objects.filter(
                    target=self.target_object,
                    canonical_name="sector-haha"
                )[0:1]
            )
            .exists()
        )

    def tearDown(self):
        for f in getattr(self, "files", ()):
            f.unlink()

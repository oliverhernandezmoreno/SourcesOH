from pathlib import Path
import secrets
from etl.models import ETLOperation
from etl.tests.base import ETLBase
from targets.models import Timeseries, DataSourceGroup, DataSource


class MonolithsETLTestCase(ETLBase):

    def setUp(self):
        sector_group = DataSourceGroup.objects.create(
            name="Sectores",
            canonical_name="sectores",
            target=self.target_object,
        )
        monolith_group = DataSourceGroup.objects.create(
            name="Monolitos",
            canonical_name="prismas-monolitos",
            target=self.target_object,
        )
        self.datasourcegroup1 = DataSourceGroup.objects.create(
            name="Sector A",
            canonical_name=f"etl-test-{secrets.token_urlsafe(8)}",
            target=self.target_object,
        )
        self.datasourcegroup1.parents.add(sector_group)

        self.datasourcegroup2 = DataSourceGroup.objects.create(
            name="Sector B",
            canonical_name=f"etl-test-{secrets.token_urlsafe(8)}",
            target=self.target_object,
        )
        self.datasourcegroup2.parents.add(sector_group)

        self.datasourcegroup3 = DataSourceGroup.objects.create(
            name="Sector C",
            canonical_name=f"etl-test-{secrets.token_urlsafe(8)}",
            target=self.target_object,
        )
        self.datasourcegroup3.parents.add(sector_group)

        self.datasource1 = DataSource.objects.create(
            hardware_id=f"etl-test-source-1-{secrets.token_urlsafe(8)}",
            name="Monolito 01",
            canonical_name="monolito-01",
            target=self.target_object,
        )
        self.datasource1.groups.add(self.datasourcegroup1)
        self.datasource1.groups.add(monolith_group)

        self.datasource2 = DataSource.objects.create(
            hardware_id=f"etl-test-source-2-{secrets.token_urlsafe(8)}",
            name="Monolito 02",
            canonical_name="monolito-02",
            target=self.target_object,
        )
        self.datasource2.groups.add(self.datasourcegroup2)
        self.datasource2.groups.add(monolith_group)

        self.datasource3 = DataSource.objects.create(
            hardware_id=f"etl-test-source-3-{secrets.token_urlsafe(8)}",
            name="Monolito 03",
            canonical_name="monolito-03",
            target=self.target_object,
        )
        self.datasource3.groups.add(self.datasourcegroup3)
        self.datasource3.groups.add(monolith_group)

        self.timeseries1 = Timeseries.objects.create(
            name="Deformación superficial del muro por monolito en el eje X",
            canonical_name=f"etl-test-source-1-eje-x-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
            template_name="ef-mvp.m2.parameters.deformacion-monolito-eje-x",
            data_source=self.datasource1,
            data_source_group=self.datasourcegroup1,
        )
        self.timeseries2 = Timeseries.objects.create(
            name="Deformación superficial del muro por monolito en el eje Y",
            canonical_name=f"etl-test-source-1-eje-y-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
            template_name="ef-mvp.m2.parameters.deformacion-monolito-eje-y",
            data_source=self.datasource1,
            data_source_group=self.datasourcegroup1,
        )
        self.timeseries3 = Timeseries.objects.create(
            name="Deformación superficial del muro por monolito en el eje Z",
            canonical_name=f"etl-test-source-1-eje-z-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
            template_name="ef-mvp.m2.parameters.deformacion-monolito-eje-z",
            data_source=self.datasource1,
            data_source_group=self.datasourcegroup1,
        )
        self.timeseries4 = Timeseries.objects.create(
            name="Deformación superficial del muro por monolito en el eje Y",
            canonical_name=f"etl-test-source-1-eje-y-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
            template_name="ef-mvp.m2.parameters.deformacion-monolito-eje-y",
            data_source=self.datasource2,
            data_source_group=self.datasourcegroup2,
        )

        self.timeseries5 = Timeseries.objects.create(
            name="Deformación superficial del muro por monolito en el eje Z",
            canonical_name=f"etl-test-source-1-eje-z-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
            template_name="ef-mvp.m2.parameters.deformacion-monolito-eje-z",
            data_source=self.datasource3,
            data_source_group=self.datasourcegroup3,
        )

    def test_sector_instrument(self):
        datafile = self.make_copied_datafile(Path(__file__).parent / "test_ef_deformation_monoliths.xlsx")
        operation = ETLOperation.start(
            "ef_deformation_monoliths",
            datafile.uploaded_by,
            self.target_object,
            datafile,
            {},
        )
        assert not operation.finished, f"Operation finished before delivery: {operation.errors}"
        operation.deliver()
        self.assertEqual(operation.state, ETLOperation.ETLState.SUCCESS)
        self.assertEqual(
            set((e["@timestamp"], e["value"]) for e in self.timeseries1.events),
            set([("2019-11-12T00:00:00+00:00", 6.00)])
        )
        self.assertEqual(
            set((e["@timestamp"], e["value"]) for e in self.timeseries2.events),
            set([("2019-11-12T00:00:00+00:00", 12.00)])
        )
        self.assertEqual(
            set((e["@timestamp"], e["value"]) for e in self.timeseries3.events),
            set([("2019-11-12T00:00:00+00:00", -15.00)])
        )
        self.assertEqual(
            set((e["@timestamp"], e["value"]) for e in self.timeseries4.events),
            set([("2019-11-13T00:00:00+00:00", 14.0)])
        )
        self.assertEqual(
            set((e["@timestamp"], e["value"]) for e in self.timeseries5.events),
            set([("2019-11-14T00:00:00+00:00", -21.0)])
        )

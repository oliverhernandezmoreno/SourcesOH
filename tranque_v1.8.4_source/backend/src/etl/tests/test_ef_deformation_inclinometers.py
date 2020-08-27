from pathlib import Path
import secrets
from etl.models import ETLOperation
from etl.tests.base import ETLBase
from targets.models import Timeseries, DataSourceGroup, DataSource


class InclinometersETLTestCase(ETLBase):

    def setUp(self):
        inclinometers_group = DataSourceGroup.objects.create(
            name="Inclinómetros",
            canonical_name="inclinometros",
            target=self.target_object,
        )
        self.datasourcegroup = DataSourceGroup.objects.create(
            name="Inclinómetro 01",
            canonical_name=f"etl-test-{secrets.token_urlsafe(8)}",
            target=self.target_object,
        )
        self.datasourcegroup.parents.add(inclinometers_group)
        self.datasource1 = DataSource.objects.create(
            hardware_id=f"etl-test-source-1-{secrets.token_urlsafe(8)}-z-913.5",
            name="Punto de inclinómetro 01 cota 913.5",
            canonical_name=f"etl-test-{secrets.token_urlsafe(8)}",
            target=self.target_object,
        )
        self.datasource1.groups.add(self.datasourcegroup)

        self.datasource2 = DataSource.objects.create(
            hardware_id=f"etl-test-source-2-{secrets.token_urlsafe(8)}-z-913",
            name="Punto de inclinómetro 01 cota 913",
            canonical_name=f"etl-test-{secrets.token_urlsafe(8)}",
            target=self.target_object,
        )
        self.datasource2.groups.add(self.datasourcegroup)

        self.datasource3 = DataSource.objects.create(
            hardware_id=f"etl-test-source-3-{secrets.token_urlsafe(8)}-z-912.5",
            name="Punto de inclinómetro 01 cota 912.5",
            canonical_name=f"etl-test-{secrets.token_urlsafe(8)}",
            target=self.target_object,
        )
        self.datasource3.groups.add(self.datasourcegroup)

        self.timeseries1 = Timeseries.objects.create(
            name="Deformación de inclinómetro(Z) en el eje X",
            canonical_name=f"etl-test-source-1-eje-x-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
            template_name="ef-mvp.m2.parameters.deformacion-inclinometro-z-eje-x",
            data_source=self.datasource1,
            data_source_group=self.datasourcegroup,
        )

        self.timeseries2 = Timeseries.objects.create(
            name="Deformación de inclinómetro(Z) en el eje Y",
            canonical_name=f"etl-test-source-1-eje-y-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
            template_name="ef-mvp.m2.parameters.deformacion-inclinometro-z-eje-y",
            data_source=self.datasource1,
            data_source_group=self.datasourcegroup,
        )

        self.timeseries3 = Timeseries.objects.create(
            name="Deformación de inclinómetro(Z) en el eje Z",
            canonical_name=f"etl-test-source-1-eje-z-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
            template_name="ef-mvp.m2.parameters.deformacion-inclinometro-z-eje-z",
            data_source=self.datasource1,
            data_source_group=self.datasourcegroup,
        )

        self.timeseries4 = Timeseries.objects.create(
            name="Deformación de inclinómetro(Z) en el eje X",
            canonical_name=f"etl-test-source-2-eje-x-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
            template_name="ef-mvp.m2.parameters.deformacion-inclinometro-z-eje-x",
            data_source=self.datasource2,
            data_source_group=self.datasourcegroup,
        )

        self.timeseries5 = Timeseries.objects.create(
            name="Deformación de inclinómetro(Z) en el eje Y",
            canonical_name=f"etl-test-source-2-eje-y-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
            template_name="ef-mvp.m2.parameters.deformacion-inclinometro-z-eje-y",
            data_source=self.datasource2,
            data_source_group=self.datasourcegroup,
        )

        self.timeseries6 = Timeseries.objects.create(
            name="Deformación de inclinómetro(Z) en el eje Z",
            canonical_name=f"etl-test-source-2-eje-z-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
            template_name="ef-mvp.m2.parameters.deformacion-inclinometro-z-eje-z",
            data_source=self.datasource2,
            data_source_group=self.datasourcegroup,
        )

        self.timeseries7 = Timeseries.objects.create(
            name="Deformación de inclinómetro(Z) en el eje X",
            canonical_name=f"etl-test-source-3-eje-x-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
            template_name="ef-mvp.m2.parameters.deformacion-inclinometro-z-eje-x",
            data_source=self.datasource3,
            data_source_group=self.datasourcegroup,
        )

        self.timeseries8 = Timeseries.objects.create(
            name="Deformación de inclinómetro(Z) en el eje Y",
            canonical_name=f"etl-test-source-3-eje-y-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
            template_name="ef-mvp.m2.parameters.deformacion-inclinometro-z-eje-y",
            data_source=self.datasource3,
            data_source_group=self.datasourcegroup,
        )

        self.timeseries9 = Timeseries.objects.create(
            name="Deformación de inclinómetro(Z) en el eje Z",
            canonical_name=f"etl-test-source-3-eje-z-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
            template_name="ef-mvp.m2.parameters.deformacion-inclinometro-z-eje-z",
            data_source=self.datasource3,
            data_source_group=self.datasourcegroup,
        )

    def test_sector_instrument(self):
        datafile = self.make_copied_datafile(Path(__file__).parent / "test_ef_deformation_inclinometers.xlsx")
        operation = ETLOperation.start(
            "ef_deformation_inclinometers",
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
            set([("2019-11-29T00:00:00+00:00", -2.8)])
        )
        self.assertEqual(
            set((e["@timestamp"], e["value"]) for e in self.timeseries2.events),
            set([("2019-11-29T00:00:00+00:00", -5.4)])
        )
        self.assertEqual(
            set((e["@timestamp"], e["value"]) for e in self.timeseries3.events),
            set([("2019-11-29T00:00:00+00:00", 0.0)])
        )
        self.assertEqual(
            set((e["@timestamp"], e["value"]) for e in self.timeseries4.events),
            set([("2019-11-29T00:00:00+00:00", -2.6)])
        )
        self.assertEqual(
            set((e["@timestamp"], e["value"]) for e in self.timeseries5.events),
            set([("2019-11-29T00:00:00+00:00", -5.4)])
        )
        self.assertEqual(
            set((e["@timestamp"], e["value"]) for e in self.timeseries6.events),
            set([("2019-11-29T00:00:00+00:00", 0.0)])
        )
        self.assertEqual(
            set((e["@timestamp"], e["value"]) for e in self.timeseries7.events),
            set([("2019-11-29T00:00:00+00:00", -2.6)])
        )
        self.assertEqual(
            set((e["@timestamp"], e["value"]) for e in self.timeseries8.events),
            set([("2019-11-29T00:00:00+00:00", -5.4)])
        )
        self.assertEqual(
            set((e["@timestamp"], e["value"]) for e in self.timeseries9.events),
            set([("2019-11-29T00:00:00+00:00", 0.0)])
        )

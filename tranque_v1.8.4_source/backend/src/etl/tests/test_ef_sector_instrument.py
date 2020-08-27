from pathlib import Path
import secrets

from etl.exceptions import ETLError
from etl.models import ETLOperation
from etl.tests.base import ETLBase
from targets.models import Timeseries, DataSourceGroup, DataSource


class SectorInstrumentETLTestCase(ETLBase):

    def setUp(self):
        sector_group = DataSourceGroup.objects.create(
            name="Sectores",
            canonical_name="sectores",
            target=self.target_object,
        )
        self.datasourcegroup = DataSourceGroup.objects.create(
            name="Sector A",
            canonical_name=f"etl-test-{secrets.token_urlsafe(8)}",
            target=self.target_object,
        )
        self.datasourcegroup.parents.add(sector_group)
        self.datasource1 = DataSource.objects.create(
            hardware_id=f"etl-test-sector-instrument-1-{secrets.token_urlsafe(8)}",
            name="PZDE 4",
            canonical_name=f"etl-test-{secrets.token_urlsafe(8)}",
            target=self.target_object,
        )
        self.datasource1.groups.add(self.datasourcegroup)
        self.datasource2 = DataSource.objects.create(
            hardware_id=f"etl-test-sector-instrument-2-{secrets.token_urlsafe(8)}",
            name="PZDE 5",
            canonical_name=f"etl-test-{secrets.token_urlsafe(8)}",
            target=self.target_object,
        )
        self.datasource2.groups.add(self.datasourcegroup)

        self.timeseries1 = Timeseries.objects.create(
            name="Nivel freático del muro y depósito",
            canonical_name=f"etl-test-parameter-sector-1-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
            template_name="Test-123",
            data_source=self.datasource1,
            data_source_group=self.datasourcegroup,
        )
        self.timeseries2 = Timeseries.objects.create(
            name="Nivel freático del muro y depósito",
            canonical_name=f"etl-test-parameter-sector-2-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
            template_name="Test-123",
            data_source=self.datasource2,
            data_source_group=self.datasourcegroup,
        )

    def test_reject_invalid_shape(self):
        datafile = self.make_copied_datafile(Path(__file__).parent / "test_ef_sector_instrument.xlsx")
        self.assertRaises(
            ETLError,
            ETLOperation.start,
            "ef_parameter",
            datafile.uploaded_by,
            self.target_object,
            datafile,
            {"shape": "LALALALALA"},
        )

    def test_sector_instrument(self):
        datafile = self.make_copied_datafile(Path(__file__).parent / "test_ef_sector_instrument.xlsx")
        operation = ETLOperation.start(
            "ef_parameter",
            datafile.uploaded_by,
            self.target_object,
            datafile,
            {"shape": "sector_instrument", "series": "Test-123"},
        )
        assert not operation.finished, f"Operation finished before delivery: {operation.errors}"
        operation.deliver()
        self.assertEqual(operation.state, ETLOperation.ETLState.SUCCESS)
        self.assertEqual(
            set((e["@timestamp"], e["value"]) for e in self.timeseries1.events),
            set([("2018-04-12T00:00:00+00:00", 1000.0), ("2018-04-12T00:00:00+00:00", 2000.0)]),
        )
        self.assertEqual(
            set((e["@timestamp"], e["value"]) for e in self.timeseries2.events),
            set([("2018-04-12T00:00:00+00:00", 3000.0), ("2018-04-12T00:00:00+00:00", 4000.0)]),
        )

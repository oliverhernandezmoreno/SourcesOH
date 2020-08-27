from pathlib import Path
import secrets

from etl.exceptions import ETLError
from etl.models import ETLOperation
from etl.tests.base import ETLBase
from targets.models import Timeseries, DataSourceGroup


class ParameterSectorETLTestCase(ETLBase):

    def setUp(self):
        self.datasourcegroup1 = DataSourceGroup.objects.create(
            name="Sector A",
            canonical_name=f"etl-test-{secrets.token_urlsafe(8)}",
            target=self.target_object,
        )
        self.datasourcegroup2 = DataSourceGroup.objects.create(
            name="Sector B",
            canonical_name=f"etl-test-{secrets.token_urlsafe(8)}",
            target=self.target_object,
        )
        self.timeseries1 = Timeseries.objects.create(
            name="Densidad",
            canonical_name=f"etl-test-parameter-sector-1-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
            data_source_group=self.datasourcegroup1,
        )
        self.timeseries2 = Timeseries.objects.create(
            name="Densidad",
            canonical_name=f"etl-test-parameter-sector-2-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
            data_source_group=self.datasourcegroup2,
        )
        self.timeseries3 = Timeseries.objects.create(
            name="Donsidad",
            canonical_name=f"etl-test-parameter-sector-3-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
            data_source_group=self.datasourcegroup1,
        )
        self.timeseries4 = Timeseries.objects.create(
            name="Donsidad",
            canonical_name=f"etl-test-parameter-sector-4-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
            data_source_group=self.datasourcegroup2,
        )

    def test_reject_invalid_shape(self):
        datafile = self.make_copied_datafile(Path(__file__).parent / "test_ef_parameter_sector.xlsx")
        self.assertRaises(
            ETLError,
            ETLOperation.start,
            "ef_parameter",
            datafile.uploaded_by,
            self.target_object,
            datafile,
            {"shape": "FOOOOOO"},
        )

    def test_density_file(self):
        datafile = self.make_copied_datafile(Path(__file__).parent / "test_ef_parameter_sector.xlsx")
        operation = ETLOperation.start(
            "ef_parameter",
            datafile.uploaded_by,
            self.target_object,
            datafile,
            {"shape": "parameter_sector"},
        )
        assert not operation.finished, f"Operation finished before delivery: {operation.errors}"
        operation.deliver()
        self.assertEqual(operation.state, ETLOperation.ETLState.SUCCESS)
        self.assertEqual(
            [(e["@timestamp"], e["value"]) for e in self.timeseries1.events],
            [("2019-04-12T00:00:00+00:00", 10)],
        )
        self.assertEqual(
            [(e["@timestamp"], e["value"]) for e in self.timeseries2.events],
            [("2019-04-12T00:00:00+00:00", 20)],
        )
        self.assertEqual(
            [(e["@timestamp"], e["value"]) for e in self.timeseries3.events],
            [("2019-04-12T00:00:00+00:00", 30)],
        )
        self.assertEqual(
            [(e["@timestamp"], e["value"]) for e in self.timeseries4.events],
            [("2019-04-12T00:00:00+00:00", 40)],
        )

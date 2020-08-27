from pathlib import Path
import secrets

from etl.models import ETLOperation
from etl.tests.base import ETLBase
from targets.models import Timeseries


class OnlyParameterETLTestCase(ETLBase):

    def setUp(self):
        self.timeseries1 = Timeseries.objects.create(
            name="Cota laguna",
            canonical_name=f"etl-test-parameter-1-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
        )
        self.timeseries2 = Timeseries.objects.create(
            name="Cote laguna",
            canonical_name=f"etl-test-parameter-2-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
        )

    def test_only_parameter(self):
        datafile = self.make_copied_datafile(Path(__file__).parent / "test_ef_only_parameter.xlsx")
        operation = ETLOperation.start(
            "ef_parameter",
            datafile.uploaded_by,
            self.target_object,
            datafile,
            {"shape": "only_parameter"},
        )
        assert not operation.finished, f"Operation finished before delivery: {operation.errors}"
        operation.deliver()
        self.assertEqual(operation.state, ETLOperation.ETLState.SUCCESS)
        self.assertEqual(
            set([(e["@timestamp"], e["value"]) for e in self.timeseries1.events]),
            set([("2019-04-12T00:00:00+00:00", 1000.0), ("2019-04-12T00:00:00+00:00", 2000.0)]),
        )
        self.assertEqual(
            set([(e["@timestamp"], e["value"]) for e in self.timeseries2.events]),
            set([("2019-04-12T00:00:00+00:00", 3000.0), ("2019-04-12T00:00:00+00:00", 4000.0)]),
        )

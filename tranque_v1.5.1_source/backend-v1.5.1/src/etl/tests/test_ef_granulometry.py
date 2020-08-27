from pathlib import Path
import secrets

from etl.models import ETLOperation
from etl.tests.base import ETLBase
from targets.models import Timeseries


class GranulometryETLTestCase(ETLBase):

    def setUp(self):
        self.timeseries = Timeseries.objects.create(
            name="Granulometría",
            canonical_name=f"etl-test-granulometry-1-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
            template_name="ef-mvp.m2.parameters.granulometria",
        )

    def test_granulometry(self):
        datafile = self.make_copied_datafile(Path(__file__).parent / "test_ef_granulometry.xlsx")
        operation = ETLOperation.start(
            "ef_granulometry",
            datafile.uploaded_by,
            self.target_object,
            datafile,
            {},
        )
        assert not operation.finished, f"Operation finished before delivery: {operation.errors}"
        operation.deliver()
        self.assertEqual(operation.state, ETLOperation.ETLState.SUCCESS)

        xlsx = sorted(set(
            (e["meta"]["malla"], e["meta"]["muestra"], e["@timestamp"], e["value"], e["meta"]["abertura"])
            for e in self.timeseries.events), key=lambda x: (x[1], x[4]))

        test = sorted(set([
            ("35", "Turno A", "2020-04-30T00:00:00+00:00", 45.2, 0.42),
            ("48", "Turno A", "2020-04-30T00:00:00+00:00", 80.1, 0.297),
            ("65", "Turno A", "2020-04-30T00:00:00+00:00", 120.1, 0.21),
            ("100", "Turno A", "2020-04-30T00:00:00+00:00", 104.6, 0.149),
            ("150", "Turno A", "2020-04-30T00:00:00+00:00", 77.9, 0.105),
            ("200", "Turno A", "2020-04-30T00:00:00+00:00", 43.8, 0.074),
            ("Bajo 200", "Turno A", "2020-04-30T00:00:00+00:00", 84.3, 0),
            ("35", "Turno B", "2020-04-30T00:00:00+00:00", 57.3, 0.42),
            ("48", "Turno B", "2020-04-30T00:00:00+00:00", 89.5, 0.297),
        ]), key=lambda x: (x[1], x[4]))

        # ("65", "Turno B", "2020-04-30T00:00:00+00:00", 125.6, 0.21),
        # ("100","Turno B", "2020-04-30T00:00:00+00:00", 100.5, 0.149),
        # ("150", "Turno B", "2020-04-30T00:00:00+00:00", 82.3, 0.105),
        # ("200", "Turno B", "2020-04-30T00:00:00+00:00", 45.8, 0.074),
        # ("Bajo 200", "Turno B", "2020-04-30T00:00:00+00:00", 84.6, 0)

        self.assertEqual(xlsx, test)

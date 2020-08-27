from pathlib import Path
import secrets

from etl.models import ETLOperation
from etl.tests.base import ETLBase
from targets.models import Timeseries, DataSource, DataSourceGroup, Parameter


class TopographicETLTestCase(ETLBase):

    def setUp(self):
        from targets.profiling import MANIFESTS
        self._ef_manifest = MANIFESTS.get("ef")
        self.datasource = DataSource.objects.create(
            hardware_id=f"etl-test-test-topographic-1-{secrets.token_urlsafe(8)}",
            name="Perfil tranversal 525",
            canonical_name=f"etl-test-{secrets.token_urlsafe(8)}",
            target=self.target_object,
        )
        self.datasource.groups.set([DataSourceGroup.objects.create(
            name="Perfiles transversales",
            canonical_name="perfil-transversal",
            target=self.target_object,
        )])
        self.timeseries1 = Timeseries.objects.create(
            name="Elevación",
            canonical_name=f"etl-test-topographic-1-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
            template_name="ef-mvp.m2.parameters.variables.elevacion",
            data_source=self.datasource,
        )
        self.timeseries2 = Timeseries.objects.create(
            name="Deformación del suelo de fundación",
            canonical_name=f"etl-test-topographic-2-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
            template_name="ef-mvp.m2.parameters.variables.perfil-suelo-fundacion",
            data_source=self.datasource,
        )

    def get_label(self, event):
        return next(
            (
                label["value"]
                for label in event
                if label["key"] == "enrichment-tag"
            ),
            "",
        )

    def test_topographic(self):
        datafile = self.make_copied_datafile(Path(__file__).parent / "test_ef_topographic.xlsx")
        operation = ETLOperation.start(
            "ef_topographic",
            datafile.uploaded_by,
            self.target_object,
            datafile,
            {},
        )
        assert not operation.finished, f"Operation finished before delivery: {operation.errors}"
        operation.deliver()
        self.assertEqual(operation.state, ETLOperation.ETLState.SUCCESS)
        self.assertEqual(
            set(
                (e["@timestamp"], e["coords"]["x"], e["value"], self.get_label(e["labels"]))
                for e in self.timeseries1.events),
            set([
                ("2019-03-22T00:00:00+00:00", 10, 850.11, "Talud aguas abajo"),
                ("2019-03-22T00:00:00+00:00", 140, 905.2, "Coronamiento")]),
        )
        self.assertEqual(
            set(
                (e["@timestamp"], e["coords"]["x"], e["value"])
                for e in self.timeseries2.events),
            set([
                ("2019-03-22T00:00:00+00:00", 10, 801.03),
                ("2019-03-22T00:00:00+00:00", 130, 795.25)]),
        )
        self.assertEqual(
            [e["meta"].get("coordinates") for e in (*self.timeseries1.events, *self.timeseries2.events)],
            [[1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4]]
        )

    def test_topographic_with_parameters(self):
        from targets.profiling import MANIFESTS
        Parameter.objects.create(
            target=self.target_object,
            canonical_name="label-segmento-talud-aguas-abajo",
            value="Talud aguas abajo"
        )
        MANIFESTS["ef"] = {
            "parameters": {
                p.canonical_name: "not-used"
                for p in Parameter.objects.filter(
                    target=self.target_object,
                    canonical_name__startswith="label-"
                )
            }
        }
        try:
            self.test_topographic()
            raise ValueError("didn't fail")
        except AssertionError:
            pass
        except ValueError:
            assert False, "Didn't fail with invalid-label"
        # Add the missing parameter and try again
        Parameter.objects.create(
            target=self.target_object,
            canonical_name="label-segmento-coronamiento",
            value="Coronamiento"
        )
        MANIFESTS["ef"]["parameters"].update({
            p.canonical_name: "not-used"
            for p in Parameter.objects.filter(
                target=self.target_object,
                canonical_name__startswith="label-"
            )
        })
        self.test_topographic()

    def tearDown(self):
        from targets.profiling import MANIFESTS
        MANIFESTS.pop("ef", None)
        if self._ef_manifest is not None:
            MANIFESTS["ef"] = self._ef_manifest

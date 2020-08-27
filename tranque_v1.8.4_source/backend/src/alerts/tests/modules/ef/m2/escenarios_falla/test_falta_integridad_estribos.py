from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from targets.models import Timeseries


class FaltaIntegridadEstribosTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object
        controller = f'.ef.m2.escenarios_falla.eventos_inestabilidad_talud.falta_integridad_estribos'
        sector = self.sector_a.canonical_name

        self.modules_hints = [
            f'g({sector}){controller}',
        ]

        base_name = f'{target.canonical_name}.g-{sector}.ef-mvp.m2.failure_scenarios.it-05.'
        template_name = "ef-mvp.m2.failure_scenarios.it-05."

        ts = [
                (
                    Timeseries.objects.create(
                        target=target,
                        name="D1",
                        template_name=f'{template_name}D1',
                        canonical_name=f'{base_name}D1',
                        type=Timeseries.TimeseriesType.TEST
                    ),
                    "D1"
                )
        ]

        self.timeseries = ts
        self.independent = ts

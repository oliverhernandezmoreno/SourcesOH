from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from targets.models import Timeseries


class OlaDeslizamientoTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object

        self.modules_hints = [
            f'_.ef.m2.escenarios_falla.eventos_rebalse.ola_deslizamiento'
        ]

        base_name = f'{target.canonical_name}.none.ef-mvp.m2.failure_scenarios.re-02.'
        template = "ef-mvp.m2.failure_scenarios.re-02."

        ts = [
                (
                    Timeseries.objects.create(
                        target=target,
                        name="D2",
                        template_name=f'{template}D2',
                        canonical_name=f'{base_name}D2',
                        type=Timeseries.TimeseriesType.TEST
                    ),
                    "D2"
                )
        ]

        self.timeseries = ts
        self.independent = ts

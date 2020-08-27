from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from targets.models import Timeseries


class PerdidaRevanchaTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object
        controller = f'.ef.m2.escenarios_falla.eventos_rebalse.perdida_revancha_hidraulica.'

        self.modules_hints = [
            f'_{controller}C1',
            f'_{controller}D1',

        ]

        base_name = f'{target.canonical_name}.none.ef-mvp.m2.failure_scenarios.re-01.'
        template_name = "ef-mvp.m2.failure_scenarios.re-01."

        ts = [
            (
                Timeseries.objects.create(
                    target=target,
                    name=suffix,
                    template_name=f'{template_name}{suffix}',
                    canonical_name=f'{base_name}{suffix}',
                    type=Timeseries.TimeseriesType.TEST
                ),
                suffix
            )
            for suffix in ['C1', 'D1']
        ]

        self.timeseries = ts
        self.independent = ts

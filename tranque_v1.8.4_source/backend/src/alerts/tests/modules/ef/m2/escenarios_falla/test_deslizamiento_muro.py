from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from targets.models import Timeseries


class DeslizamientoMuroTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object
        controller = f'.ef.m2.escenarios_falla.eventos_inestabilidad_talud.deslizamiento_muro.'
        sector = self.sector_a.canonical_name

        self.modules_hints = [
            f'g({sector}){controller}C1',
            f'g({sector}){controller}D1',
            f'g({sector}){controller}D2',
        ]

        base_name = f'{target.canonical_name}.g-{sector}.ef-mvp.m2.failure_scenarios.it-06.'
        template = 'ef-mvp.m2.failure_scenarios.it-06.'

        ts = [
            (
                Timeseries.objects.create(
                    target=target,
                    name=suffix,
                    template_name=f'{template}{suffix}',
                    canonical_name=f'{base_name}{suffix}',
                    type=Timeseries.TimeseriesType.TEST
                ),
                suffix
            )
            for suffix in ['C1', 'D1', 'D2']
        ]

        self.timeseries = ts
        self.independent = ts

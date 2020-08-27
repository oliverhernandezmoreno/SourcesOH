from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from targets.models import Timeseries


class ErosionFiltracionTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object
        controller = '.ef.m2.escenarios_falla.eventos_erosion_interna.filtracion_descontrolada'
        sector = self.sector_a.canonical_name

        self.modules_hints = [
            f'g({sector}){controller}',
        ]

        self.base_name = f'{target.canonical_name}.g-{sector}.ef-mvp.m2.failure_scenarios.ei-01.'
        self.template = 'ef-mvp.m2.failure_scenarios.ei-01.'

        ts = [
                (
                    Timeseries.objects.create(
                        target=target,
                        name="D1",
                        template_name=f'{self.template}D1',
                        canonical_name=f'{self.base_name}D1',
                        type=Timeseries.TimeseriesType.TEST
                    ),
                    'D1'
                )
        ]

        self.timeseries = ts
        self.independent = ts

from django.test import override_settings
from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from targets.models import Timeseries


@override_settings(STACK_IS_SML=True)
class DistanciaMinimaMuroLagunaTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object
        controller = '.ef.m1_m2.distancia_minima_muro_laguna.'
        sector = self.sector_a.canonical_name

        self.modules_hints = [
            f'g({sector}){controller}ABC',
            f'_{controller}B1',
        ]

        self.base_name = f'{target.canonical_name}.g-{sector}.ef-mvp.m2.parameters.distancia-laguna.'
        self.template = f'ef-mvp.m2.parameters.distancia-laguna.'

        self.timeseries = [
            (
                Timeseries.objects.create(
                    target=target,
                    name="B1",
                    template_name="ef-mvp.m1.design.laguna",
                    canonical_name=f'{target.canonical_name}.none.ef-mvp.m1.design.laguna',
                    type=Timeseries.TimeseriesType.TEST
                ),
                'B1'
            )
        ]

        self.timeseries.extend([
            (
                Timeseries.objects.create(
                    target=target,
                    name=suffix,
                    template_name=f'{self.template}{suffix}',
                    canonical_name=f'{self.base_name}{suffix}',
                    type=Timeseries.TimeseriesType.TEST
                ),
                suffix
            ) for suffix in ['A1', 'B2', 'C1']
        ])

        self.type_2_escalation = [
            # A1 -> B2
            [self.timeseries[1], self.timeseries[2]],
            # B2 -> C1
            [self.timeseries[2], self.timeseries[3]]
        ]

from django.test import override_settings
from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from targets.models import Timeseries


@override_settings(STACK_IS_SML=True)
class AnchoCoronamientoTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object

        controller = f'.ef.m1_m2.ancho_coronamiento.'
        sector = self.sector_a.canonical_name

        self.modules_hints = [
            f'_{controller}A1',
            f'g({sector}){controller}AB',
            f'g({sector}){controller}B2',
        ]

        self.base_name = f'{target.canonical_name}.g-{sector}.ef-mvp.m2.parameters.ancho-coronamiento.sector.'
        self.template = f'ef-mvp.m2.parameters.ancho-coronamiento.sector.'

        self.timeseries = [
            (
                Timeseries.objects.create(
                    target=target,
                    name="A1",
                    template_name="ef-mvp.m1.design.coronamiento",
                    canonical_name=f'{target.canonical_name}.none.ef-mvp.m1.design.coronamiento',
                    type=Timeseries.TimeseriesType.TEST
                ),
                'A1'
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
            ) for suffix in ["A2", "B1", "B2"]
        ])

        # self.timeseries = A1, A2, B1, B2
        self.independent = [self.timeseries[0]]

        self.type_2_escalation = [
            # A2 -> B1
            [self.timeseries[1], self.timeseries[2]],
        ]

        self.type_1_escalation = [
            # B1 -> B2
            ([self.timeseries[2]], self.timeseries[3]),
        ]

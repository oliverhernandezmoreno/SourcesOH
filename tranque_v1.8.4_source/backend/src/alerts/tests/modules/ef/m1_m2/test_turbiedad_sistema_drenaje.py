from django.test import override_settings

from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from targets.models import Timeseries


@override_settings(STACK_IS_SML=True)
class TurbiedadSistemaDrenajeTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object
        controller = f'.ef.m1_m2.turbiedad_sistema_drenaje.'
        turbidimeter = self.turbidimeters[0].hardware_id

        self.modules_hints = [
            f'_{controller}B1',
            f's({turbidimeter}){controller}B2',
            f's({turbidimeter}){controller}B3',
            f's({turbidimeter}){controller}C1',
        ]

        self.base_name = f'{target.canonical_name}.s-{turbidimeter}.ef-mvp.m2.parameters.turbiedad.'
        self.template = f'ef-mvp.m2.parameters.turbiedad.'

        self.timeseries = [
            (
                Timeseries.objects.create(
                    target=target,
                    name="B1",
                    template_name="ef-mvp.m1.triggers.turbiedad",
                    canonical_name=f'{target.canonical_name}.none.ef-mvp.m1.triggers.turbiedad',
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
            ) for suffix in ["B2", "B3", "C1"]
        ])

        # self.timeseries = B1, B2, B3, C1
        self.independent = [self.timeseries[0], self.timeseries[1]]

        self.type_1_escalation = [
            # B3 -> C1
            ([self.timeseries[2]], self.timeseries[3]),
        ]

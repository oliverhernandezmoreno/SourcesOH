from django.test import override_settings

from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from targets.models import Timeseries


@override_settings(STACK_IS_SML=True)
class PendienteMuroTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object

        controller = f'.ef.m1_m2.pendiente_muro.'
        sector = f'g({self.sector_a.canonical_name})'

        self.modules_hints = [
            f'_{controller}A1',
            f'{sector}{controller}A2',
            f'{sector}{controller}A3',
            f'{sector}{controller}B1B3',
            f'{sector}{controller}B2B4',
        ]

        cs_id = self.cross_section.hardware_id
        self.base_name = f'{target.canonical_name}.s-{cs_id}.ef-mvp.m2.parameters.pendiente-muro.sector.'

        self.timeseries = [
            (
                Timeseries.objects.create(
                    target=target,
                    name="A1",
                    template_name="ef-mvp.m1.design.talud",
                    canonical_name=f'{self.base_name}A1',
                    data_source=self.cross_section,
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
                    canonical_name=f'{self.base_name}{suffix}',
                    data_source=self.cross_section,
                    type=Timeseries.TimeseriesType.TEST
                ),
                suffix
            ) for suffix in ["A2", "A3", "B1", "B2", "B3", "B4"]
        ])

        # self.timeseries = "A1", "A2", "A3", "B1", "B2", "B3", "B4"
        self.independent = [self.timeseries[0],
                            self.timeseries[1],
                            self.timeseries[2]
                            ]

        self.type_2_escalation = [
            # B1 -> B3
            [self.timeseries[3], self.timeseries[5]],
            # B2 -> B4
            [self.timeseries[4], self.timeseries[6]],
        ]

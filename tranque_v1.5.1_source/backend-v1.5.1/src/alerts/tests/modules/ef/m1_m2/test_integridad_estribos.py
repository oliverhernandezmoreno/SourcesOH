from django.test import override_settings
from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from targets.models import Timeseries


@override_settings(STACK_IS_SML=True)
class IntegridadEstribosTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object
        controller = f'.ef.m1_m2.integridad_estribos.'
        sector = self.sector_a.canonical_name

        self.modules_hints = [
            f'_{controller}B1',
            f'g({sector}){controller}BCD',
        ]

        self.base_name = f'{target.canonical_name}.g-{sector}.ef-mvp.m2.parameters.integridad-externa.estribos.'

        self.timeseries = [
            (
                Timeseries.objects.create(
                    target=target,
                    name="B1",
                    template_name="ef-mvp.m1.triggers.estribo",
                    canonical_name=f'{self.target_object.canonical_name}.none.ef-mvp.m1.triggers.estribo',
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
                    canonical_name=f'{self.base_name}{suffix}',
                    type=Timeseries.TimeseriesType.TEST
                ),
                suffix
            ) for suffix in ["B2", "C1", "D1"]
        ])

        self.type_1_escalation = [
            # B1 -> B2
            ([self.timeseries[0]], self.timeseries[1]),
        ]

        self.type_2_escalation = [
            # B2 -> C1
            [self.timeseries[1], self.timeseries[2]],
            # C1 -> D1
            [self.timeseries[2], self.timeseries[3]],
        ]

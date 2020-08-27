from django.test import override_settings

from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from targets.models import Timeseries


@override_settings(STACK_IS_SML=True)
class PotencialRebalseTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object
        controller = f'_.ef.m1_m2.potencial_rebalse.'

        self.modules_hints = [
            f'{controller}A1',
            f'{controller}A2',
            f'{controller}AB',
            f'{controller}B1',
            f'{controller}B2',
            f'{controller}B3',
        ]

        self.base_name = f'{target.canonical_name}.none.ef-mvp.m2.parameters.potencial-rebalse.'
        self.template = 'ef-mvp.m2.parameters.potencial-rebalse.'

        self.timeseries = [
            (
                Timeseries.objects.create(
                    target=target,
                    name="A1",
                    canonical_name=f'{target.canonical_name}.none.ef-mvp.m1.triggers.canales-perimetrales',
                    template_name="ef-mvp.m1.triggers.canales-perimetrales",
                    type=Timeseries.TimeseriesType.TEST
                ),
                'A1'  # Falla o bloqueo de canales perimetrales
            ),
            (
                Timeseries.objects.create(
                    target=target,
                    name="B1",
                    canonical_name=f'{target.canonical_name}.none.ef-mvp.m1.forecasts.lluvia',
                    template_name="ef-mvp.m1.forecasts.lluvia",
                    type=Timeseries.TimeseriesType.TEST
                ),
                'B1'  # Pronóstico de lluvia
            ),
            (
                Timeseries.objects.create(
                    target=target,
                    name="B2",
                    canonical_name=f'{target.canonical_name}.none.ef-mvp.m1.triggers.important.lluvia',
                    template_name="ef-mvp.m1.triggers.important.lluvia",
                    type=Timeseries.TimeseriesType.TEST
                ),
                'B2'  # Inicio de lluvia
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
            ) for suffix in ["A2", "A3", "B3", "B4"]
        ])

        # A1 (independent) + B1, B2 (exclusive activation) + A2, B3 (independent)
        self.independent = [
            self.timeseries[0],
            self.timeseries[1],
            self.timeseries[2],
            self.timeseries[3],
            self.timeseries[5]
        ]

        self.type_2_escalation = [
            # A3 -> B4
            [self.timeseries[4], self.timeseries[6]],
        ]

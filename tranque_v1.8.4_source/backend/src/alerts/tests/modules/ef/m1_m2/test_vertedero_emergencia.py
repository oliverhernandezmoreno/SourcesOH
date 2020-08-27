from django.test import override_settings
from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from targets.models import Timeseries


@override_settings(STACK_IS_SML=True)
class VertederoEmergenciaTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object

        controller = '_.ef.m1_m2.vertedero_emergencia.'

        self.modules_hints = [
            f'{controller}A1',
            f'{controller}A2',
            f'{controller}B1',
        ]

        self.timeseries = [
            (
                Timeseries.objects.create(
                    target=target,
                    name="A1",
                    template_name="ef-mvp.m1.triggers.vertedero",
                    canonical_name=f'{target.canonical_name}.none.ef-mvp.m1.triggers.vertedero',
                    type=Timeseries.TimeseriesType.TEST
                ),
                'A1'  # Falla o bloqueo del vertedero de emergencia
            ),
            (
                Timeseries.objects.create(
                    target=target,
                    name="A2",
                    template_name="ef-mvp.m1.triggers.cota-vertedero",
                    canonical_name=f'{target.canonical_name}.none.ef-mvp.m1.triggers.cota-vertedero',
                    type=Timeseries.TimeseriesType.TEST
                ),
                'A2'  # Modificación de cota de operación del vertedero de emergencia
            ),
            (
                Timeseries.objects.create(
                    target=target,
                    name="B1",
                    template_name="ef-mvp.m2.parameters.estado-vertedero.B1",
                    canonical_name=f'{target.canonical_name}.none.ef-mvp.m2.parameters.estado-vertedero.B1',
                    type=Timeseries.TimeseriesType.TEST
                ),
                'B1'
            )
        ]

        # Timeseries from nested tickets (Potencial de rebalse)
        self.timeseries.extend([
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
        ])

        # A1, A2
        self.independent = [self.timeseries[0], self.timeseries[1]]

        # A1(vertedero) and potencial de rebalse B1||B2 nested in B1(vertedero)
        self.type_1_escalation = [
            # A1 + (B1, B2 from potencial de rebalse) -> B1
            ([self.timeseries[0], self.timeseries[3], self.timeseries[4]], self.timeseries[2]),
        ]

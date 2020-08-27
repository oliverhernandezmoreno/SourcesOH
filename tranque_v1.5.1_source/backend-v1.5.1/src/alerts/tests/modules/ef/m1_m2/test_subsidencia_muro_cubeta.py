from django.test import override_settings

from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from targets.models import Timeseries


@override_settings(STACK_IS_SML=True)
class SubsidenciaMuroCubetaControllerTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object
        controller = f'.ef.m1_m2.subsidencia_muro_cubeta.'
        sector = self.sector_a.canonical_name

        self.modules_hints = [
            f'_{controller}B1',
            f'_{controller}B2',
            f'g({sector}){controller}C1C2',
        ]

        self.base_name = f'{target.canonical_name}.g-{sector}.ef-mvp.m2.parameters.integridad-externa.subsidencia.muro.'
        self.template = f'ef-mvp.m2.parameters.integridad-externa.subsidencia.muro.'

        self.timeseries = [
            (
                Timeseries.objects.create(
                    target=target,
                    name="B1",
                    template_name="ef-mvp.m1.triggers.subsidencia-muro",
                    canonical_name=f'{target.canonical_name}.none.ef-mvp.m1.triggers.subsidencia-muro',
                    type=Timeseries.TimeseriesType.TEST
                ),
                "B1"
            ),
            (
                Timeseries.objects.create(
                    target=target,
                    name="B2",
                    template_name="ef-mvp.m1.triggers.subsidencia-cubeta",
                    canonical_name=f'{target.canonical_name}.none.ef-mvp.m1.triggers.subsidencia-cubeta',
                    type=Timeseries.TimeseriesType.TEST
                ),
                "B2"
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
            ) for suffix in ["C1", "C2"]
        ])

        self.independent = [self.timeseries[1]]

        self.type_1_escalation = [
            # B1 -> C1
            ([self.timeseries[0]], self.timeseries[2]),
        ]

        self.type_2_escalation = [
            # C1 -> C2
            [self.timeseries[2], self.timeseries[3]],
        ]

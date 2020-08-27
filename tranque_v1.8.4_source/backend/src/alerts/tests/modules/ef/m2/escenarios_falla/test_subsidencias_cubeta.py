from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from targets.models import Timeseries


class SubsidenciasCubetaTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object
        controller = '.ef.m2.escenarios_falla.eventos_erosion_interna.subsidencias_cubeta.'
        sector = self.sector_a.canonical_name

        self.modules_hints = [
            f'g({sector}){controller}C1D1',
        ]

        self.base_name = f'{target.canonical_name}.g-{sector}.ef-mvp.m2.failure_scenarios.ei-02.'
        self.template = 'ef-mvp.m2.failure_scenarios.ei-02.'

        self.timeseries = [
            (
                Timeseries.objects.create(
                    target=target,
                    name=suffix,
                    template_name=f'{self.template}{suffix}',
                    canonical_name=f'{self.base_name}{suffix}',
                    type=Timeseries.TimeseriesType.TEST
                ),
                suffix
            ) for suffix in ["C1", "D1"]
        ]

        self.type_2_escalation = [
            # C1 -> D1
            [self.timeseries[0], self.timeseries[1]],
        ]

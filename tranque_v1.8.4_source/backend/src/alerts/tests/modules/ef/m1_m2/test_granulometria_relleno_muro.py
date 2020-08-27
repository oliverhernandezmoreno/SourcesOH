from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from targets.models import Timeseries


class GranulometriaRellenoMuroTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object
        controller = f'.ef.m1_m2.granulometria_relleno_muro.'
        sector = self.sector_a.canonical_name

        self.modules_hints = [
            f'_{controller}A1',
            f'_{controller}B1',
            f'g({sector}){controller}B2',
        ]

        self.template_name = "ef-mvp.m2.parameters.granulometria."
        self.base_name = f'{target.canonical_name}.g-{sector}.{self.template_name}'
        self.timeseries = [
            (
                Timeseries.objects.create(
                    target=target,
                    name=suffix,
                    template_name=f'{self.template_name}{suffix}',
                    canonical_name=f'{target.canonical_name}.none.{self.template_name}{suffix}',
                    type=Timeseries.TimeseriesType.TEST
                ),
                suffix
            ) for suffix in ["A1", "B1"]
        ]

        self.timeseries.extend([
            (
                Timeseries.objects.create(
                    target=target,
                    name=suffix,
                    template_name=f'{self.template_name}{suffix}',
                    canonical_name=f'{self.base_name}{suffix}',
                    type=Timeseries.TimeseriesType.TEST
                ),
                suffix
            ) for suffix in ["B2"]
        ])

        self.independent = [self.timeseries[0],
                            self.timeseries[1],
                            self.timeseries[2]]

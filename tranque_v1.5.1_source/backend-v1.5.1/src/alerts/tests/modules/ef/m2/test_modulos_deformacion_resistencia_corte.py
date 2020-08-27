from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from targets.models import Timeseries


class ModulosDeformacionTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object

        controller = f'.ef.m2.modulos_deformacion_resistencia_corte.'
        sector = self.sector_a.canonical_name

        self.modules_hints = [
            f'g({sector}){controller}B1',
            f'g({sector}){controller}C1',
            f'g({sector}){controller}BCD',
        ]

        self.base_name = f'{target.canonical_name}.g-{sector}.ef-mvp.m2.parameters.discrete.resistencia-corte-muro.'
        self.template = f'ef-mvp.m2.parameters.discrete.resistencia-corte-muro.'

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
            ) for suffix in ["B1", "B2", "C1", "C2", "D1"]
        ]

        self.type_1_escalation = [
            # B1 -> C1
            ([self.timeseries[0]], self.timeseries[2]),
        ]

        self.type_2_escalation = [
            # B2 -> C2
            [self.timeseries[1], self.timeseries[3]],
            # C2 -> D1
            [self.timeseries[3], self.timeseries[4]],

        ]

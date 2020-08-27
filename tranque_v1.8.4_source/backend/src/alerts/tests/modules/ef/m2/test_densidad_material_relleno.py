from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from targets.models import Timeseries


class DensidadMaterialRellenoTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object
        controller = f'.ef.m2.densidad_material_relleno.'
        sector = self.sector_a.canonical_name

        self.modules_hints = [
            f'g({sector}){controller}B1',
            f'g({sector}){controller}B2',
        ]

        base_name = f'{target.canonical_name}.g-{sector}.ef-mvp.m2.parameters.densidad.'
        template = 'ef-mvp.m2.parameters.densidad.'

        ts = [
            (
                Timeseries.objects.create(
                    target=target,
                    name=suffix,
                    template_name=f'{template}{suffix}',
                    canonical_name=f'{base_name}{suffix}',
                    type=Timeseries.TimeseriesType.TEST
                ),
                suffix
            )
            for suffix in ['B1', 'B2']
        ]

        self.timeseries = ts
        self.independent = ts

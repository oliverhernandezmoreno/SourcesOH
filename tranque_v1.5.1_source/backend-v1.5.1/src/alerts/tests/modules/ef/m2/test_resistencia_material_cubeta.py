from targets.models import Timeseries
from alerts.tests.modules.ef.ef_controller_base import EFControllerBase


class ResistenciaMaterialCubetaTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object

        controller = f'.ef.m2.resistencia_material_cubeta'
        sector = self.sector_a.canonical_name

        self.modules_hints = [
            f'g({sector}){controller}',
        ]

        self.base_name = f'{target.canonical_name}.g-{sector}.ef-mvp.m2.parameters.discrete.resistencia-material'

        ts = [
            (
                Timeseries.objects.create(
                    target=target,
                    name="B1",
                    template_name='ef-mvp.m2.parameters.discrete.resistencia-material',
                    canonical_name=f'{self.base_name}',
                    type=Timeseries.TimeseriesType.TEST
                ),
                "B1"
            )
        ]
        self.timeseries = ts
        self.independent = ts

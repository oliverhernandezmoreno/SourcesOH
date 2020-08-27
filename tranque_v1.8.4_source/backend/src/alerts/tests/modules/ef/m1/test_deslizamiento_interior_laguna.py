from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from targets.models import Timeseries


class DeslizamientoInteriorLagunaTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object

        controller = f'.ef.m1.inspeccion_diaria.eventos_gatilladores.deslizamiento_interior_laguna.'

        self.modules_hints = [
            f'_{controller}C1',
            f'_{controller}D1',
        ]

        base_name = f'{target.canonical_name}.none.ef-mvp.m1.triggers.deslizamiento-inminente.'
        template = 'ef-mvp.m1.triggers.deslizamiento-inminente.'

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
                ) for suffix in ["C1", "D1"]
        ]

        self.timeseries = ts
        self.independent = ts

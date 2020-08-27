from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from targets.models import Timeseries


class DeslizamientoSectorMuroTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object

        self.modules_hints = [
            f'_.ef.m1.inspeccion_diaria.eventos_gatilladores.deslizamiento_sector_muro'
        ]

        base_name = f'{target.canonical_name}.none.ef-mvp.m1.triggers.deslizamiento-menor'

        ts = [
                (
                    Timeseries.objects.create(
                        target=target,
                        name="B1",
                        template_name="ef-mvp.m1.triggers.deslizamiento-menor",
                        canonical_name=f'{base_name}',
                        type=Timeseries.TimeseriesType.TEST
                    ),
                    'B1'
                )
        ]

        self.timeseries = ts
        self.independent = ts

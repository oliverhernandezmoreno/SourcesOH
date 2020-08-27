from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from targets.models import Timeseries


class DistribucionInadecuadaTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object

        self.modules_hints = [
            f'_.ef.m1.inspeccion_diaria.eventos_gatilladores.distribucion_inadecuada'
        ]

        base_name = f'{target.canonical_name}.none.ef-mvp.m1.triggers.distribucion-inadecuada'

        ts = [
                (
                    Timeseries.objects.create(
                        target=target,
                        name="A1",
                        template_name="ef-mvp.m1.triggers.distribucion-inadecuada",
                        canonical_name=f'{base_name}',
                        type=Timeseries.TimeseriesType.TEST
                    ),
                    'A1'
                )
        ]

        self.timeseries = ts
        self.independent = ts

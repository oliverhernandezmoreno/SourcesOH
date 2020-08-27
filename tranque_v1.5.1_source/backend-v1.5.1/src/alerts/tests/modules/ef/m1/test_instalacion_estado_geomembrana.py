from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from targets.models import Timeseries


class InstalacionEstadoGeomembranaTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object

        self.modules_hints = [
            f'_.ef.m1.inspeccion_diaria.desviaciones_diseño.instalacion_estado_geomembrana'
        ]

        base_name = f'{target.canonical_name}.none.ef-mvp.m1.design.geomembrana'

        ts = [
                (
                    Timeseries.objects.create(
                        target=target,
                        name="A1",
                        template_name="ef-mvp.m1.design.geomembrana",
                        canonical_name=f'{base_name}',
                        type=Timeseries.TimeseriesType.TEST
                    ),
                    'A1'
                )
        ]

        self.timeseries = ts
        self.independent = ts

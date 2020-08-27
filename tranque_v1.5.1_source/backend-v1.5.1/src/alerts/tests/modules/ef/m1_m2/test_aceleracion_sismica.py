from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from targets.models import Timeseries


class AceleracionSismicaTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object
        controller = f'.ef.m1_m2.aceleracion_sismica.'
        accelerograph = self.accelerographs[0].hardware_id

        self.modules_hints = [
            f'_{controller}A1',
            f's({accelerograph}){controller}D1',
            f's({accelerograph}){controller}D2',
            f's({accelerograph}){controller}D3',
        ]

        base_name = f'{target.canonical_name}.s-{accelerograph}.ef-mvp.m2.parameters.aceleracion-sismica.'
        template = f'ef-mvp.m2.parameters.aceleracion-sismica.'

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
            for suffix in ['D1', 'D2', 'D3']
        ]

        ts.append((
                Timeseries.objects.create(
                    target=target,
                    name="A1",
                    template_name="ef-mvp.m1.triggers.important.terremoto-4-6",
                    canonical_name=f'{target.canonical_name}.none.ef-mvp.m1.triggers.important.terremoto-4-6',
                    type=Timeseries.TimeseriesType.TEST
                ),
                'A1'
        ))

        self.timeseries = ts
        self.independent = ts

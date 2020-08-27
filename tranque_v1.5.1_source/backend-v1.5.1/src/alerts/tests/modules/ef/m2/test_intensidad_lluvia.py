from targets.models import Timeseries
from alerts.tests.modules.ef.ef_controller_base import EFControllerBase


class IntensidadLluviaTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object
        self.hints = ['_.ef.m2.intensidad_lluvia']
        suffix = 'B1'

        self.base_name = f'{target.canonical_name}.none.ef-mvp.m2.parameters.lluvia.'
        self.template_name = 'ef-mvp.m2.parameters.lluvia.'

        ts = [
            (
                Timeseries.objects.create(
                    target=target,
                    name='Lluvia B1',
                    template_name=f'{self.template_name}{suffix}',
                    canonical_name=f'{self.base_name}{suffix}',
                    type=Timeseries.TimeseriesType.TEST
                ),
                suffix
            )
        ]

        self.timeseries = ts
        self.independent = ts

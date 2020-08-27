from django.test import override_settings

from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from targets.models import Timeseries


@override_settings(STACK_IS_SML=True)
class GranulometriaRellenoMuroTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object

        controller = f'.ef.m1_m2.granulometria_relleno_muro.'

        self.modules_hints = [
            f'_{controller}B1',
        ]

        self.timeseries = [
            (
                Timeseries.objects.create(
                    target=target,
                    name="B1",
                    template_name="ef-mvp.m1.design.materiales",
                    canonical_name=f'{target.canonical_name}.none.ef-mvp.m1.design.materiales',
                    type=Timeseries.TimeseriesType.TEST
                ),
                'B1'
            )
        ]

        self.independent = [self.timeseries[0]]

from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from targets.models import Timeseries
from alerts.modules.ef.m2.tonelaje.base import PROFILE_DESCRIPTIONS


class TonelajeTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object

        controller = '_.ef.m2.tonelaje.'

        self.modules_hints = [
            f'{controller}A2',
            f'{controller}AB'
        ]

        self.base_name = f'{target.canonical_name}.none.ef-mvp.m2.parameters.tonelaje.'
        self.template = 'ef-mvp.m2.parameters.tonelaje.'

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
            ) for suffix in PROFILE_DESCRIPTIONS.keys()
        ]

        # A2
        self.independent = [self.timeseries[1]]

        # A1 -> B1
        self.type_2_escalation = [
            [self.timeseries[0], self.timeseries[2]],
        ]

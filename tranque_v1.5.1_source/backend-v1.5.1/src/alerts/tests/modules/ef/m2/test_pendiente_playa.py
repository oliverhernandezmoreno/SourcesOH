from django.test import override_settings
from alerts.modules.ef.m2.pendiente_playa import PROFILE_DESCRIPTIONS
from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from targets.models import Timeseries


@override_settings(STACK_IS_SML=True)
class PendientePlayaTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object

        self.modules_hints = [
            f'g({self.sector_a.canonical_name}).ef.m2.pendiente_playa'
        ]

        self.template = 'ef-mvp.m2.parameters.pendiente-playa.sector.'
        self.base_name = f'{target.canonical_name}.g-{self.sector_a.canonical_name}.{self.template}'

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

        self.type_2_escalation = [self.timeseries]

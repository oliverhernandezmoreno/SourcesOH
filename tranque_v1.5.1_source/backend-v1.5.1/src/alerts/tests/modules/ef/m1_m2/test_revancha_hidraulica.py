from django.test import override_settings
from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from alerts.modules.ef.m1_m2.revancha_hidraulica import PROFILE_DESCRIPTIONS
from targets.models import Timeseries


@override_settings(STACK_IS_SML=True)
class RevanchaHidraulicaTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object

        self.module_hints = [
            '_.ef.m1_m2.revancha_hidraulica'
        ]

        self.base_name = f'{target.canonical_name}.none.ef-mvp.m2.parameters.revancha-hidraulica.'
        self.template_name = 'ef-mvp.m2.parameters.revancha-hidraulica.'

        self.timeseries = [
            (
                Timeseries.objects.create(
                    target=target,
                    name=suffix,
                    template_name=f'{self.template_name}{suffix}',
                    canonical_name=f'{self.base_name}{suffix}',
                    type=Timeseries.TimeseriesType.TEST
                ),
                suffix
            ) for suffix in PROFILE_DESCRIPTIONS.keys()
        ]

        self.independent = [self.timeseries[0]]

        self.type_2_escalation = [
            # B1 -> B2
            [self.timeseries[0], self.timeseries[1]],
            # B2 -> B3
            [self.timeseries[1], self.timeseries[2]]
        ]

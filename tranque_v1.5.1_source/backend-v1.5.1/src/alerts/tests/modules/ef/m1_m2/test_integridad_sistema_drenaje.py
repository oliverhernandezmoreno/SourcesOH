from django.test import override_settings
from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from targets.models import Timeseries


@override_settings(STACK_IS_SML=True)
class IntegridadSistemaDrenajeTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object

        controller = f'.ef.m1_m2.integridad_sistema_drenaje.'
        flowmeter_id = self.flowmeters[0].hardware_id
        piezometer_id = self.piezometers[0].hardware_id

        self.modules_hints = [
            f'_{controller}B1',
            f's({flowmeter_id}){controller}B2',
            f's({piezometer_id}){controller}B3C1',
        ]

        self.base_name_1 = '.ef-mvp.m2.parameters.integridad-sistema-drenaje.'
        self.base_name_2 = '.ef-mvp.m2.parameters.presion-poros.integridad-sistema-drenaje.'

        self.timeseries = [
            (
                Timeseries.objects.create(
                    target=target,
                    name='B1',
                    template_name='ef-mvp.m1.triggers.drenaje',
                    canonical_name=f'{target.canonical_name}.none.ef-mvp.m1.triggers.drenaje',
                    type=Timeseries.TimeseriesType.TEST
                ),
                'B1'
            ),
            (
                Timeseries.objects.create(
                    target=target,
                    name="B2",
                    canonical_name=f'{target.canonical_name}.s-{flowmeter_id}{self.base_name_1}B2',
                    data_source=self.flowmeters[0],
                    type=Timeseries.TimeseriesType.TEST
                ),
                "B2"
            )]

        self.timeseries.extend([
            (
                Timeseries.objects.create(
                    target=target,
                    name=suffix,
                    canonical_name=f'{target.canonical_name}.s-{piezometer_id}{self.base_name_2}{suffix}',
                    data_source=self.piezometers[0],
                    type=Timeseries.TimeseriesType.TEST
                ),
                suffix
            ) for suffix in ["B3", "C1-1", "C1-2"]
        ])

        self.independent = [self.timeseries[0], self.timeseries[1]]
        self.type_2_escalation = [
            # B3 -> C1-1
            [self.timeseries[2], self.timeseries[3]],
            # B3 -> C1-2
            [self.timeseries[2], self.timeseries[4]],
        ]

from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from targets.models import Timeseries


class NivelFreaticoCubetaDepositoTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object

        self.modules_hints = [
            (f's({piezometer.hardware_id}).ef.m2.nivel-freatico-cubeta-deposito')
            for piezometer in self.piezometers
        ]

        controller = 'ef-mvp.m2.parameters.nivel-freatico-cubeta-deposito'

        self.timeseries = [(Timeseries.objects.create(
            target=target,
            name=suffix,
            canonical_name=f'{target.canonical_name}.s-{piezometer.hardware_id}.{controller}.{suffix}',
            data_source=piezometer,
            type=Timeseries.TimeseriesType.TEST
        ), suffix) for piezometer in self.piezometers for suffix in ['A1', 'B1']]
        # timeseries 0 is event A of piezometer 1 group 1
        # timeseries 1 is event B of piezometer 1 group 1
        # timeseries 2 is event A of piezometer 2 group 1
        # timeseries 3 is event B of piezometer 2 group 1
        # timeseries 4 is event A of piezometer 3 group 2
        # timeseries 5 is event B of piezometer 3 group 2

        self.type_2_escalation = [
            [self.timeseries[0], self.timeseries[1]],  # piezometer1 A1 -> B1
            [self.timeseries[2], self.timeseries[3]],  # piezometer2 A1 -> B1
            [self.timeseries[4], self.timeseries[5]]   # piezometer3 A1 -> B1
        ]

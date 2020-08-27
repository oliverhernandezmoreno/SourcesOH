from targets.models import Timeseries
from alerts.tests.modules.ef.ef_controller_base import EFControllerBase


class CumplimientoDrenajeTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object
        controller = f'.ef.m2.cumplimiento_sistema_drenaje.'

        self.modules_hints = [
            f'_{controller}A1',
            f'_{controller}A2',
            f'_{controller}B1',
        ]

        base_name = f'{target.canonical_name}.none.ef-mvp.m2.parameters.discrete.cumplimiento-diseno-dren.'
        template = "ef-mvp.m2.parameters.discrete.cumplimiento-diseno-dren."

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

                ) for suffix in ["A1", "A2", "B1"]
        ]

        self.timeseries = ts
        self.independent = ts

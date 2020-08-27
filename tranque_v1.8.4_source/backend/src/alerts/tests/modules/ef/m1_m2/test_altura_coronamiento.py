from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from targets.models import Timeseries


class AlturaCoronamientoTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object
        controller = f'.ef.m1_m2.altura_coronamiento.'
        sector = self.sector_a.canonical_name

        self.modules_hints = [
            f'g({sector}){controller}A1',
            f'g({sector}){controller}A2',
            f'_{controller}A3',
        ]

        base_name = f'{target.canonical_name}.g-{sector}.ef-mvp.m2.parameters.altura-muro.sector.'
        template = 'ef-mvp.m2.parameters.altura-muro.sector.'

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
            for suffix in ['A1', 'A2']
        ]

        ts.append((
            Timeseries.objects.create(
                target=target,
                name="A3",
                template_name="ef-mvp.m1.design.altura",
                canonical_name=f'{target.canonical_name}.none.ef-mvp.m1.design.altura',
                type=Timeseries.TimeseriesType.TEST
            ),
            'A3'
        ))

        self.timeseries = ts
        self.independent = ts

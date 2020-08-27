from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from targets.models import Timeseries


class ProblemasInstrumentacionTestCase(EFControllerBase.TestCase):
    def setUp(self):
        super().setUp()
        target = self.target_object
        controller = '.ef.m2.escenarios_falla.eventos_problemas_instrumentacion.'
        piezometer_id = self.piezometers[0]
        accelerograph_id = self.accelerographs[0]
        flowmeter_id = self.flowmeters[0]
        turbidimeter_id = self.turbidimeters[0]

        self.base_name = '.ef-mvp.m2.failure_scenarios.fi-01.'
        self.suffixes = ["A1", "A2", "A3"]

        input_independent_ts = [[piezometer_id, self.suffixes],
                                [accelerograph_id, self.suffixes],
                                [flowmeter_id, self.suffixes],
                                [turbidimeter_id, self.suffixes]]

        self.modules_hints = [(
            f's({instrument.hardware_id}){controller}{suffix}')
            for instrument, suffixes in input_independent_ts for suffix in suffixes]

        ts = []

        for instrument, suffixes in input_independent_ts:
            for suffix in suffixes:

                self.canonical_name = f'{target.canonical_name}.s-{instrument.hardware_id}{self.base_name}{suffix}'

                ts.append((
                        Timeseries.objects.create(
                            target=target,
                            name=suffix,
                            canonical_name=self.canonical_name,
                            data_source=instrument,
                            type=Timeseries.TimeseriesType.TEST
                        ),
                        suffix
                    )
                )

        self.timeseries = ts
        self.independent = ts

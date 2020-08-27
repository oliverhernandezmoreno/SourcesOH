from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from targets.models import Timeseries


class DesplazamientoDeformacionTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object
        controller = f'.ef.m2.desplazamiento_deformacion_muro.'
        monolith = self.monoliths[0].hardware_id
        inclinometer = self.inclinometers[0].hardware_id

        self.modules_hints = [
            f's({monolith}){controller}B1B4',
            f's({monolith}){controller}B2B5',
            f's({monolith}){controller}B3B6',
            f's({inclinometer}){controller}B7B10',
            f's({inclinometer}){controller}B8B11',
            f's({inclinometer}){controller}B9B12',
            f's({monolith}){controller}C1',
            f's({monolith}){controller}C2',
            f's({monolith}){controller}C3',
            f's({inclinometer}){controller}C4',
            f's({inclinometer}){controller}C5',
            f's({inclinometer}){controller}C6',
        ]

        self.template_name = 'ef-mvp.m2.parameters.deformacion.'
        self.monolith_x = f'{self.template_name}monolito.muro.eje-x.'
        self.monolith_y = f'{self.template_name}monolito.muro.eje-y.'
        self.monolith_z = f'{self.template_name}monolito.muro.eje-z.'
        self.inclinometer_x = f'{self.template_name}inclinometro.muro.eje-x.'
        self.inclinometer_y = f'{self.template_name}inclinometro.muro.eje-y.'
        self.inclinometer_z = f'{self.template_name}inclinometro.muro.eje-z.'

        self.basename_monolith = f'{target.canonical_name}.s-{monolith}.'
        self.basename_inclinometer = f'{target.canonical_name}.s-{inclinometer}.'

        input_independent_ts = [[self.basename_monolith, [self.monolith_x, "C1"]],
                                [self.basename_monolith, [self.monolith_y, "C2"]],
                                [self.basename_monolith, [self.monolith_z, "C3"]],
                                [self.basename_inclinometer, [self.inclinometer_x, "C4"]],
                                [self.basename_inclinometer, [self.inclinometer_y, "C5"]],
                                [self.basename_inclinometer, [self.inclinometer_z, "C6"]]]

        input_escalation_ts = [[self.basename_monolith, self.monolith_x,
                                ["B1", "B4"]],
                               [self.basename_monolith, self.monolith_y,
                                ["B2", "B5"]],
                               [self.basename_monolith, self.monolith_z,
                                ["B3", "B6"]],
                               [self.basename_inclinometer, self.inclinometer_x,
                                ["B7", "B10"]],
                               [self.basename_inclinometer, self.inclinometer_y,
                                ["B8", "B11"]],
                               [self.basename_inclinometer, self.inclinometer_z,
                                ["B9", "B12"]]]

        self.timeseries = [
            (
                Timeseries.objects.create(
                    target=target,
                    name=suffix[1],
                    template_name=f'{suffix[0][:-1]}',
                    canonical_name=f'{basename}{suffix[0][:-1]}',
                    type=Timeseries.TimeseriesType.TEST
                ),
                suffix[1]
            ) for basename, suffix in input_independent_ts
            ]

        self.timeseries.extend([
            (
                Timeseries.objects.create(
                    target=target,
                    name=suffix,
                    template_name=f'{template}{suffix}',
                    canonical_name=f'{basename}{template}{suffix}',
                    type=Timeseries.TimeseriesType.TEST

                ),
                suffix
            ) for basename, template, suffixes in input_escalation_ts for suffix in suffixes
        ])

        # C1, C2, C3, C4, C5, C6
        self.independent = [self.timeseries[0],
                            self.timeseries[1],
                            self.timeseries[2],
                            self.timeseries[3],
                            self.timeseries[4],
                            self.timeseries[5],
                            ]

        self.type_2_escalation = [
            # B1 -> B4
            [self.timeseries[6], self.timeseries[7]],
            # B2 -> B5
            [self.timeseries[8], self.timeseries[9]],
            # B3 -> B6
            [self.timeseries[10], self.timeseries[11]],
            # B7 -> B10
            [self.timeseries[12], self.timeseries[13]],
            # B8 -> B11
            [self.timeseries[14], self.timeseries[15]],
            # B9 -> B12
            [self.timeseries[16], self.timeseries[17]],
        ]

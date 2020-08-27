from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from targets.models import Timeseries


class DeformacionCoronamientoTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object
        controller = f'.ef.m2.deformacion_coronamiento_muro.'
        monolith = self.monoliths[0].hardware_id

        self.modules_hints = [
            f's({monolith}){controller}B1B4',
            f's({monolith}){controller}B2B5',
            f's({monolith}){controller}B3B6',
            f's({monolith}){controller}C1',
            f's({monolith}){controller}C2',
            f's({monolith}){controller}C3',
        ]

        self.template_name_x = 'ef-mvp.m2.parameters.deformacion.monolito.coronamiento.eje-x.'
        self.template_name_y = 'ef-mvp.m2.parameters.deformacion.monolito.coronamiento.eje-y.'
        self.template_name_z = 'ef-mvp.m2.parameters.deformacion.monolito.coronamiento.eje-z.'

        input_independent_timeseries = [[self.template_name_x, "C1"],
                                        [self.template_name_y, "C2"],
                                        [self.template_name_z, "C3"]]

        input_escalation_timeseries = [[self.template_name_x, ["B1", "B4"]],
                                       [self.template_name_y, ["B2", "B5"]],
                                       [self.template_name_z, ["B3", "B6"]]]

        self.base_name = f'{target.canonical_name}.s-{monolith}.'

        self.timeseries = [
            (
                Timeseries.objects.create(
                    target=target,
                    name=suffix,
                    template_name=template[:-1],
                    canonical_name=f'{self.base_name}{template}',
                    type=Timeseries.TimeseriesType.TEST
                ),
                suffix
            ) for template, suffix in input_independent_timeseries
        ]

        self.timeseries.extend([
            (
                Timeseries.objects.create(
                    target=target,
                    name=suffix,
                    template_name=f'{template}{suffix}',
                    canonical_name=f'{self.base_name}{template}{suffix}',
                    type=Timeseries.TimeseriesType.TEST

                ),
                suffix
            ) for template, suffixes in input_escalation_timeseries for suffix in suffixes
        ])

        # self.timeseries = C1, C2, C3
        self.independent = [self.timeseries[0],
                            self.timeseries[1],
                            self.timeseries[2]
                            ]

        self.type_2_escalation = [
            # B1 -> B4
            [self.timeseries[3], self.timeseries[4]],
            # B2 -> B5
            [self.timeseries[5], self.timeseries[6]],
            # # B3 -> B6
            [self.timeseries[7], self.timeseries[8]],
        ]

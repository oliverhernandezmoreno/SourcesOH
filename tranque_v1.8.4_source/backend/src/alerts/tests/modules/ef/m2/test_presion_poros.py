from django.test import override_settings
from alerts.modules.ef.m2.presion_poros.base import PROFILE_DESCRIPTIONS
from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from targets.models import Timeseries
from alerts import engine
from django.test import tag


@tag('slow')
@override_settings(STACK_IS_SML=True)
class PresionPorosTestCase(EFControllerBase.TestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object

        controller = '.ef.m2.presion_poros.'

        piezometer_id = self.piezometers[0].hardware_id

        self.modules_hints = [
            f's({piezometer_id}){controller}B1',
            f's({piezometer_id}){controller}B2',
            f's({piezometer_id}){controller}B3',
            f's({piezometer_id}){controller}BCD',
        ]

        self.base_name = '.ef-mvp.m2.parameters.presion-poros.'
        self.timeseries = [
            (
                Timeseries.objects.create(
                    target=target,
                    name=suffix,
                    canonical_name=f'{target.canonical_name}.s-{piezometer_id}{self.base_name}{suffix}',
                    data_source=self.piezometers[0],
                    type=Timeseries.TimeseriesType.TEST
                ),
                suffix
            ) for suffix in PROFILE_DESCRIPTIONS.keys()
        ]

        self.independent = [self.timeseries[0], self.timeseries[1], self.timeseries[2]]

        self.B4_timeseries = [t for t in self.timeseries if '.B4' in t[0].canonical_name]
        self.B5_timeseries = [t for t in self.timeseries if '.B5' in t[0].canonical_name]
        self.B6_timeseries = [t for t in self.timeseries if '.B6' in t[0].canonical_name]
        self.C1_timeseries = [t for t in self.timeseries if '.C1' in t[0].canonical_name]
        self.C2_timeseries = [t for t in self.timeseries if '.C2' in t[0].canonical_name]
        self.D1_timeseries = [t for t in self.timeseries if '.D1' in t[0].canonical_name]
        self.D2_timeseries = [t for t in self.timeseries if '.D2' in t[0].canonical_name]

        self.type_2_escalation = [
            # B4 -> B5
            ([B4_ts, B5_ts]) for B5_ts in self.B5_timeseries for B4_ts in self.B4_timeseries
        ]

        self.type_2_escalation.extend([
            # B4 -> B6
            ([B4_ts, B6_ts]) for B6_ts in self.B6_timeseries for B4_ts in self.B4_timeseries
        ]),

        self.type_2_escalation.extend([
            # B4 -> C1
            ([B4_ts, C1_ts]) for C1_ts in self.C1_timeseries for B4_ts in self.B4_timeseries
        ]),

        self.type_2_escalation.extend([
            # B4 -> C2
            ([B4_ts, C2_ts]) for C2_ts in self.C2_timeseries for B4_ts in self.B4_timeseries
        ]),

        self.type_2_escalation.extend([
            # B4 -> D2
            ([B4_ts, D2_ts]) for D2_ts in self.D2_timeseries for B4_ts in self.B4_timeseries
        ])

        self.type_2_escalation.extend([
            # B5 -> B6
            ([B5_ts, B6_ts]) for B6_ts in self.B6_timeseries for B5_ts in self.B5_timeseries
        ])

        self.type_2_escalation.extend([
            # B5 -> C1
            ([B5_ts, C1_ts]) for C1_ts in self.C1_timeseries for B5_ts in self.B5_timeseries
        ])

        self.type_2_escalation.extend([
            # B5 -> C2
            ([B5_ts, C2_ts]) for C2_ts in self.C2_timeseries for B5_ts in self.B5_timeseries
        ])

        self.type_2_escalation.extend([
            # B5 -> D2
            ([B5_ts, D2_ts]) for D2_ts in self.D2_timeseries for B5_ts in self.B5_timeseries
        ])

        self.type_2_escalation.extend([
            # B6 -> C2
            ([B6_ts, C2_ts]) for C2_ts in self.C2_timeseries for B6_ts in self.B6_timeseries
        ])

        self.type_2_escalation.extend([
            # B6 -> D2
            ([B6_ts, D2_ts]) for D2_ts in self.D2_timeseries for B6_ts in self.B6_timeseries
        ])

        self.type_2_escalation.extend([
            # C1 -> C2
            ([C1_ts, C2_ts]) for C2_ts in self.C2_timeseries for C1_ts in self.C1_timeseries
        ])

        self.type_2_escalation.extend([
            # C1 -> D1
            ([C1_ts, D1_ts]) for D1_ts in self.D1_timeseries for C1_ts in self.C1_timeseries
        ])

        self.type_2_escalation.extend([
            # C1 -> D2
            ([C1_ts, D2_ts]) for D2_ts in self.D2_timeseries for C1_ts in self.C1_timeseries
        ])

        self.type_2_escalation.extend([
            # C2 -> D2
            ([C2_ts, D2_ts]) for D2_ts in self.D2_timeseries for C2_ts in self.C2_timeseries
        ])

        self.type_2_escalation.extend([
            # D1 -> D2
            ([D1_ts, D2_ts]) for D2_ts in self.D2_timeseries for D1_ts in self.D1_timeseries
        ])

    def tickets_after_multiple_events(self, timeseries):
        events = []
        # From all events, ticket result with the worst state
        for ts in timeseries:
            events.append(self.create_event(ts[0], 1))
        tickets, _ = engine.dry_run(self.target_object, self.modules_hints)
        return [tickets, events]

    def test_creation_with_multiple_events_with_same_super_state(self):
        tickets, events = self.tickets_after_multiple_events(self.B4_timeseries)
        self.assertEqual(len(tickets), 1)
        self.assertEqual(tickets[0]['state'], 'B4-2')
        self.delete_events(events)

        affected = engine.run(self.target_object, self.modules_hints)
        self.assertEqual(len(affected), 0)

        tickets, events = self.tickets_after_multiple_events(self.B5_timeseries)
        self.assertEqual(len(tickets), 1)
        self.assertEqual(tickets[0]['state'], 'B5-4')
        self.delete_events(events)

        affected = engine.run(self.target_object, self.modules_hints)
        self.assertEqual(len(affected), 0)

        tickets, events = self.tickets_after_multiple_events(self.B6_timeseries)
        self.assertEqual(len(tickets), 1)
        self.assertEqual(tickets[0]['state'], 'B6-3')
        self.delete_events(events)

        affected = engine.run(self.target_object, self.modules_hints)
        self.assertEqual(len(affected), 0)

        tickets, events = self.tickets_after_multiple_events(self.C1_timeseries)
        self.assertEqual(len(tickets), 1)
        self.assertEqual(tickets[0]['state'], 'C1-6')
        self.delete_events(events)

        affected = engine.run(self.target_object, self.modules_hints)
        self.assertEqual(len(affected), 0)

        tickets, events = self.tickets_after_multiple_events(self.C2_timeseries)
        self.assertEqual(len(tickets), 1)
        self.assertEqual(tickets[0]['state'], 'C2-2')
        self.delete_events(events)

        affected = engine.run(self.target_object, self.modules_hints)
        self.assertEqual(len(affected), 0)

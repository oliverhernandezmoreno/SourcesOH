import secrets

from django.db import transaction
from django.test import override_settings

from alerts import engine
from alerts.models import Ticket, TicketLog
from alerts.modules.rules import Rule
from alerts.tests.controller_base import ControllerBaseTestCase
from api.tests.base import RollbackException
from targets import elastic
from targets.models import DataSourceGroup, DataSource, Target


class EFControllerBase:
    class TestCase(ControllerBaseTestCase):
        # list of tuples (timeseries, state)
        # first value of tuple is an event timeseries
        # and the second value is the state of the ticket when that event is 1
        timeseries = list()
        # the related test will create individually an event from each of this timeseries
        # and check that a ticket with state "state" is created

        # list of tuples (timeseries, state) that are independent and can exists simultaneously
        independent = list()
        # the related test will create events from all this timeseries
        # and check that a new ticket with state "state" is created for each one

        # list of (list of (timeseries, state), (timeseries, state)) that do a type_1_escalation
        type_1_escalation = list()
        # the related test will for each tuple (list, element) , will create all tickets from the list
        # and then test creation of element with list as children
        # [
        # ([(ts_1, state_1), (ts_2, state_2)], (ts_3, state_3)), <-- test 1
        # ([...], (...)), <-- test 2
        # ..., <-- test n
        # ]
        # test 1:
        # event ts_1 creates ticket_1 state_1
        # event ts_2 creates ticket_2 state_2
        # event ts_3 creates ticket_3 state_3 with children ticket_1, ticket_2

        # list of (list of (timeseries, state)) that do a type_2_escalation
        type_2_escalation = list()
        # the related test will for each list create events in order
        # and test that a single ticket is created and mutated with each element
        # [
        # [(ts_1, state_1), (ts_2, state_2), (ts_3, state_3)], <-- test 1
        # [...], <-- test 2
        # ..., <-- test n
        # ]
        # test 1:
        # event ts_1 creates ticket_1 state_1
        # event ts_2 escalates ticket_1 to state_2
        # event ts_3 escalates ticket_1 to state_3

        modules_hints = None
        # log of created elastic event ids to delete in tearDown()
        _created_events = []

        # groups
        sector_a = None
        sector_b = None
        sectors = None
        cross_section_group = None

        # data sources
        cross_section = None

        @classmethod
        def setUpTestData(cls):
            target = Target.objects.get(canonical_name=cls.target)
            # sector a
            cls.sector_a = DataSourceGroup.objects.create(
                target=target,
                name='sector-A',
                canonical_name='sector-A',
            )
            # sector b
            cls.sector_b = DataSourceGroup.objects.create(
                target=target,
                name='sector-B',
                canonical_name='sector-B',
            )
            # sectors group
            cls.sectors = DataSourceGroup.objects.create(
                target=target,
                name='sectores',
                canonical_name='sectores',
            )
            cls.sectors.children.add(cls.sector_a, cls.sector_b)
            # cross section group
            cls.cross_section_group = DataSourceGroup.objects.create(
                target=target,
                name='perfil-transversal',
                canonical_name='perfil-transversal',
            )
            # cross section in sector a
            cls.cross_section = DataSource.objects.create(
                target=target,
                hardware_id=f'test-cross_section-{secrets.token_urlsafe(8)}',
                name='test cross_section',
                canonical_name='ignored',
                type=DataSource.DataSourceType.ONLINE,
            )
            cls.cross_section.groups.add(
                cls.cross_section_group,
                cls.sector_a
            )

            # piezometers group
            cls.piezometer_group = DataSourceGroup.objects.create(
                target=target,
                name='piezometros',
                canonical_name='piezometros',
            )
            # piezometers
            cls.piezometers = [
                DataSource.objects.create(
                    target=target,
                    hardware_id=f'test-piezometer-{i}-{secrets.token_urlsafe(8)}',
                    name=f'test piezometer {i}',
                    canonical_name=f'whatever-{i}-{secrets.token_urlsafe(4)}',
                    type=DataSource.DataSourceType.ONLINE,
                ) for i in range(3)]
            cls.piezometer_group.data_sources.set(cls.piezometers)
            cls.sector_a.data_sources.add(cls.piezometers[0], cls.piezometers[1])
            cls.sector_b.data_sources.add(cls.piezometers[2])

            # drain 1
            cls.drain_1 = DataSourceGroup.objects.create(
                target=target,
                name='drenaje-1',
                canonical_name='drenaje-1',
            )
            # drain 2
            cls.drain_2 = DataSourceGroup.objects.create(
                target=target,
                name='drenaje-2',
                canonical_name='drenaje-2',
            )
            # drains meta-group
            cls.drains = DataSourceGroup.objects.create(
                target=target,
                name='drenes',
                canonical_name='drenes',
            )
            cls.sectors.children.add(cls.drain_1, cls.drain_2)

            # turbidimeters group
            cls.turbidimeter_group = DataSourceGroup.objects.create(
                target=target,
                name='turbidimetros',
                canonical_name='turbidimetros',
            )
            # turbidimeters
            cls.turbidimeters = [
                DataSource.objects.create(
                    target=target,
                    hardware_id=f'test-turbidimeter-{i}-{secrets.token_urlsafe(8)}',
                    name=f'test turbidimeter {i}',
                    canonical_name=f'whatever-{i}-{secrets.token_urlsafe(4)}',
                    type=DataSource.DataSourceType.ONLINE,
                ) for i in range(3)]
            cls.turbidimeter_group.data_sources.set(cls.turbidimeters)
            cls.drain_1.data_sources.add(cls.turbidimeters[0], cls.turbidimeters[1])
            cls.drain_2.data_sources.add(cls.turbidimeters[2])

            # flowmeter group
            cls.flowmeter_group = DataSourceGroup.objects.create(
                target=target,
                name='caudalimetros',
                canonical_name='caudalimetros',
            )
            # flowmeter
            cls.flowmeters = [
                DataSource.objects.create(
                    target=target,
                    hardware_id=f'test-flowmeter-{i}-{secrets.token_urlsafe(8)}',
                    name=f'test flowmeter {i}',
                    canonical_name=f'whatever-{i}-{secrets.token_urlsafe(4)}',
                    type=DataSource.DataSourceType.ONLINE,
                ) for i in range(3)]
            cls.flowmeter_group.data_sources.set(cls.flowmeters)

            # accelerographs group
            cls.accelerograph_group = DataSourceGroup.objects.create(
                target=target,
                name='acelerografos',
                canonical_name='acelerografos',
            )
            # accelerographs
            cls.accelerographs = [
                DataSource.objects.create(
                    target=target,
                    hardware_id=f'test-accelerograph-{i}-{secrets.token_urlsafe(8)}',
                    name=f'test accelerograph {i}',
                    canonical_name=f'whatever-{i}-{secrets.token_urlsafe(4)}',
                    type=DataSource.DataSourceType.ONLINE,
                ) for i in range(3)]
            cls.accelerograph_group.data_sources.set(cls.accelerographs)
            cls.sector_a.data_sources.add(cls.accelerographs[0], cls.accelerographs[1])
            cls.sector_b.data_sources.add(cls.accelerographs[2])

        def create_event(self, timeseries, value, timestamp=None):
            _id = f'test-event-{secrets.token_urlsafe(16)}'
            event = timeseries.as_event(value, _id=_id, timestamp=timestamp)
            elastic.index(event, refresh='true')
            self._created_events.append(_id)
            return _id

        def tearDown(self):
            super().tearDown()
            self.delete_events(self._created_events)

        @override_settings(STACK_IS_SML=True)
        def test_timeseries_creation_by_events(self):
            target = self.target_object
            for ts, state in self.timeseries:
                with self.subTest(f'ticket created with event {state} when value is 1'):
                    try:
                        with transaction.atomic():
                            event_id = self.create_event(ts, 1)
                            tickets = engine.run(target, self.modules_hints)
                            self.assertEqual(len(tickets), 1)
                            self.assertEqual(tickets[0].state, state)

                            # check there is a log for the creation
                            logs = TicketLog.objects.filter(ticket=tickets[0])
                            self.assertEqual(logs.first().meta['description'], Rule.ActionDescription.CREATE)
                            self.assertEqual(logs.first().meta['next_state'], state)

                            self.delete_events(event_id)
                            raise RollbackException()
                    except RollbackException:
                        pass

                with self.subTest(f'ticket not created with event {state} when value is 0'):
                    event_id = self.create_event(ts, 0)
                    tickets, _ = engine.dry_run(target, self.modules_hints)
                    self.assertFalse(tickets)
                    self.delete_events(event_id)

        @override_settings(STACK_IS_SML=True)
        def test_independent_creation(self):
            target = self.target_object
            for index, (ts, state) in enumerate(self.independent):
                self.create_event(ts, 1)
                affected = engine.run(target, self.modules_hints)
                self.assertEqual(len(affected), 1)
                self.assertEqual(affected[0].state, state)
                self.assertEqual(Ticket.objects.count(), index + 1)

        @override_settings(STACK_IS_SML=True)
        def test_type_2_escalation(self):
            target = self.target_object
            for timeseries in self.type_2_escalation:
                if len(timeseries) < 2:
                    # can not escalate a single state
                    continue
                states = '->'.join(list(map(lambda ts: ts[1], timeseries)))
                with self.subTest(f'ticket escalation {states}'):
                    try:
                        with transaction.atomic():
                            # create first event
                            ids = [self.create_event(timeseries[0][0], 1)]
                            # run engine to create ticket
                            affected = engine.run(target, self.modules_hints)
                            self.assertEqual(len(affected), 1)
                            ticket = affected[0]
                            self.assertEqual(ticket.state, timeseries[0][1])
                            for ts, state in timeseries[1:]:
                                # create next event
                                ids.append(self.create_event(ts, 1))

                                # run engine to escalate type_2
                                affected = engine.run(target, self.modules_hints)

                                # assert ticket state is modified
                                self.assertEqual(len(affected), 1)
                                self.assertEqual(affected[0].id, ticket.id)
                                self.assertEqual(affected[0].state, state)

                                # check there is a log for the escalation
                                logs = TicketLog.objects.filter(ticket=affected[0])
                                self.assertEqual(logs.first().meta['description'], Rule.ActionDescription.ESCALATE)
                                self.assertEqual(logs.first().meta['next_state'], state)

                            self.delete_events(ids)
                            raise RollbackException()
                    except RollbackException:
                        pass

        def run_type_1_test(self, target, children, parent):
            # create children
            ids = [self.create_event(ts[0], 1) for ts in children]
            children_states = [ts[1] for ts in children]

            # run engine to create tickets
            children = engine.run(target, self.modules_hints)

            self.assertEqual(len(children), len(children_states))
            for child in children:
                self.assertIn(child.state, children_states)
            children_ids = [child.id for child in children]

            # create parent event
            ids.append(self.create_event(parent[0], 1))

            # run engine to escalate type_1
            affected = engine.run(target, self.modules_hints)

            # assert ticket state is modified
            self.assertEqual(len(affected), 1)
            self.assertEqual(affected[0].state, parent[1])
            self.assertEqual(
                len(children_ids),
                affected[0].children.filter(id__in=children_ids).count()
            )

            self.delete_events(ids)

        @override_settings(STACK_IS_SML=True)
        def test_type_1_escalation(self):
            target = self.target_object
            for timeseries in self.type_1_escalation:
                if len(timeseries) < 1:
                    continue
                nested = ','.join(list(map(lambda ts: ts[1], timeseries[0])))
                with self.subTest(f'ticket nested escalation {timeseries[1][1]} from children set ({nested})'):
                    try:
                        with transaction.atomic():
                            self.run_type_1_test(target, timeseries[0], timeseries[1])
                            raise RollbackException()
                    except RollbackException:
                        pass

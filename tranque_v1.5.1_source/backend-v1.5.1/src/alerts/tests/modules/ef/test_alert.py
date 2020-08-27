from django.test import override_settings

from alerts import engine
from alerts.models import Ticket, UserIntent, AuthorizationRequest, TicketComment, TicketLog
from alerts.modules.base_states import ALERT_STATES
from alerts.modules.rules import Rule
from alerts.tests.modules.ef.ef_controller_base import EFControllerBase
from targets.models import Timeseries, Target


@override_settings(STACK_IS_SML=False)
class EFAlertTestCase(EFControllerBase.TestCase):
    # not using any of the tests from EFControllerBase.TestCase
    # inheriting only to reuse setup and event creation

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        # target = self.target_object
        target = Target.objects.get(canonical_name=cls.target)
        # use presion poros controller to trigger B, C and D events
        piezometer = cls.piezometers[0]
        cls.modules_hints = [
            # _.ef.alert will be executed because it is a parent of this controller
            f's({piezometer.hardware_id}).ef.m2.presion_poros.BCD'
        ]
        base_name = f'{target.canonical_name}.s-{piezometer.hardware_id}.ef-mvp.m2.parameters.presion-poros.'
        cls.B, cls.C, cls.D = (
            Timeseries.objects.create(
                target=target,
                name=suffix,
                canonical_name=f'{base_name}{suffix}',
                data_source=piezometer,
                type=Timeseries.TimeseriesType.TEST
            ) for suffix in ['B6-2', 'C1-2', 'D1']
        )
        cls.module = '_.ef.alert'

    def test_B_do_not_create(self):
        self.create_event(self.B, 1)
        # run engine to create trigger event ticket
        affected = engine.run(self.target_object, self.modules_hints)
        # only a ticket for presion poros should be created
        self.assertEqual(len(affected), 1)
        self.assertEqual(affected[0].module, self.modules_hints[0])

        # assert there is no alert ticket
        query = Ticket.objects.filter(module=self.module)
        self.assertEqual(query.count(), 0)

    def assert_creation(self, trigger, result):
        self.create_event(trigger, 1)
        # run engine to create trigger event and alert ticket
        affected = engine.run(self.target_object, self.modules_hints)

        # two tickets should be created one for poros and one for alert
        self.assertEqual(len(affected), 2)
        self.assertSetEqual(set(t.module for t in affected), {self.modules_hints[0], self.module})

        # assert there is only one alert ticket
        query = Ticket.objects.filter(module=self.module)
        self.assertEqual(query.count(), 1)
        ticket = query.first()

        # check there is a log message related to the ticket creation
        logs = TicketLog.objects.filter(ticket=ticket)
        self.assertEqual(len(logs), 1)
        self.assertEqual(logs.first().meta['description'], Rule.ActionDescription.CREATE)

        self.assertEqual(ticket.state, result)

    def test_yellow_creation(self):
        self.assert_creation(self.C, ALERT_STATES.YELLOW)

    def test_red_creation(self):
        self.assert_creation(self.D, ALERT_STATES.RED)

    def test_automatic_escalation(self):
        # assert_creation will create a yellow ticket
        self.assert_creation(self.C, ALERT_STATES.YELLOW)

        # get yellow ticket
        query = Ticket.objects.filter(module=self.module)
        ticket = query.first()
        self.assertIsNotNone(ticket)

        # create second event to trigger event escalation
        self.create_event(self.D, 1)
        affected = engine.run(self.target_object, self.modules_hints)

        # two tickets should be updated one for poros and one for the alert
        self.assertEqual(len(affected), 2)
        self.assertSetEqual(set(t.module for t in affected), {self.modules_hints[0], self.module})

        # assert there is no new alert tickets
        self.assertEqual(query.count(), 1)

        # refresh yellow ticket and assert it escalated to red
        ticket.refresh_from_db()
        self.assertEqual(ticket.state, ALERT_STATES.RED)

        # check there is a new log message related to the escalation
        logs = TicketLog.objects.filter(ticket=ticket)
        self.assertEqual(len(logs), 2)  # 2 logs = 1 creation log + 1 escalation log
        self.assertEqual(logs.first().meta['description'], Rule.ActionDescription.ESCALATE)

    def manual_action_setup(self, timeseries, get_conditions, to_state):
        self.create_event(timeseries, 1)
        # run engine to create trigger event and alert ticket
        engine.run(self.target_object, self.modules_hints)
        ticket = Ticket.objects.filter(module=self.module).first()
        ticket_event = Ticket.objects.exclude(module=self.module).first()
        initial_intent = UserIntent.objects.create(
            module=self.module,
            user=self.authority_user_object,
            target=self.target_object,
            content={"state": to_state},
        )
        engine.run(self.target_object, self.modules_hints)
        initial_intent.refresh_from_db()
        conditions = get_conditions(ticket)
        self.assertTrue(len(conditions) > 0)
        self.assertTrue(all(not x['complete'] for x in conditions))
        self.assertTrue(initial_intent.issue)

        # check there is a log message related to the ticket creation
        logs = TicketLog.objects.filter(ticket=ticket)
        self.assertEqual(len(logs), 1)
        self.assertEqual(logs.first().meta['description'], Rule.ActionDescription.CREATE)
        self.assertEqual(logs.first().meta['next_state'], ticket.state)

        return ticket, ticket_event

    def assertStateChange(self, ticket, authorization, to_state):
        intent = UserIntent.objects.create(
            module=self.module,
            user=self.authority_user_object,
            target=self.target_object,
            content={"state": to_state},
        )

        engine.run(self.target_object, self.modules_hints)
        intent.refresh_from_db()
        ticket.refresh_from_db()
        authorization.refresh_from_db()

        self.assertEqual(ticket.state, to_state)
        self.assertIsNotNone(intent.attended_at)
        self.assertEqual(intent.issue, '')
        self.assertEqual(authorization.status, AuthorizationRequest.Status.APPROVED_AND_USED)

    def test_manual_escalation(self):
        # create C event to trigger yellow ticket
        ticket, _ = self.manual_action_setup(
            self.C, lambda _ticket: _ticket.escalate_conditions[ALERT_STATES.RED], ALERT_STATES.RED
        )

        # Complete conditions
        # Add management comment
        TicketComment.objects.create(ticket=ticket, comment_type=TicketComment.CommentType.ALERT_MANAGEMENT)

        # Add authorization
        authorization = AuthorizationRequest.objects.create(
            ticket=ticket,
            authorization=f'ticket.YELLOW.escalate.RED.authorization.authority-3',
            status=AuthorizationRequest.Status.APPROVED
        )

        self.assertStateChange(ticket, authorization, ALERT_STATES.RED)

        # check there is a new log message related to the escalation
        logs = TicketLog.objects.filter(ticket=ticket)
        self.assertEqual(len(logs), 2)  # 2 logs = 1 creation log + 1 escalation log
        self.assertEqual(logs.first().meta['description'], Rule.ActionDescription.ESCALATE)
        self.assertEqual(logs.first().meta['next_state'], ALERT_STATES.RED)

    def test_close_yellow(self):
        # create C event to trigger red ticket
        ticket, ticket_event = self.manual_action_setup(
            self.C, lambda _ticket: _ticket.close_conditions, Ticket.TicketState.CLOSED
        )

        # Complete conditions
        # Add management comment
        TicketComment.objects.create(ticket=ticket, comment_type=TicketComment.CommentType.ALERT_MANAGEMENT)

        # Add authorization
        authorization = AuthorizationRequest.objects.create(
            ticket=ticket,
            authorization=f'ticket.YELLOW.close.authorization.authority-3',
            status=AuthorizationRequest.Status.APPROVED
        )

        # no C or D children
        ticket_event.state = 'B4-1'
        ticket_event.save()

        self.assertStateChange(ticket, authorization, Ticket.TicketState.CLOSED)

        # check there is a new log message related to the closed ticket
        logs = TicketLog.objects.filter(ticket=ticket)
        self.assertEqual(len(logs), 2)  # 2 logs = 1 creation log + 1 escalation log
        self.assertEqual(logs.first().meta['description'], Rule.ActionDescription.CLOSE)
        self.assertEqual(logs.first().meta['next_state'], Ticket.TicketState.CLOSED)

    def complete_red_conditions(self, ticket, authorization):
        # Add management comment
        TicketComment.objects.create(ticket=ticket, comment_type=TicketComment.CommentType.ALERT_MANAGEMENT)
        # Add close comment
        close_comment = TicketComment.objects.create(ticket=ticket, comment_type=TicketComment.CommentType.CLOSE_REPORT)
        close_comment.documents.add(self.random_document())

        # Add authorization
        authorization = AuthorizationRequest.objects.create(
            ticket=ticket,
            authorization=authorization,
            status=AuthorizationRequest.Status.APPROVED
        )
        return authorization

    def test_manual_deescalation(self):
        # create D event to trigger red ticket
        ticket, ticket_event = self.manual_action_setup(
            self.D, lambda _ticket: _ticket.escalate_conditions[ALERT_STATES.YELLOW], ALERT_STATES.YELLOW
        )

        authorization = self.complete_red_conditions(
            ticket, f'ticket.{ALERT_STATES.RED}.escalate.{ALERT_STATES.YELLOW}.authorization.authority-3'
        )

        # no D children
        ticket_event.state = 'C1-1'
        ticket_event.save()

        self.assertStateChange(ticket, authorization, ALERT_STATES.YELLOW)

        # check there is a new log message related to the deescalation
        logs = TicketLog.objects.filter(ticket=ticket)
        self.assertEqual(len(logs), 2)  # 2 logs = 1 creation log + 1 escalation log
        self.assertEqual(logs.first().meta['description'], Rule.ActionDescription.ESCALATE)
        self.assertEqual(logs.first().meta['next_state'], ALERT_STATES.YELLOW)

    def test_close_red(self):
        # create D event to trigger red ticket
        ticket, ticket_event = self.manual_action_setup(
            self.D, lambda _ticket: _ticket.close_conditions, Ticket.TicketState.CLOSED
        )

        authorization = self.complete_red_conditions(
            ticket, f'ticket.{ALERT_STATES.RED}.close.authorization.authority-3'
        )

        # no C or D children
        ticket_event.state = 'B4-1'
        ticket_event.save()

        self.assertStateChange(ticket, authorization, Ticket.TicketState.CLOSED)

        # check there is a new log message related to the closed ticket
        logs = TicketLog.objects.filter(ticket=ticket)
        self.assertEqual(len(logs), 2)  # 2 logs = 1 creation log + 1 escalation log
        self.assertEqual(logs.first().meta['description'], Rule.ActionDescription.CLOSE)
        self.assertEqual(logs.first().meta['next_state'], Ticket.TicketState.CLOSED)

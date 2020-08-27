import itertools
from pathlib import Path

from django.utils import timezone
from django.conf import settings

from alerts.models import Ticket, TicketComment, AuthorizationRequest
from alerts.modules import conditions
from alerts.modules.base_states import CONDITIONS_TYPES
from alerts.modules.base import BaseController
from alerts.modules.base_states import AUTHORIZATION_LEVELS, ALERT_STATES, EVENT_STATES
from alerts.modules.rules import Rule
from alerts.tests.controller_base import ControllerBaseTestCase

TESTS_DIR = Path(__file__).parent


# Test execution of common conditions on tickets
# All test in this class shoul have a similar structure
# assert initially condition is not completed
# add required elements to complete condition
# evaluate condition again to assert it is completed
class CommonConditionsTestCase(ControllerBaseTestCase):
    def setUp(self):
        # start test with an empty ticket
        self.ticket = Ticket.objects.create(
            module="_.foo",
            state="A",
            target=self.target_object,
        )
        # Create a random document
        self.document = self.random_document()

    def test_condition_alert_comment(self):
        self.assertFalse(conditions.condition_alert_comment(self.ticket)['complete'])
        comment_type = TicketComment.CommentType.ALERT_MANAGEMENT
        TicketComment.objects.create(ticket=self.ticket, comment_type=comment_type)
        self.assertTrue(conditions.condition_alert_comment(self.ticket)['complete'])

    def test_condition_close_comment(self):
        # Close condition is not complete
        self.assertFalse(conditions.condition_close_comment(self.ticket)['complete'])
        comment_type = TicketComment.CommentType.CLOSE_REPORT
        # Add a comment
        comment = TicketComment.objects.create(ticket=self.ticket, comment_type=comment_type)
        # Close condition is not complete yet, because there is no document
        self.assertFalse(conditions.condition_close_comment(self.ticket)['complete'])
        # Add a document
        comment.documents.add(self.document)
        # Close condition is complete
        self.assertTrue(conditions.condition_close_comment(self.ticket)['complete'])

    # condition_children_closed
    def test_condition_children_closed(self):
        child1 = Ticket.objects.create(
            module="_.foo.child1",
            state="not closed",
            target=self.target_object,
        )
        child2 = Ticket.objects.create(
            module="_.foo.child2",
            state="not closed",
            target=self.target_object,
        )
        child1_c = Ticket.objects.create(
            module="_.foo.child1",
            state=Ticket.TicketState.CLOSED,
            target=self.target_object,
        )
        child2_c = Ticket.objects.create(
            module="_.foo.child2",
            state=Ticket.TicketState.CLOSED,
            target=self.target_object,
        )

        controller_no_children = BaseController(self.ticket, [], timezone.now(), self.target_object)
        ctx_no_children = Rule.Context(controller_no_children, [], None)

        controller_with_children = BaseController(self.ticket, [child1, child2], timezone.now(), self.target_object)
        ctx_with_children = Rule.Context(controller_with_children, [], None)

        controller_with_closed_children = BaseController(
            self.ticket, [child1_c, child2_c], timezone.now(), self.target_object
        )
        ctx_with_closed_children = Rule.Context(controller_with_closed_children, [], None)

        # no children
        self.assertTrue(conditions.condition_children_closed(self.ticket, ctx_no_children)['complete'])

        # children in context
        self.assertFalse(conditions.condition_children_closed(self.ticket, ctx_with_children)['complete'])
        self.assertTrue(conditions.condition_children_closed(self.ticket, ctx_with_closed_children)['complete'])

        # children in ticket reference
        self.ticket.children.set([child1, child2])
        self.assertFalse(conditions.condition_children_closed(self.ticket, ctx_no_children)['complete'])
        self.ticket.children.set([child1_c, child2_c])
        self.assertTrue(conditions.condition_children_closed(self.ticket, ctx_no_children)['complete'])

    def test_condition_event_comment(self):
        self.assertFalse(conditions.condition_event_comment(self.ticket)['complete'])
        comment_type = TicketComment.CommentType.EVENT_MANAGEMENT
        TicketComment.objects.create(ticket=self.ticket, comment_type=comment_type)
        self.assertTrue(conditions.condition_event_comment(self.ticket)['complete'])

    def assertAuthRequestStatus(self, authorization, evaluate_ticket):
        # assert initially false
        self.assertFalse(evaluate_ticket())

        # create auth request
        auth_request = AuthorizationRequest.objects.create(
            ticket=self.ticket,
            authorization=authorization
        )
        # assert false because new requests by default are not approved
        self.assertFalse(evaluate_ticket())

        # deny request
        auth_request.status = AuthorizationRequest.Status.DENIED
        auth_request.save()
        # assert false because request is denied
        self.assertFalse(evaluate_ticket())

        # approve request
        auth_request.status = AuthorizationRequest.Status.APPROVED
        auth_request.save()
        # assert true because request is approved
        self.assertTrue(evaluate_ticket())

        # mark authorization as used
        auth_request.status = AuthorizationRequest.Status.APPROVED_AND_USED
        auth_request.save()
        # assert false because approval is no longer valid
        self.assertFalse(evaluate_ticket())

    def assertEscalate(self, states, levels):
        for from_state, to_state, _level in itertools.product(states, states, levels):
            if from_state == to_state:
                continue
            authorization = f'ticket.{from_state}.escalate.{to_state}.authorization.{_level}'
            [role, level] = _level.split('-')
            if role == 'authority':
                def evaluate_ticket():
                    return conditions.condition_auth_authority(
                        self.ticket, level, from_state, 'escalate', to_state
                    )['complete']
            else:
                def evaluate_ticket():
                    return conditions.condition_auth_miner(
                        self.ticket, level, from_state, 'escalate', to_state
                    )['complete']
            self.assertAuthRequestStatus(authorization, evaluate_ticket)

    def test_authorization_conditions(self):
        all_states = [*ALERT_STATES, *EVENT_STATES]
        # all archive and close actions
        for action, from_state, _level in itertools.product(['close', 'archive'], all_states, AUTHORIZATION_LEVELS):
            authorization = f'ticket.{from_state}.{action}.authorization.{_level}'
            [role, level] = _level.split('-')
            if role == 'authority':
                def evaluate_ticket():
                    return conditions.condition_auth_authority(
                        self.ticket, level, from_state, action
                    )['complete']
            else:
                def evaluate_ticket():
                    return conditions.condition_auth_miner(
                        self.ticket, level, from_state, action
                    )['complete']
            self.assertAuthRequestStatus(authorization, evaluate_ticket)

        # event escalate
        self.assertEscalate(EVENT_STATES, AUTHORIZATION_LEVELS)
        # alert escalate
        self.assertEscalate(ALERT_STATES, list(filter(lambda lvl: lvl.startswith('authority-'), AUTHORIZATION_LEVELS)))

    def get_authorization_condition(self, complete, authorization, request_user_groups=conditions.required_by_all):
        return {
            'type': CONDITIONS_TYPES.authorization,
            'description': '',
            'authorization': authorization,
            'complete': complete,
            'issue': 'AUTHORIZATION_REQUIRED',
            'required_by': request_user_groups
        }

    def test_getting_next_authorization(self):
        ONLY_MINER = 'Requested only by miner'
        ONLY_AUTHORITY = 'Requested only by authority'
        ALL = 'Requested by all'
        COMPLETED_ALL = 'Approved request requested by all'

        test_conditions = [
            self.get_authorization_condition(True, COMPLETED_ALL),
            self.get_authorization_condition(False, ALL),
        ]
        # Check next authorization for an authority user
        next_authorization = conditions.get_next_authorization(test_conditions, self.authority_user_object)
        self.assertEqual(next_authorization, ALL)
        # Check next authorization for a miner user
        next_authorization = conditions.get_next_authorization(test_conditions, self.mine_user_object)
        self.assertEqual(next_authorization, ALL)

        # Conditions with required request user groups
        test_conditions = [
            self.get_authorization_condition(True, COMPLETED_ALL),
            self.get_authorization_condition(False, ONLY_MINER, [settings.MINE_GROUP]),
            self.get_authorization_condition(False, ONLY_AUTHORITY, [settings.AUTHORITY_GROUP]),
            self.get_authorization_condition(False, ALL),
        ]
        # Check next authorization for an authority user
        next_authorization = conditions.get_next_authorization(test_conditions, self.authority_user_object)
        self.assertEqual(next_authorization, ONLY_AUTHORITY)
        # Check next authorization for a miner
        next_authorization = conditions.get_next_authorization(test_conditions, self.mine_user_object)
        self.assertEqual(next_authorization, ONLY_MINER)

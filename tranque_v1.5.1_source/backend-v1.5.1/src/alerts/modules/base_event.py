import logging
from alerts.modules import base
from alerts.modules.base_states import EVENT_STATES, NO_LEVEL
from alerts.modules.conditions import condition_event_comment, condition_auth_authority
from alerts.modules.rules import Rule

logger = logging.getLogger(__name__)


class EventController(base.BaseController):
    # state families, implementations could have multiple states in the same family
    # e.g. A1, A2, A3, ...
    states = EVENT_STATES

    def archive_conditions(self, ticket, ctx):
        return [
            condition_event_comment(ticket),
            condition_auth_authority(ticket, 2, ticket.state_group, 'archive')
        ]

    def get_level(self, ticket):
        if ticket.state_group == EVENT_STATES.A:
            return 1
        elif ticket.state_group == EVENT_STATES.B:
            return 2
        elif ticket.state_group == EVENT_STATES.C:
            return 3
        elif ticket.state_group == EVENT_STATES.D:
            return 4
        return NO_LEVEL

    update_by_intent = Rule.assemble(
        Rule("if in a SMC block any intent if target has a remote")
        .when_stack_is_smc()
        .when(lambda ctx: ctx.controller.target.remote is not None)
        .then_no_result(),

        # conditions are checked before running this method
        Rule("close")
        .when_attempts_closing()
        .then_update_by_intent(description=Rule.ActionDescription.CLOSE),

        Rule("escalate")
        .when_attempts_escalating()
        .then_update_by_intent(description=Rule.ActionDescription.ESCALATE),

        Rule("archive")
        .when_attempts_archiving(True)
        .then_update_by_intent(description=Rule.ActionDescription.ARCHIVE, next_archived=True),

        Rule("unarchive")
        .when_attempts_archiving(False)
        .then_update_by_intent(description=Rule.ActionDescription.ARCHIVE, next_archived=False),
    )

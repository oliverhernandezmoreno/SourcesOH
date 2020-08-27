import logging

from alerts.models import AuthorizationRequest
from alerts.modules import base
from alerts.modules.base_states import ALERT_STATES
from alerts.modules.conditions import (
    condition_alert_comment,
    condition_children_closed,
    condition_close_comment,
    condition_auth_authority,
)
from alerts.modules.rules import Rule

logger = logging.getLogger(__name__)


class BaseAlertController(base.BaseController):
    states = ALERT_STATES

    description = 'En este ticket podrá ver y acceder a los incidentes que gatillaron ' + \
                  'la alerta y su detalle de datos o reportes de cada parámetro afectado.'

    def get_level(self, ticket):
        if ticket.state == self.states.YELLOW:
            return 5
        elif ticket.state == self.states.RED:
            return 6
        else:
            return -1

    def result_state(self, ticket):
        if ticket.state == self.CLOSED_STATE:
            return {"level": 0, "short_message": self.name}
        return {
            "level": self.get_level(ticket),
            "short_message": self.name,
            "message": self.description
        }

    def should_propagate(self, ticket):
        return True

    def close_conditions(self, ticket, ctx):
        ret = [
            condition_alert_comment(ticket),
            condition_auth_authority(ticket, 3, ticket.state_group, 'close')
        ]
        if ticket.state == self.states.YELLOW:
            ret.append(condition_children_closed(ticket, ctx, lambda t: self.is_family(t, 'C')))
        if ticket.state == self.states.RED:
            ret.append(condition_children_closed(ticket, ctx, lambda t: self.is_family(t, 'C', 'D')))
            ret.append(condition_close_comment(ticket))

        return ret

    def escalate_conditions(self, ticket, ctx):
        if ticket.state == self.states.YELLOW:
            return {
                'RED': [
                    condition_alert_comment(ticket),
                    condition_auth_authority(ticket, 3, ticket.state_group, 'escalate', self.states.RED),
                ]
            }
        if ticket.state == self.states.RED:
            return {
                'YELLOW': [
                    condition_alert_comment(ticket),
                    condition_children_closed(ticket, ctx, lambda t: self.is_family(t, 'D')),
                    condition_auth_authority(ticket, 3, ticket.state_group, 'escalate', self.states.YELLOW),
                    condition_close_comment(ticket)
                ]
            }
        return {}

    def cleanup_after_intent(self, ticket, action):
        # mark approved authorization as resolved
        query = ticket.authorizations.filter(
            authorization__startswith=action,
            status=AuthorizationRequest.Status.APPROVED
        )
        for authorization_request in query:
            authorization_request.status = AuthorizationRequest.Status.APPROVED_AND_USED
            authorization_request.save()

    block_sml_stack = Rule("prevent actions if stack is sml").when_stack_is_sml().then_no_result()

    create = Rule.assemble(
        block_sml_stack,
        # RED
        Rule("create RED if any D children")
        .when(lambda ctx: any(t.state.startswith('D') for t in ctx.controller.child_tickets))
        .then_update_by_children(
            state=ALERT_STATES.RED,
            description=Rule.ActionDescription.CREATE,
        ),

        # YELLOW
        Rule("create YELLOW if any C children")
        .when(lambda ctx: any(t.state.startswith('C') for t in ctx.controller.child_tickets))
        .then_update_by_children(
            state=ALERT_STATES.YELLOW,
            description=Rule.ActionDescription.CREATE,
        ),
    )

    create_by_intent = Rule.assemble(
        Rule("manually create yellow alert")
        .when_intent_state(ALERT_STATES.YELLOW)
        .then_update_by_intent(description=Rule.ActionDescription.CREATE, state=ALERT_STATES.YELLOW),

        Rule("manually create red alert")
        .when_intent_state(ALERT_STATES.RED)
        .then_update_by_intent(description=Rule.ActionDescription.CREATE, state=ALERT_STATES.RED),

        Rule("block any other activation attempt")
        .then_issue("BLOCKED_BY_RULES"),
    )

    update = Rule.assemble(
        block_sml_stack,
        # RED
        Rule("escalate to RED if YELLOW and any D children")
        .when(lambda ctx: ctx.controller.ticket.state == ALERT_STATES.YELLOW)
        .when(lambda ctx: any(t.state.startswith('D') for t in ctx.controller.child_tickets))
        .then_update_by_children(
            state=ALERT_STATES.RED,
            description=Rule.ActionDescription.ESCALATE,
        ),
    )

    update_by_intent = Rule.assemble(
        block_sml_stack,
        # conditions are checked before running this method
        Rule("close")
        .when_attempts_closing()
        .then_update_by_intent(description=Rule.ActionDescription.CLOSE),

        Rule("escalate")
        .when_attempts_escalating()
        .then_update_by_intent(description=Rule.ActionDescription.ESCALATE),

        Rule("block anything else").then_no_result()
    )

from alerts.modules.base import BaseController
from alerts.modules.base_states import ALERT_STATES, EVENT_STATES
from alerts.modules.conditions import condition_auth_authority, condition_auth_miner
from alerts.modules.rules import Rule
from base.fields import StringEnum


def all_authorizations(ticket, from_state, action, to_state=None):
    # all conditions require all authorizations
    return list(filter(bool, [
        condition_auth_miner(ticket, 2, from_state, action, to_state) if from_state in EVENT_STATES else None,
        condition_auth_miner(ticket, 3, from_state, action, to_state) if from_state in EVENT_STATES else None,
        condition_auth_authority(ticket, 2, from_state, action, to_state),
        condition_auth_authority(ticket, 3, from_state, action, to_state),
    ]))


class Controller(BaseController):
    children = ("*.child",)
    name = 'API test, parent controller'

    # event states will have a number suffix to emulate groups of ticket A, B, ...
    states = StringEnum(*ALERT_STATES, *[f'{s}1' for s in EVENT_STATES], *EVENT_STATES)

    def close_conditions(self, ticket, ctx):
        return all_authorizations(ticket, ticket.state_group, 'close')

    def archive_conditions(self, ticket, ctx):
        return all_authorizations(ticket, ticket.state_group, 'archive')

    def escalate_conditions(self, ticket, ctx):
        states = EVENT_STATES if ticket.state_group in EVENT_STATES else ALERT_STATES
        return {
            to_state: all_authorizations(ticket, ticket.state_group, 'escalate', to_state)
            for to_state in states
            if ticket.state_group != to_state
        }

    update_by_intent = Rule.assemble(Rule("test").then_update_by_intent(description='TEST'))
    create_by_intent = Rule.assemble(Rule("test").then_update_by_intent(description='TEST'))

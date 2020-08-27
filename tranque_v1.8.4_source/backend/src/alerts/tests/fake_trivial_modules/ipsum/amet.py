from alerts.modules.conditions import condition_auth_miner
from alerts.tests.fake_trivial_modules.base import BaseTestController
from alerts.modules.base_states import EVENT_STATES, ALERT_STATES
from base.fields import StringEnum


class Controller(BaseTestController):
    states = StringEnum(*EVENT_STATES, *ALERT_STATES, 'A1', 'B1-1')

    visibility_groups = ("loremipsum",)

    def escalate_conditions(self, ticket, ctx):
        return {
            'B': [
                condition_auth_miner(ticket, 3, ticket.state_group, 'escalate', 'B')
            ],
            'C': [
                condition_auth_miner(ticket, 3, ticket.state_group, 'escalate', 'C')
            ],
            'D': []
        }

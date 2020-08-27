from alerts.modules.conditions import condition_auth_authority, condition_auth_miner, condition_event_comment
from alerts.tests.fake_trivial_modules.base import BaseTestController
from django.conf import settings


class Controller(BaseTestController):
    visibility_groups = ("loremipsum",)

    def escalate_conditions(self, ticket, ctx):
        return {
           'B': [
                condition_event_comment(ticket, [settings.MINE_GROUP]),
                condition_auth_miner(ticket, 3, ticket.state_group, 'escalate', 'B', [settings.MINE_GROUP]),
                condition_auth_authority(ticket, 3, ticket.state_group, 'escalate', 'B')
            ]
        } if ticket.state == 'A' else {}

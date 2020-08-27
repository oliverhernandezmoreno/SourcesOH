from alerts.modules.conditions import condition_auth_authority, condition_auth_miner
from alerts.tests.fake_trivial_modules.base import BaseTestController


class Controller(BaseTestController):
    children = ("*.bar",)

    visibility_groups = ("loremipsum",)

    def close_conditions(self, ticket, ctx):
        return [
            condition_auth_miner(ticket, 2, ticket.state_group, 'close'),
            condition_auth_miner(ticket, 3, ticket.state_group, 'close'),
            condition_auth_authority(ticket, 3, ticket.state_group, 'close')
        ]

    def archive_conditions(self, ticket, ctx):
        return [
            condition_auth_authority(ticket, 3, ticket.state_group, 'archive')
        ]

    def escalate_conditions(self, ticket, ctx):
        return {
            'B': [
                condition_auth_miner(ticket, 3, ticket.state_group, 'escalate', 'B'),
                condition_auth_authority(ticket, 3, ticket.state_group, 'escalate', 'B')
            ]
        } if ticket.state == 'A' else {}

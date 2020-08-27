import logging

from alerts.modules.base_event import EventController
from django.conf import settings
from alerts.modules.conditions import (
    required_by_all,
    condition_event_comment,
    condition_children_closed,
    condition_auth_authority,
    condition_auth_miner,
    condition_event_normalization,
)

logger = logging.getLogger(__name__)


class EFEventController(EventController):

    def should_propagate(self, ticket):
        return not self.is_family(ticket, 'A')

    def close_conditions(self, ticket, ctx):
        ret = [
            condition_event_comment(ticket),
            condition_event_normalization(ticket, ctx)
        ]

        if self.is_family(ticket, 'B', 'C', 'D'):
            ret.append(condition_children_closed(ticket, ctx))

        if self.is_family(ticket, 'C', 'D'):
            ret.append(condition_auth_authority(ticket, 2, ticket.state_group, 'close'))
            ret.append(condition_auth_miner(ticket, 2, ticket.state_group, 'close'))

        return ret

    def archive_conditions(self, ticket, ctx):
        return [
            condition_event_comment(ticket),
            condition_auth_authority(ticket, 2, ticket.state_group, 'archive')
        ]

    def escalate_conditions(self, ticket, ctx):
        comment = condition_event_comment(ticket)
        only_miner_comment = condition_event_comment(ticket, [settings.MINE_GROUP])

        def auth_miner(level, to_state, required_by=required_by_all):
            return condition_auth_miner(ticket, level, ticket.state_group, 'escalate', to_state, required_by)

        def auth_authority(to_state):
            return condition_auth_authority(ticket, 3, ticket.state_group, 'escalate', to_state)

        ret = {}
        if self.is_family(ticket, 'A'):
            ret['B'] = [
                comment,
                auth_miner(2, 'B')
            ]
        if self.is_family(ticket, 'A', 'B'):
            ret['C'] = [
                only_miner_comment,
                auth_miner(2, 'C', [settings.MINE_GROUP]),
                auth_miner(3, 'C', [settings.MINE_GROUP]),
                auth_authority('C')
            ]
        if self.is_family(ticket, 'A', 'B', 'C'):
            ret['D'] = [
                only_miner_comment,
                auth_miner(2, 'D', [settings.MINE_GROUP]),
                auth_miner(3, 'D', [settings.MINE_GROUP]),
                auth_authority('D')
            ]
        return ret

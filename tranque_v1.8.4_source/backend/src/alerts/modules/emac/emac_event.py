import logging

from alerts.modules.conditions import (
    condition_event_comment,
    condition_event_normalization,
    condition_auth_miner,
    condition_children_closed,
    condition_auth_authority,
)
from alerts.modules.base_event import EventController

logger = logging.getLogger(__name__)


class EMACEventController(EventController):
    def close_conditions(self, ticket, ctx):
        ret = [
            condition_event_comment(ticket),
            condition_event_normalization(ticket, ctx)
        ]

        if self.is_family(ticket, 'A'):
            ret.append(condition_auth_miner(ticket, 2, ticket.state_group, 'close'))

        if self.is_family(ticket, 'B', 'C', 'D'):
            ret.append(condition_children_closed(ticket, ctx))
            ret.append(condition_auth_authority(ticket, 2, ticket.state_group, 'close'))

        return ret

    def escalate_conditions(self, ticket, ctx):
        comment = condition_event_comment(ticket)

        def auth_miner(level, to_state):
            return condition_auth_miner(ticket, level, ticket.state_group, 'escalate', to_state)

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
                comment,
                auth_miner(3, 'C'),
                auth_authority('C')
            ]
        if self.is_family(ticket, 'A', 'B', 'C'):
            ret['D'] = [
                comment,
                auth_miner(3, 'D'),
                auth_authority('D')
            ]
        return ret

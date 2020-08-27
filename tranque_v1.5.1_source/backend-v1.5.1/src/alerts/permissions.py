from alerts.modules.base_states import ALERT_STATES, EVENT_STATES, AUTHORIZATION_LEVELS, CLOSED, ALL_TICKET_STATES
from base.permissions import ModelExtraPermissions


class AlertsExtraPermissions(ModelExtraPermissions):
    model = 'targets.Target'
    tag = 'ticket'

    def _common(self, from_state, to_states, levels):
        # escalate
        for to_state in to_states:
            for level in levels:
                yield (
                    f'ticket.{from_state}.escalate.{to_state}.authorization.{level}.read',
                    f'Read authorization {level} to escalate from {from_state} to {to_state}',
                )
                yield (
                    f'ticket.{from_state}.escalate.{to_state}.authorization.{level}.request',
                    f'Request authorization {level} to escalate from {from_state} to {to_state}',
                )
                yield (
                    f'ticket.{from_state}.escalate.{to_state}.authorization.{level}.resolve',
                    f'Resolve authorization {level} to escalate from {from_state} to {to_state}',
                )
            yield (
                f'ticket.{from_state}.escalate.{to_state}',
                f'Escalate from {from_state} to {to_state}',
            )
        # close, archive
        for action in ['close', 'archive']:
            for level in levels:
                yield (
                    f'ticket.{from_state}.{action}.authorization.{level}.read',
                    f'Read authorization {level} to {action} {from_state}',
                )
                yield (
                    f'ticket.{from_state}.{action}.authorization.{level}.request',
                    f'Request authorization {level} to {action} {from_state}',
                )
                yield (
                    f'ticket.{from_state}.{action}.authorization.{level}.resolve',
                    f'Resolve authorization {level} to {action} {from_state}',
                )
            yield (
                f'ticket.{from_state}.{action}',
                f'{action} {from_state}',
            )

    def _alert_read(self, state):
        yield (
            f'ticket.{state}.public_alert_messages.read',
            f'Read {state} alert messages displayed in public site',
        )
        yield (
            f'ticket.{state}.alert_management_comment.read',
            f'Read alert management information for state {state}',
        )
        yield (
            f'ticket.{state}.alert_complementary_comment.read',
            f'Read complementary alert data for state {state}',
        )
        yield (
            f'ticket.{state}.close_report_comment.read',
            f'Read close report for state {state}',
        )

    @property
    def permissions(self):
        # common
        for state in ALL_TICKET_STATES:
            yield (
                f'ticket.{state}.read',
                f'Read basic data from tickets "{state}"',
            )
            yield (
                f'ticket.{state}.children.read',
                f'Read children tickets from tickets "{state}"',
            )
            yield (
                f'ticket.{state}.event_data.read',
                f'Read related events from tickets "{state}"',
            )
            yield (
                f'ticket.{state}.log.read',
                f'Read logs from tickets "{state}"',
            )
            yield (
                f'ticket.{state}.log.write',
                f'Write logs from tickets "{state}"',
            )

        # events
        for state in EVENT_STATES:
            yield (
                f'ticket.{state}.event_management_comment.write',
                f'Add event management data for state {state}',
            )
            yield (
                f'ticket.{state}.event_management_comment.read',
                f'Read event management data for state {state}',
            )
            yield from self._common(state, list(filter(lambda x: x != state, EVENT_STATES)), AUTHORIZATION_LEVELS)
        yield (
            f'ticket.{CLOSED}.event_management_comment.read',
            f'Read event management data for state {CLOSED}',
        )
        # alerts
        alert_levels = list(filter(lambda x: x.startswith('authority'), AUTHORIZATION_LEVELS))
        for state in ALERT_STATES:
            yield from self._alert_read(state)
            yield (
                f'ticket.{state}.alert_management_comment.write',
                f'Add alert management information for state {state}',
            )
            yield (
                f'ticket.{state}.alert_complementary_comment.write',
                f'Add complementary alert data for state {state}',
            )
            yield (
                f'ticket.{state}.close_report_comment.write',
                f'Add close report for state {state}',
            )
            yield (
                f'ticket.{state}.public_alert_messages.write',
                f'Write new {state} alert messages displayed in public site',
            )
            yield from self._common(state, list(filter(lambda x: x != state, ALERT_STATES)), alert_levels)
        yield from self._alert_read(CLOSED)

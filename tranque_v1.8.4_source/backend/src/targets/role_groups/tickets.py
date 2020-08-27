import itertools

from alerts.modules.base_states import (
    EVENT_STATES, ALL_TICKET_STATES, AUTHORIZATION_LEVELS,
    ALERT_STATES, CLOSED, SEMAPHORE_STATES, DATA_SCOPES
)
from targets.role_groups.base import create_target_group, NAV_PERMS


def get_escalate_options(states):
    return [(s1, s2) for s1, s2 in itertools.product(states, states) if s1 != s2]


event_escalate_options = get_escalate_options(EVENT_STATES)
alert_escalate_options = get_escalate_options(ALERT_STATES)

alerts_and_closed = [*ALERT_STATES, CLOSED]
events_and_closed = [*EVENT_STATES, CLOSED]
semaphores = [*SEMAPHORE_STATES]
data_scopes = [*DATA_SCOPES]

base_actions = ['read', 'log.read', 'log.write', 'event_data.read', 'children.read']

base = [
    *list(f'ticket.{s}.{action}' for s in ALL_TICKET_STATES for action in base_actions),
    *list(f'ticket.{s}.event_management_comment.read' for s in events_and_closed),
    *list(f'ticket.{s}.alert_complementary_comment.read' for s in alerts_and_closed),
    *list(f'ticket.{s}.public_alert_messages.read' for s in semaphores),
    *list(f'ticket.{ds}.alert_disconnection.read' for ds in data_scopes),
    *list(f'ticket.{ds}.manual_alert.read' for ds in data_scopes),
]

alert_levels = frozenset(filter(lambda x: x.startswith('authority'), AUTHORIZATION_LEVELS))


def auth_request_action(action, states, options, levels):
    for (from_state, to_state), level in itertools.product(options, levels):
        yield f'ticket.{from_state}.escalate.{to_state}.authorization.{level}.{action}'
    for state, level in itertools.product(states, levels):
        yield f'ticket.{state}.close.authorization.{level}.{action}'
        yield f'ticket.{state}.archive.authorization.{level}.{action}'


def get_event_auth_request_action(action, levels=AUTHORIZATION_LEVELS):
    yield from auth_request_action(action, EVENT_STATES, event_escalate_options, levels)


def get_alert_auth_request_action(action, levels=alert_levels):
    yield from auth_request_action(action, ALERT_STATES, alert_escalate_options, levels)


def create_ticket_miners_groups(scope, target, write):
    auth_request_read = list(get_event_auth_request_action('read'))

    miner_base = [NAV_PERMS['miner'][scope], *base]

    # miner 1
    create_target_group(target, f'ticket.{scope}.miner-1', [
        *miner_base,
        *list(f'ticket.{s}.event_management_comment.write' for s in EVENT_STATES),
        *auth_request_read,
        *list(get_event_auth_request_action('request')),
        *list(f'ticket.{s}.close' for s in EVENT_STATES),
        *list(f'ticket.{s}.archive' for s in EVENT_STATES),
        *list(f'ticket.{s1}.escalate.{s2}' for s1, s2 in event_escalate_options),
    ], write)

    # miner 2
    create_target_group(target, f'ticket.{scope}.miner-2', [
        *miner_base,
        *auth_request_read,
        *list(get_event_auth_request_action('resolve', ['miner-2']))
    ], write)

    # miner 3
    create_target_group(target, f'ticket.{scope}.miner-3', [
        *miner_base,
        *auth_request_read,
        *list(get_event_auth_request_action('resolve', ['miner-3'])),
        *list(f'ticket.{s}.alert_complementary_comment.read' for s in ALERT_STATES),
        *list(f'ticket.{s}.alert_complementary_comment.write' for s in ALERT_STATES),
    ], write)

    # miner 4
    create_target_group(target, f'ticket.{scope}.miner-4', miner_base, write)


def create_ticket_authority_groups(scope, target, write):
    authority_base = [
        NAV_PERMS['authority'][scope],
        *base,
        *list(f'ticket.{s}.close_report_comment.read' for s in alerts_and_closed),
        *list(f'ticket.{s}.alert_management_comment.read' for s in alerts_and_closed),
    ]

    auth_request_read = list(get_alert_auth_request_action('read'))

    # authority 1
    create_target_group(target, f'ticket.{scope}.authority-1', [
        *authority_base,
    ], write)

    # authority 2
    create_target_group(target, f'ticket.{scope}.authority-2', [
        *authority_base,
        *auth_request_read,
        *list(get_event_auth_request_action('resolve', ['authority-2'])),
        *list(get_alert_auth_request_action('resolve', ['authority-2'])),
        *list(get_event_auth_request_action('request', ['authority-3'])),
        *list(get_alert_auth_request_action('request', ['authority-3'])),
        *list(f'ticket.{s1}.escalate.{s2}' for s1, s2 in event_escalate_options),
        *list(f'ticket.{s1}.escalate.{s2}' for s1, s2 in alert_escalate_options),
        *list(f'ticket.{s}.close' for s in ALERT_STATES),
        *list(f'ticket.{s}.alert_management_comment.write' for s in ALERT_STATES),
        *list(f'ticket.{s}.close_report_comment.write' for s in ALERT_STATES),

    ], write)

    # authority 3
    create_target_group(target, f'ticket.{scope}.authority-3', [
        *authority_base,
        *auth_request_read,
        *list(get_event_auth_request_action('resolve', ['authority-3'])),
        *list(get_alert_auth_request_action('resolve', ['authority-3'])),
        *list(f'ticket.{s}.public_alert_messages.write' for s in semaphores),
        *list(f'ticket.{ds}.alert_disconnection.write' for ds in data_scopes),
        *list(f'ticket.{ds}.manual_alert.write' for ds in data_scopes),
        *list(f'ticket.{s}.create' for s in ALERT_STATES),
    ], write)


def create_ticket_groups(target, write):
    for scope in ['ef', 'emac']:
        create_ticket_miners_groups(scope, target, write)
        create_ticket_authority_groups(scope, target, write)

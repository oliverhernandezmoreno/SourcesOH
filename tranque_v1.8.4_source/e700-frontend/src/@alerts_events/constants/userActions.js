import {getGroup, RED_ALERT, isAlert} from '@alerts_events/constants/ticketGroups';
import {getUserPerms} from '@app/permissions';

export const CLOSE = 'close';
export const ESCALATE = 'escalate';
export const ARCHIVE = 'archive';
export const UNESCALATE = 'unescalate';

export function spanishAction(action, ticket) {
    switch (action) {
        case CLOSE:
            return 'cerrar';
        case ESCALATE:
            if (getGroup(ticket) === RED_ALERT) return 'desescalar';
            return 'escalar';
        case ARCHIVE:
            if (ticket.archived) return 'desarchivar';
            return 'archivar';
        default:
            return '';
    }
}

export function canSeePublicAlertMessages(user, alert_type, write) {
    const actions = getActions(user);
    const interaction = write ? 'write' : 'read';
    return actions.some(a =>
        a.includes('ticket.' + alert_type + '.public_alert_messages.' + interaction));
}

export function seeComments(user, type, write, group) {
    const actions = getActions(user);
    const interaction = write ? 'write' : 'read';
    return actions.some(a =>
        a.includes('.' + group + '.' + type + '_comment.' + interaction));
}

export function canExecute(user, action, group) {
    if (isAlert(group) && action === ARCHIVE) return false;
    const actions = getActions(user);
    return actions.some(a =>
        a.includes('ticket.' + group + '.' + action) &&
        !a.includes('.authorization.') &&
        !a.includes('ticket.' + group + '.' + action + '_')
    );
}

export function canEscalate(user, group, next) {
    const actions = getActions(user);
    return actions.some(a =>
        a.includes('ticket.' + group + '.escalate.' + next) &&
        !a.includes('.authorization.')
    );
}

export function canRequest(user, group, action) {
    const actions = getActions(user);
    return actions.some(a =>
        a.includes('ticket.' + group + '.' + action + '.') &&
        a.includes('.request')
    );
}

export function canRequestEscalate(user, group, next) {
    const actions = getActions(user);
    return actions.some(a =>
        a.includes('ticket.' + group + '.escalate.' + next + '.') &&
        a.includes('.request')
    );
}

export function hasToResolveAuthorization(user, action) {
    const actions = getActions(user);
    return actions.some(a => a.includes(action + '.resolve'));
}

export function isReceivedRequest(user, request) {
    const actions = getActions(user);
    return actions.some(a => a.includes(request.authorization + '.resolve'));
}

export function isRequestedRequest(user, request) {
    const actions = getActions(user);
    return actions.some(a => a.includes(request.authorization + '.request')) &&
        request.created_by.id === user.id;
}

export function getRequestInfo(requestString) {
    if (!requestString.includes('.authorization.')) return {};
    const requestArray = requestString.split('.');
    const from_state = requestArray.length > 1 && requestArray[1];
    const action = requestArray.length > 2 && requestArray[2];
    let to_state = null;
    if (action === ESCALATE) {
        to_state = requestArray.length > 3 && requestArray[3];
    }
    return {from_state, action, to_state};
}

export function canSeeTicket(user, group) {
    const actions = getActions(user);
    return actions.some(a =>
        a.includes('ticket.' + group + '.read')
    );
}

function getActions(user) {
    return getUserPerms(user, true);
}

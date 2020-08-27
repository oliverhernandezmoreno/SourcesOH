import { ESCALATE, UNESCALATE } from '@alerts_events/constants/userActions';
import { RED_ALERT } from '@alerts_events/constants/ticketGroups';

// Strings according to ones in backend
export const PENDING = 'pending';
export const APPROVED = 'approved';
export const APPROVED_AND_USED = 'approved_and_used';
export const DENIED = 'denied';

export function isResolved(request) {
    return request.status === APPROVED ||
        request.status === APPROVED_AND_USED ||
        request.status === DENIED;
}

export function getRequestInfo(requestString) {
    if (!requestString) return {};
    if (!requestString.includes('.authorization.')) return {}
    const requestArray = requestString.split('.');
    const from_state = requestArray.length > 1 && requestArray[1];
    const action = requestArray.length > 2 && requestArray[2];
    let to_state = null;
    if (action === ESCALATE) {
        to_state = requestArray.length > 3 && requestArray[3];
    }
    return {from_state, action, to_state};
}

export function getNumberOfRequests(requests, requests_scope, requests_action) {
    if (!requests) return 0;
    return requests.filter(req => {
        let {action, from_state} = getRequestInfo(req.authorization);
        if (action === ESCALATE && from_state === RED_ALERT) {
            action = UNESCALATE;
        }
        const scope = req.ticket.scope;
        return (
            // Getting pending requests
            req.status === PENDING &&
            // Getting requests for a specific action
            action === requests_action &&
            // Getting requests for a scope
            scope === requests_scope
        );
    }).length;
}

export function getSpanishRequestStatus(request) {
    switch (request.status) {
        case PENDING:
            return 'pendiente';
        case APPROVED:
            return 'aprobado';
        case APPROVED_AND_USED:
            return 'aprobado';
        case DENIED:
            return 'rechazado';
        default:
            return null;
    }
}
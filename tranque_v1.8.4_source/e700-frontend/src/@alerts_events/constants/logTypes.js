import React from 'react';
import { spanishAction } from '@alerts_events/constants/userActions';
import { APPROVED, DENIED, getRequestInfo } from '@alerts_events/constants/authorizationStates';
import { groupNames, RED_ALERT } from '@alerts_events/constants/ticketGroups';

// The string correspond to ones in backend (just manual actions, in other words, 'by user' actions)
export const CREATE = 'create';
export const COMMENT = 'comment';
export const CLOSE = 'close';
export const ESCALATE = 'escalate';
export const ARCHIVE = 'archive';
export const EVALUABLE = 'evaluable';
export const AUTHORIZATION = 'authorization';
export const REQUEST = 'request';

const descriptions = {
    [CREATE]: () => ' creó este ticket.',
    [COMMENT]: () => ' añadió un comentario.',
    [CLOSE]: () => ' cerró este ticket.',
    [ESCALATE]: (ticket, meta) => {
        const escalate_action = meta.previous_state === RED_ALERT ? 'desescaló' : 'escaló';
        return (<> {escalate_action} este ticket a <b>{groupNames[meta.next_state]}</b>.</>);
    },
    [ARCHIVE]: (ticket, meta) => {
        const action_verb = meta.next_archived ? ' archivó' : ' desarchivó';
        return action_verb + ' este ticket';
    },
    [EVALUABLE]: (ticket, meta) => {
        const state = meta.next_evaluable ? 'evaluable' : 'no evaluable';
        return ' cambió este ticket a ' + state + '.';
    },
    [AUTHORIZATION]: (ticket, meta) => {
        const auth_info = getRequestInfo(meta.authorization);
        const auth_action = auth_info.action;
        const auth_to_state = auth_info.to_state;
        const res_verb = ({
            [APPROVED]: 'aprobó',
            [DENIED]: 'rechazó',
        })[meta.status] ?? 'resolvió';
        const string = res_verb + ' una solicitud para ' + spanishAction(auth_action, ticket) + ' el ticket';
        return auth_to_state ? string + ' a ' + groupNames[auth_to_state] + '.' : string + '.';
    },
    [REQUEST]: (ticket, meta) => {
        const {action, to_state} = getRequestInfo(meta.authorization);
        const string = ' creó una solicitud para ' + spanishAction(action, ticket) + ' el ticket';
        return to_state ? string + ' a ' + groupNames[to_state] + '.' : string + '.';
    },
};

export function getLogDescription(ticket, meta) {
    return (descriptions[meta.description] ?? (() => meta.description))(ticket, meta);
}

import React from 'react';
import { spanishAction } from '@alerts_events/constants/userActions';
import { APPROVED, DENIED, getRequestInfo } from '@alerts_events/constants/authorizationStates';
import { groupNames, RED_ALERT } from '@alerts_events/constants/ticketGroups';

// The string correspond to ones in backend (just manual actions, in other words, 'by user' actions)
export const CREATE = 'create';
export const COMMENT = 'comment';
export const DOCUMENT = 'document';
export const CLOSE = 'close';
export const ESCALATE = 'escalate';
export const ARCHIVE = 'archive';
export const EVALUABLE = 'evaluable';
export const AUTHORIZATION = 'authorization';
export const REQUEST = 'request';

export function getLogDescription(ticket, meta) {
    switch (meta.description) {
        case CREATE:
            return ' creó este ticket.';
        case COMMENT:
            return ' añadió un comentario.';
        case DOCUMENT:
            return ' anadió archivos.';
        case CLOSE:
            return ' cerró este ticket.';
        case ESCALATE:
            const escalate_action = meta.previous_state === RED_ALERT ? 'desescaló' : 'escaló';
            return (<> {escalate_action} este ticket a <b>{groupNames[meta.next_state]}</b>.</>);
        case ARCHIVE:
            const action_verb = meta.next_archived ? ' archivó' : ' desarchivó';
            return action_verb + ' este ticket';
        case EVALUABLE:
            const state = meta.next_evaluable ? 'evaluable' : 'no evaluable';
            return ' cambió este ticket a ' + state + '.';
        case AUTHORIZATION:
            const auth_info = getRequestInfo(meta.authorization);
            const auth_action = auth_info.action;
            const auth_to_state = auth_info.to_state;
            let res_verb;
            switch (meta.status) {
                case APPROVED:
                    res_verb = 'aprobó';
                    break;
                case DENIED:
                    res_verb = 'rechazó';
                    break;
                default:
                    res_verb = 'resolvió';
            }
            let string = res_verb + ' una solicitud para ' + spanishAction(auth_action, ticket) + ' el ticket';
            return auth_to_state ? string + ' a ' + groupNames[auth_to_state] + '.' : string + '.';
        case REQUEST:
            const {action, to_state} = getRequestInfo(meta.authorization);
            string = ' creó una solicitud para ' + spanishAction(action, ticket) + ' el ticket';
            return to_state ? string + ' a ' + groupNames[to_state] + '.' : string + '.';
        default: return meta.description;
    }
}

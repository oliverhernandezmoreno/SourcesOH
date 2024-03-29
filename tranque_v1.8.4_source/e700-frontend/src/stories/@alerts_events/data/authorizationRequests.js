import {PENDING} from '@alerts_events/constants/authorizationStates';
import {getUser} from '../../data/User';
import {getDocuments} from '../../data/documents';
import { getTicket } from './Ticket';

export function getRequest(ticket, attrs, docs_number, comment) {
    const default_action = 'ticket.C.close.authorization.authority-2';
    const defaultTicket = getTicket(null);
    return {
        authorization: default_action,
        comment: attrs.status !== PENDING && comment ? 'Comentario de prueba' : '',
        created_at: '2020-05-05T15:55:45.782196Z',
        created_by: getUser({}, [default_action +  '.request']),
        documents: attrs.status !== PENDING ?
            getDocuments(docs_number, {request_id: {value: 'lOFLpJ1-WpuIPeB6zYnasA'}}, {}) : [],
        id: 'lOFLpJ1-WpuIPeB6zYnasA',
        resolved_at: attrs.status !== PENDING ? '2020-05-05T16:28:56.570943Z' : null,
        resolved_by: attrs.status !== PENDING ?
            getUser({}, [default_action + '.resolve']) : null,
        status: PENDING,
        ticket: ticket || defaultTicket,
        ...attrs
    };
}


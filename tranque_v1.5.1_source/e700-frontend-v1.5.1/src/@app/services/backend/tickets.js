import * as moment from 'moment/moment';
import {map} from 'rxjs/operators';
import * as config from '@app/config';
import {HttpClient} from '@app/services/httpClient';
import {handleListPagination} from '@app/services/backend/pagination';
/**
 * Injects useful properties into a ticket object.
 */
const normalizeTicket = (t) => ({
    ...t,
    level_message: ({
        1: 'Gestión interna',
        2: 'Reportado a autoridades',
        3: 'Alerta amarilla',
        4: 'Alerta roja'
    })[t.result_state.level] || null,
    created_at: moment(t.created_at),
    updated_at: moment(t.updated_at),
    closable: t.close_conditions.every((c) => c.complete),
    name: t.result_state.short_message || t.module_name || t.module,
    children: (t.children || []).map(normalizeTicket),
    parents: (t.parents || []).map(normalizeTicket)
});

/**
 * Performs a read request to the ticket endpoint.
 */
export const read = (options) => {
    const opts = {
        cache: null,
        host: config.API_HOST,
        target: null,
        ticket_id: null,
        ...(options || {})
    };
    const url = `${opts.host}/v1/target/${opts.target}/ticket/${opts.ticket_id}/`;
    return HttpClient.get(url, {
        cache: opts.cache,
        params: {}
    }).pipe(map((r) => normalizeTicket(r.data)));
};

const singlePage = (options) => {
    const opts = {
        cache: null,
        host: config.API_HOST,
        page: null,
        page_size: null,
        target: null,
        open: null,
        archived: null,
        evaluable: null,
        module: null,
        level: null,
        level_lte: null,
        level_lt: null,
        level_gte: null,
        level_gt: null,
        group: null,
        ...(options || {})
    };
    const url = opts.target ?
        `${opts.host}/v1/target/${opts.target}/ticket/` : // Target tickets
        `${opts.host}/v1/tickets/`; // All tickets
    return HttpClient.get(url, {
        cache: opts.cache,
        params: {
            ...(opts.page !== null ? {page: opts.page} : {}),
            ...(opts.page_size !== null ? {page_size: opts.page_size} : {}),
            ...(opts.open !== null ? {open: opts.open} : {}),
            ...(opts.archived !== null ? {archived: opts.archived} : {}),
            ...(opts.evaluable !== null ? {evaluable: opts.evaluable} : {}),
            ...(opts.module !== null ? {module: opts.module} : {}),
            ...(opts.level !== null ? {level: opts.level} : {}),
            ...(opts.level_lte !== null ? {level_lte: opts.level_lte} : {}),
            ...(opts.level_lt !== null ? {level_lt: opts.level_lt} : {}),
            ...(opts.level_gte !== null ? {level_gte: opts.level_gte} : {}),
            ...(opts.level_gt !== null ? {level_gt: opts.level_gt} : {}),
            ...(opts.group !== null ? {
                group: Array.isArray(opts.group) ?
                    opts.group.join(',') : opts.group
            } : {})
        }
    }).pipe(map((r) => r.data));
};

/**
 * Perfoms a list request to the ticket endpoint.
 */
export const list = (params) => singlePage(params).pipe((r) => r.results.map(normalizeTicket));

/**
 * Performs a de-paginated list request to the ticket endpoint.
 */
export const listAll = (params) => handleListPagination(params, singlePage).pipe(map((r) => r.map(normalizeTicket)));


/**
 * Creates a log entry with optional attachments.
 */
export const createLog = (options) => {
    const opts = {
        host: config.API_HOST,
        target: null,
        ticket_id: null,
        highlight: false,
        documents: [],
        description: null,
        ...(options || {})
    };
    const url = `${opts.host}/v1/target/${opts.target}/ticket/${opts.ticket_id}/log/`;
    return HttpClient.post(url, {
        highlight: opts.highlight,
        document_ids: opts.documents.map((doc) => typeof doc === 'string' ? doc : doc.id),
        description: opts.description
    }).pipe(map((r) => r.data));
};

/**
 * Performs a read request to the ticket log endpoint.
 */
export const readLog = (options) => {
    const opts = {
        host: config.API_HOST,
        target: null,
        ticket_id: null,
        ...(options || {})
    };
    const url = `${opts.host}/v1/target/${opts.target}/ticket/${opts.ticket_id}/log/`;
    return HttpClient.get(url, {
        cache: opts.cache,
        params: {}
    }).pipe(map((r) => r.data));
};

/**
 * Creates a broadcast for a given ticket.
 */
export const createBroadcast = (options) => {
    const opts = {
        host: config.API_HOST,
        target: null,
        ticket_id: null,
        handlers: [],
        ...(options || {})
    };
    const url = `${opts.host}/v1/target/${opts.target}/ticket/${opts.ticket_id}/broadcast/`;
    return HttpClient.post(url, {
        handlers: opts.handlers
    }).pipe(map((r) => r.data));
};

/**
 * Creates a user intent for a given ticket module.
 */
export const createIntent = (options) => {
    const opts = {
        host: config.API_HOST,
        target: null,
        module: null,
        state: null,
        archived: null,
        document: null,
        ...(options || {})
    };
    const url = `${opts.host}/v1/target/${opts.target}/status/${opts.module}/intent/`;
    return HttpClient.post(url, {
        state: opts.state,
        archived: opts.archived,
        ...(opts.document !== null ? {
            document: typeof opts.document === 'string' ?
                opts.document : opts.document.id
        } : {})
    }).pipe(map((r) => ({
        intent: r.data.intent,
        tickets: r.data.tickets.map(normalizeTicket)
    })));
};

/**
 * Performs a status list request.
 */
export const listStatus = (options) => {
    const opts = {
        cache: null,
        host: config.API_HOST,
        target: null,
        group: null,
        ...(options || {})
    };
    const url = `${opts.host}/v1/target/${opts.target}/status/`;
    return HttpClient.get(url, {
        cache: opts.cache,
        params: {
            ...(opts.group !== null ? {
                group: Array.isArray(opts.group) ?
                    opts.group.join(',') : opts.group
            } : {})
        }
    }).pipe(map((r) => ({
        result_state: r.data.result_state,
        status: r.data.status.map((st) => ({
            ...st,
            ticket: st.ticket === null ? null : normalizeTicket(st.ticket)
        }))
    })));
};

/**
 * Performs a document list request.
 */
export const listDocument = (params) => handleListPagination(params, (options) => {
    const opts = {
        cache: null,
        host: config.API_HOST,
        page: null,
        page_size: null,
        target: null,
        module: null,
        ...(options || {})
    };
    const url = `${opts.host}/v1/target/${opts.target}/status/${opts.module}/document/`;
    return HttpClient.get(url, {
        cache: opts.cache,
        params: {
            ...(opts.page !== null ? {page: opts.page} : {}),
            ...(opts.page_size !== null ? {page_size: opts.page_size} : {})
        }
    }).pipe(map((r) => r.data));
});

/**
 * Uploads a document linked to a module.
 */
export const uploadDocument = (options) => {
    const opts = {
        host: config.API_HOST,
        target: null,
        module: null,
        file: null,
        meta: {meta: {value: 'empty'}},
        ...(options || {})
    };
    const url = `${opts.host}/v1/target/${opts.target}/status/${opts.module}/document/upload/`;
    return HttpClient.postFile(url, opts.file, opts.meta).pipe(map((r) => r.data));
};

/**
 * Downloads a document linked to a module.
 */
export const downloadDocument = (options) => {
    const opts = {
        host: config.API_HOST,
        target: null,
        module: null,
        id: null,
        filename: null,
        ...(options || {})
    };
    return HttpClient.getBlob(
        `${opts.host}/v1/target/${opts.target}/status/${opts.module}/document/${opts.id}/`,
        {filename: opts.filename}
    );
};

/**
 * Deletes a document linked to a module.
 */
export const deleteDocument = (options) => {
    const opts = {
        host: config.API_HOST,
        target: null,
        module: null,
        id: null,
        ...(options || {})
    };
    return HttpClient.delete(
        `${opts.host}/v1/target/${opts.target}/status/${opts.module}/document/${opts.id}/`
    );
};


export function commentTicket(options) {
    const opts = {
        host: config.API_HOST,
        target: null,
        ticket_id: null,
        comment: '',
        comment_type: null,
        documents: [],
        ...(options || {})
    };
    const body = {
        content: opts.comment,
        comment_type: opts.comment_type
    };
    opts.documents.forEach((file, i) => {
        body[`file${i}`] = file;
    });
    const url = `${opts.host}/v1/target/${opts.target}/ticket/${opts.ticket_id}/comment/`;
    return HttpClient.postForm(url, body);
}


export function readTicketComments(options) {
    const opts = {
        host: config.API_HOST,
        target: null,
        ticket_id: null,
        ...(options || {})
    };
    return HttpClient.get(`${opts.host}/v1/target/${opts.target}/ticket/${opts.ticket_id}/comment/`);
}


export function uploadTicketCommentFile(options) {
    const opts = {
        host: config.API_HOST,
        file: null,
        ticket_id: null,
        comment_id: null,
        target: null,
        meta: {meta: {value: 'empty'}},
        ...(options || {})
    };
    return HttpClient.postFile(
        `${opts.host}/v1/target/${opts.target}/ticket/${opts.ticket_id}/comment/${opts.comment_id}/document/upload/`,
        opts.file,
        opts.meta
    ).pipe(map(r => r.data));
}


export function downloadTicketCommentFile(options) {
    const opts = {
        host: config.API_HOST,
        ticket_id: null,
        comment_id: null,
        target: null,
        id: null,
        filename: null,
        ...(options || {})
    };
    return HttpClient.getBlob(
        `${opts.host}/v1/target/${opts.target}/ticket/${opts.ticket_id}/comment/${opts.comment_id}/document/${opts.id}/download/`,
        {filename: opts.filename}
    );
}


export function addNewPublicAlertMessage(options) {
    const opts = {
        host: config.API_HOST,
        target: null,
        alert_type: null,
        scope: null,
        content: '',
        ...(options || {})
    };
    return HttpClient.post(`${opts.host}/v1/target/${opts.target}/publicmessage/`,
        {
            content: opts.content,
            alert_type: opts.alert_type,
            scope: opts.scope
        });
}


export function readPublicAlertMessages(options) {
    const opts = {
        cache: null,
        host: config.API_HOST,
        target: null,
        alert_type: null,
        scope: null,
        ...(options || {})
    };
    return HttpClient.get(`${opts.host}/v1/target/${opts.target}/publicmessage/`,
        {
            cache: opts.cache,
            params: {
                alert_type: opts.alert_type,
                scope: opts.scope
            }
        }).pipe(map(r => r.data.results));
}

export function readAuthorizationRequests(options) {
    const opts = {
        host: config.API_HOST,
        target: null,
        ticket_id: null,
        ...(options || {})
    };
    return HttpClient.get(`${opts.host}/v1/target/${opts.target}/ticket/${opts.ticket_id}/authorization/`);
}

export function readNationalAuthorizationRequests(options) {
    const opts = {
        host: config.API_HOST,
        ...(options || {})
    };
    return HttpClient.get(`${opts.host}/v1/ticket-requests/`);
}

export function readUserRequests(options) {
    const opts = {
        host: config.API_HOST,
        username: null,
        ...(options || {})
    };
    return HttpClient.get(`${opts.host}/v1/user/${opts.username}/ticket_authorization_request/`);
}

export function createAuthorizationRequest(options) {
    const opts = {
        host: config.API_HOST,
        target: null,
        ticket_id: null,
        to_state: null,
        ...(options || {})
    };
    return HttpClient.post(`${opts.host}/v1/target/${opts.target}/ticket/${opts.ticket_id}/authorization/`,
        {
            action: opts.action,
            to_state: opts.to_state
        });
}

export function resolveAuthorizationRequest(options) {
    const opts = {
        host: config.API_HOST,
        target: null,
        ticket_id: null,
        request_id: null,
        approved: false,
        comment: null,
        documents: [],
        ...(options || {})
    };
    const answerString = opts.approved ? 'approve' : 'deny';
    const body = {
        comment: opts.comment
    };
    opts.documents.forEach((file, i) => {
        body[`file${i}`] = file;
    });
    return HttpClient.postForm(
        `${opts.host}/v1/target/${opts.target}/ticket/${opts.ticket_id}/authorization/${opts.request_id}/${answerString}/`,
        body
    );
}

export function downloadTicketAuthorizationFile(options) {
    const opts = {
        host: config.API_HOST,
        ticket_id: null,
        request_id: null,
        target: null,
        id: null,
        filename: null,
        ...(options || {})
    };
    return HttpClient.getBlob(
        `${opts.host}/v1/target/${opts.target}/ticket/${opts.ticket_id}/authorization/${opts.request_id}/document/${opts.id}/download/`,
        {filename: opts.filename}
    );
}

/**
 * Injects useful properties into a disconnection alert object.
 */
const normalizeDisconnection = (d) => ({
    ...d,
    created_at: moment(d.created_at),
    closed_at: moment(d.closed_at)
});

export function readAlertDisconnections(options) {
    const opts = {
        host: config.API_HOST,
        target: null,
        ...(options || {})
    };
    return HttpClient.get(`${opts.host}/v1/target/${opts.target}/disconnection/`).pipe(map(r => r.data.results.map(normalizeDisconnection)));
}

export function addNewAlertDisconnection(options) {
    const opts = {
        host: config.API_HOST,
        target: null,
        scope: null,
        comment: '',
        ...(options || {})
    };
    return HttpClient.post(`${opts.host}/v1/target/${opts.target}/disconnection/`,
        {
            scope: opts.scope,
            comment: opts.comment
        });
}

export function connectAlertDisconnection(options) {
    const opts = {
        host: config.API_HOST,
        target: null,
        disconnection_id: null,
        comment: '',
        ...(options || {})
    };
    return HttpClient.post(`${opts.host}/v1/target/${opts.target}/disconnection/${opts.disconnection_id}/`,
        {
            closed: true,
            closed_at: Date.now()
        });
}

export function uploadAlertDisconnectionFile(options) {
    const opts = {
        host: config.API_HOST,
        target: null,
        disconnection_id: null,
        file: null,
        meta: null,
        ...(options || {})
    };
    return HttpClient.postFile(
        `${opts.host}/v1/target/${opts.target}/disconnection/${opts.disconnection_id}/document/upload/`,
        opts.file,
        opts.meta
    ).pipe(map(r => r.data));
}
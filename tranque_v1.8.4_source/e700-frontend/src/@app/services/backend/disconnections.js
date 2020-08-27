import * as moment from 'moment/moment';
import {map} from 'rxjs/operators';
import * as config from '@app/config';
import {HttpClient} from '@app/services/httpClient';
import {handleListPagination} from '@app/services/backend/pagination';


/**
 * Performs a read request to the ticket endpoint.
 */
export const read = (options) => {
    const opts = {
        cache: null,
        host: config.API_HOST,
        disconnectionId: null,
        ...(options || {})
    };
    const url = `${opts.host}/v1/target/${opts.target}/disconnection/${opts.disconnectionId}/`;
    return HttpClient.get(url, {
        cache: opts.cache,
        params: {}
    }).pipe(map((r) => r.data));
};

const singlePage = (options) => {
    const opts = {
        cache: null,
        host: config.API_HOST,
        page: null,
        page_size: null,
        target: null,
        ...(options || {})
    };
    const url = opts.target ?
        `${opts.host}/v1/target/${opts.target}/disconnection/` : // Target disconnections
        `${opts.host}/v1/disconnections/`; // All disconnections
    return HttpClient.get(url, {
        cache: opts.cache,
        params: {
            ...(opts.page !== null ? {page: opts.page} : {}),
            ...(opts.page_size !== null ? {page_size: opts.page_size} : {}),
        }
    }).pipe(map((r) => r.data));
};

/**
 * Perfoms a list request to the ticket endpoint.
 */
export const list = (params) => singlePage(params).pipe((r) => r.results);

/**
 * Performs a de-paginated list request to the ticket endpoint.
 */
export const listAll = (params) => handleListPagination(params, singlePage);

/**
 * Injects useful properties into a disconnection alert object.
 */
const normalizeDisconnection = (d) => ({
    ...d,
    created_at: moment(d.created_at),
    closed_at: d.closed ? moment(d.closed_at) : null
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
        disconnectionId: null,
        closed_at: null,
        ...(options || {})
    };
    return HttpClient.put(`${opts.host}/v1/target/${opts.target}/disconnection/${opts.disconnectionId}/`,
        {
            closed: true,
            closed_at: opts.closed_at
        });
}

export function uploadAlertDisconnectionFile(options) {
    const opts = {
        host: config.API_HOST,
        target: null,
        disconnectionId: null,
        file: null,
        meta: null,
        ...(options || {})
    };
    return HttpClient.postFile(
        `${opts.host}/v1/target/${opts.target}/disconnection/${opts.disconnectionId}/document/upload/`,
        opts.file,
        opts.meta
    ).pipe(map(r => r.data));
}

export function downloadAlertDisconnectionFile(options) {
    const opts = {
        host: config.API_HOST,
        target: null,
        disconnection_id: null,
        documentId: null,
        filename: null,
        ...(options || {})
    };
    return HttpClient.getBlob(
        `${opts.host}/v1/target/${opts.target}/disconnection/${opts.disconnection_id}/document/${opts.documentId}/download/`,
        {filename: opts.filename}
    );
}

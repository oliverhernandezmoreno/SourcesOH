import * as moment from 'moment/moment';
import {map} from 'rxjs/operators';
import * as config from '@app/config';
import {HttpClient} from '@app/services/httpClient';
import {handleListPagination} from '@app/services/backend/pagination';


/**
 * Performs a read request to the manual alert log endpoint.
 */
export const read = (options) => {
    const opts = {
        cache: null,
        host: config.API_HOST,
        target: null,
        ticketId: null,
        manualAlertLogId: null,
        ...(options || {})
    };
    const url = `${opts.host}/v1/target/${opts.target}/ticket/${opts.ticketId}/manual/${opts.manualAlertLogId}`;
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
        ticketId: null,
        ...(options || {})
    };
    const url = `${opts.host}/v1/target/${opts.target}/ticket/${opts.ticketId}/manual/`;
    return HttpClient.get(url, {
        cache: opts.cache,
        params: {
            ...(opts.page !== null ? {page: opts.page} : {}),
            ...(opts.page_size !== null ? {page_size: opts.page_size} : {}),
        }
    }).pipe(map((r) => r.data));
};

/**
 * Perfoms a list request to the manual alert log endpoint.
 */
export const list = (params) => singlePage(params).pipe((r) => r.results);

/**
 * Performs a de-paginated list request to the manual alert log endpoint.
 */
export const listAll = (params) => handleListPagination(params, singlePage);

/**
 * Injects useful properties into a manual alert log object.
 */
const normalizeManualAlertLog = (mal) => ({
    ...mal,
    created_at: moment(mal.created_at)
});

export function readManualAlertLogs(options) {
    const opts = {
        host: config.API_HOST,
        target: null,
        ticketId: null,
        ...(options || {})
    };
    return HttpClient.get(`${opts.host}/v1/target/${opts.target}/ticket/${opts.ticketId}/manual/`).pipe(map(r => r.data.results.map(normalizeManualAlertLog)));
}

export function addNewManualAlertLog(options) {
    const opts = {
        host: config.API_HOST,
        target: null,
        ticketId: null,
        scope: null,
        comment: '',
        ...(options || {})
    };
    return HttpClient.post(`${opts.host}/v1/target/${opts.target}/ticket/${opts.ticketId}/manual/`,
        {
            scope: opts.scope,
            comment: opts.comment
        });
}

export function uploadManualAlertLogFile(options) {
    const opts = {
        host: config.API_HOST,
        target: null,
        ticketId: null,
        manualAlertLogId: null,
        file: null,
        meta: null,
        ...(options || {})
    };
    return HttpClient.postFile(
        `${opts.host}/v1/target/${opts.target}/ticket/${opts.ticketId}/manual/${opts.manualAlertLogId}/document/upload/`,
        opts.file,
        opts.meta
    ).pipe(map(r => r.data));
}

export function downloadManualAlertLogFile(options) {
    const opts = {
        host: config.API_HOST,
        target: null,
        ticketId: null,
        manualAlertLogId: null,
        documentId: null,
        filename: null,
        ...(options || {})
    };
    return HttpClient.getBlob(
        `${opts.host}/v1/target/${opts.target}/ticket/${opts.ticketId}/manual/${opts.manualAlertLogId}/document/${opts.documentId}/download/`,
        {filename: opts.filename}
    );
}

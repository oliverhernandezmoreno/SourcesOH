import {of} from 'rxjs';
import {mergeMap} from 'rxjs/operators';
import * as config from '@app/config';
import {HttpClient} from '@app/services/httpClient';

/**
 * Performs a list request to the operations endpoint.
 */
export const list = (options) => {
    const opts = {
        cache: null,
        host: config.API_HOST,
        target: null,
        page: null,
        pageSize: null,
        ...(options || {})
    };
    const url = `${opts.host}/v1/target/${opts.target}/parameter/`;
    return HttpClient.get(url, {
        cache: opts.cache,
        params: {
            ...(opts.page !== null ? {page: opts.page} : {}),
            ...(opts.pageSize !== null ? {page_size: opts.pageSize} : {}),
        }
    }).pipe(mergeMap((r) => of(r.data)));
};

/**
 * Performs a read request to the operations endpoint.
 */
export const read = (options) => {
    const opts = {
        cache: null,
        host: config.API_HOST,
        target: null,
        id: null,
        ...(options || {})
    };
    const url = `${opts.host}/v1/target/${opts.target}/parameter/${opts.id}/`;
    return HttpClient.get(url, {
        cache: opts.cache
    }).pipe(mergeMap((r) => of(r.data)));
};

/**
 * Performs a historical request to the operations endpoint.
 */
export const history = (options) => {
    const opts = {
        cache: null,
        host: config.API_HOST,
        target: null,
        id: null,
        ...(options || {})
    };
    const url = `${opts.host}/v1/target/${opts.target}/parameter/${opts.id}/history`;
    return HttpClient.get(url, {
        cache: opts.cache
    }).pipe(mergeMap((r) => of(r.data)));
};

/**
 * Updates a parameter value.
 */
export const partialUpdate = (options) => {
    const opts = {
        cache: null,
        host: config.API_HOST,
        target: null,
        id: null,
        ...(options || {})
    };
    const url = `${opts.host}/v1/target/${opts.target}/parameter/${opts.id}/`;
    return HttpClient.patch(url, {
        value: opts.value
    }).pipe(mergeMap((r) => of(r.data)));
};

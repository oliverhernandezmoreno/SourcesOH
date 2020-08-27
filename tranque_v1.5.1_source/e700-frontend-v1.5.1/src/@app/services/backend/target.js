import {map} from 'rxjs/operators';
import * as config from '@app/config';
import {HttpClient} from '@app/services/httpClient';
import moment from 'moment';
import {handleListPagination} from '@app/services/backend/pagination';

const normalizeTarget = (t) => ({
    ...t,
    remote: t.remote !== null ? {
        ...t.remote,
        lastSeen: moment(t.remote.last_seen)
    } : null
});

/**
 * Performs a list request to the target endpoint.
 */
export const list = (options) => {
    const opts = {
        cache: null,
        host: config.API_HOST,
        page: null,
        page_size: null,
        zone: null,
        type: null,
        state: null,
        zone_nk: null,
        with_remote: null,
        ...(options || {})
    };
    return HttpClient.get(`${opts.host}/v1/target/`, {
        cache: opts.cache,
        params: {
            ...(opts.page !== null ? {page: opts.page} : {}),
            ...(opts.page_size !== null ? {page_size: opts.page_size} : {}),
            ...(opts.zone !== null ? {zone: opts.zone} : {}),
            ...(opts.type !== null ? {type: opts.type} : {}),
            ...(opts.state !== null ? {state: opts.state} : {}),
            ...(opts.zone_nk !== null ? {zone_nk: opts.zone_nk} : {}),
            ...(opts.with_remote !== null ? {with_remote: opts.with_remote} : {})
        }
    }).pipe(map((r) => ({...r.data, results: r.data.results.map(normalizeTarget)})));
};

/**
 * Performs a get request to the target endpoint.
 */
export const get = (options) => {
    const opts = {
        cache: null,
        host: config.API_HOST,
        canonical_name: null,
        ...(options || {})
    };
    return HttpClient.get(`${opts.host}/v1/target/${opts.canonical_name}/`, {
        cache: opts.cache
    }).pipe(map(r => normalizeTarget(r.data)));
};

/**
 * Performs a depaginated list request to the target endpoint.
 */
export const listAll = options => handleListPagination({page_size: 100, ...options}, list);

/**
 * Performs a depaginated list request to the public target endpoint.
 */
export const listAllPublic = options => handleListPagination({
    page_size: 100,
    ...options
}, (wrappedOptions) => {
    const opts = {
        cache: null,
        host: config.API_HOST,
        page: null,
        page_size: null,
        zone: null,
        type: null,
        state: null,
        zone_nk: null,
        ...(wrappedOptions || {})
    };
    return HttpClient.get(`${opts.host}/public/target/`, {
        cache: opts.cache,
        params: {
            ...(opts.page !== null ? {page: opts.page} : {}),
            ...(opts.page_size !== null ? {page_size: opts.page_size} : {}),
            ...(opts.zone !== null ? {zone: opts.zone} : {}),
            ...(opts.type !== null ? {type: opts.type} : {}),
            ...(opts.state !== null ? {state: opts.state} : {}),
            ...(opts.zone_nk !== null ? {zone_nk: opts.zone_nk} : {}),
        }
    }).pipe(map((r) => r.data));
});

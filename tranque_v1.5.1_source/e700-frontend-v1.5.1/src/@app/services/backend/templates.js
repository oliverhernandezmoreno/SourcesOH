import {map} from 'rxjs/operators';
import * as config from '@app/config';
import {HttpClient} from '@app/services/httpClient';
import {handleListPagination} from '@app/services/backend/pagination';

/**
 * Performs a list request to the templates endpoint.
 */
export const list = (params) => handleListPagination(params, (options) => {
    const opts = {
    // provide a default cache value, since templates rarely change
        cache: 1000 * 60 * 10,
        host: config.API_HOST,
        page: null,
        page_size: null,
        category: null,
        ...(options || {}),
    };
    const url = `${opts.host}/v1/template/`;
    return HttpClient.get(url, {
        cache: opts.cache,
        params: {
            ...(opts.page !== null ? {page: opts.page} : {}),
            ...(opts.page_size !== null ? {page_size: opts.page_size} : {}),
            ...(opts.category !== null ? {category: opts.category} : {}),
        }
    }).pipe(map((r) => r.data));
});

/**
 * Performs a read request to the templates endpoint.
 */
export const read = (options) => {
    const opts = {
    // provide a default cache value, since templates rarely change
        cache: 1000 * 60 * 10,
        host: config.API_HOST,
        canonical_name: null,
        ...(options || {})
    };
    const url = `${opts.host}/v1/template/${opts.canonical_name}/`;
    return HttpClient.get(url, {
        cache: opts.cache,
    }).pipe(map((r) => r.data));
};

export default {
    list,
    read
};

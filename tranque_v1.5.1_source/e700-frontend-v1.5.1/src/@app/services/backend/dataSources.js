import {handleListPagination} from '@app/services/backend/pagination';
import {map} from 'rxjs/operators';
import * as config from '@app/config';
import {HttpClient} from '@app/services/httpClient';

/**
 * Performs a list request to the dataSource endpoint.
 */
export const list = (options) => {
    const opts = {
        cache: null,
        host: config.API_HOST,
        target: null,
        group: null,
        ...(options || {})
    };
    const url = `${opts.host}/v1/target/${opts.target}/datasource/`;
    return HttpClient.get(url, {
        cache: opts.cache,
        params: {
            ...(opts.group !== null ? {group: opts.group} : {}),
            ...(opts.page !== null ? {page: opts.page} : {}),
            ...(opts.page_size !== null ? {page_size: opts.page_size} : {}),
        },
    }).pipe(map(r => r.data));
};

/**
 * Performs a depaginated list request to the target endpoint.
 */
export const listAll = options => handleListPagination({page_size: 100,...options}, list);


export default {
    list
};

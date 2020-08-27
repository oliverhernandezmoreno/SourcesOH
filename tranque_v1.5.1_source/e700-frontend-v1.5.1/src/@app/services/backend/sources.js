import {map} from 'rxjs/operators';
import * as config from '@app/config';
import {HttpClient} from '@app/services/httpClient';

/**
 * Performs a list request to the dataSourceGroup endpoint.
 */
export const list = (options) => {
    const opts = {
        cache: null,
        host: config.API_HOST,
        target: null,
        dataSourceGroup: null,
        ...(options || {})
    };
    const url = `${opts.host}/v1/target/${opts.target}/datasourcegroup/${opts.dataSourceGroup}/`;
    return HttpClient.get(url, {
        cache: opts.cache
    }).pipe(map((r) => r.data.data_sources));
};

export default {
    list
};

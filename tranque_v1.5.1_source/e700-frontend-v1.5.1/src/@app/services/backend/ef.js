import { mergeMap} from 'rxjs/operators';
import * as config from '@app/config';
import {HttpClient} from '@app/services/httpClient';
import { of } from 'rxjs';

/**
 * Performs a read request to the operations endpoint.
 */
export const read = (options) => {
    const opts = {
        cache: null,
        host: config.API_HOST,
        target: null,
        operation: null,
        date_to: null,
        ...(options || {})
    };
    const url = `${opts.host}/v1/target/${opts.target}/ef/topography-profile/${options.id}/`;
    return HttpClient.get(url, {
        cache: opts.cache,
        params: {
            ...(opts.date_to !== null ? {date_to: opts.date_to} : {}),
        }
    }).pipe(mergeMap((r) => of(r.data)));
};


// http://localhost/api/v1/target/el-mauro/ef/topography-profile/mCq8etdxU9eXdpFZEJPxgQ/?date_to=2020-04-24&format=json

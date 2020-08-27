import {map} from 'rxjs/operators';
import * as config from '@app/config';
import {HttpClient} from '@app/services/httpClient';
import {NONE, NOT_CONFIGURED, WITHOUT_ALERT, YELLOW_ALERT} from '@authorities/constants/indexState';

export function getIndexStatus({result_state: {level}}) {
    if (level === 0) return NOT_CONFIGURED;
    if (level < 3) return WITHOUT_ALERT;
    if (level >= 3) return YELLOW_ALERT;
    return NONE;
}

export function listStatus(params) {
    const opts = {
        cache: null,
        host: config.API_HOST,
        target: null,
        group: null,
        ...(params || {}),
    };
    const url = `${opts.host}/public/target/${opts.target}/status/`;
    return HttpClient.get(url, {
        cache: opts.cache,
        params: {
            ...(opts.group !== null ? {
                group: Array.isArray(opts.group) ?
                    opts.group.join(",") : opts.group
            } : {})
        }
    }).pipe(map(r => r.data));
}

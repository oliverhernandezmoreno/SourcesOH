import {map} from 'rxjs/operators';
import * as config from '@app/config';
import {HttpClient} from '@app/services/httpClient';

/**
 * Performs a get request to the site parameter endpoint.
 */
export function get(options) {
    const opts = {
        cache: null,
        host: config.API_HOST,
        ...(options || {})
    };
    const url = `${opts.host}/public/site-parameter/`;
    return HttpClient.get(url, {cache: opts.cache}).pipe(map(r => r.data));
}

export function getMapParameters(options) {
    return get(options).pipe(
        map(
            data => ({
                mapLayerUrl: data.MAP_LAYER,
                mapAttribution: data.MAP_ATTRIBUTION,
                satelliteLayerUrl: data.MAP_SATELLITE_LAYER,
                satelliteAttribution: data.MAP_SATELLITE_ATTRIBUTION
            })
        )
    );
}

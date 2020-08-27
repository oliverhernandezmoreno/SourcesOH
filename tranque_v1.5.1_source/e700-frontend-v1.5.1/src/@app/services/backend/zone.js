import {map} from 'rxjs/operators';
import * as config from '@app/config';
import {HttpClient} from '@app/services/httpClient';
import {handleListPagination} from '@app/services/backend/pagination';
import {getZoneSortNumber} from '@app/services/sorting';

/**
 * Performs a list request to the zone endpoint.
 */
export const list = (options) => {
    const opts = {
        cache: null,
        host: config.API_HOST,
        page: null,
        page_size: null,
        parent: null,
        type: null,
        ...(options || {})
    };
    return HttpClient.get(`${opts.host}/v1/zone/`, {
        cache: opts.cache,
        params: {
            ...(opts.page !== null ? {page: opts.page} : {}),
            ...(opts.page_size !== null ? {page_size: opts.page_size} : {}),
            ...(opts.parent !== null ? {parent: opts.parent} : {}),
            ...(opts.type !== null ? {type: opts.type} : {})
        }
    }).pipe(map(r => r.data));
};

/**
 * Performs a list request to the zone endpoint.
 */
export const listAll = options => handleListPagination({
    page_size: 500,
    cache: config.DEFAULT_CACHE_TIME,
    ...options
}, list);

/**
 * Performs a list de-paginated list request to the zone endpoint.
 */
export const listAllPublic = (options) => handleListPagination({
    page_size: 500,
    cache: config.DEFAULT_CACHE_TIME,
    ...options
}, (wrappedOptions) => {
    const opts = {
        cache: null,
        host: config.API_HOST,
        page: null,
        page_size: null,
        parent: null,
        type: null,
        ...(wrappedOptions || {})
    };
    return HttpClient.get(`${opts.host}/public/zone/`, {
        cache: opts.cache,
        params: {
            ...(opts.page !== null ? {page: opts.page} : {}),
            ...(opts.page_size !== null ? {page_size: opts.page_size} : {}),
            ...(opts.parent !== null ? {parent: opts.parent} : {}),
            ...(opts.type !== null ? {type: opts.type} : {})
        }
    }).pipe(map(r => r.data));
});

/**
 * Function triggered to organize zone info.
 *
 * @param {zone} the zone info from ZoneService.
 * @public
 */
export function parseZoneOptions(zones) {
    // get communes
    let communes = zones.filter(zone => zone.type === 'comuna').map(c => ({
        label: c.name,
        natural_name: c.natural_name,
        value: c
    })).slice().sort(getZoneSortNumber);

    // get provinces and add communes
    const provinces = zones.filter(zone => zone.type === 'provincia').map(p => {
        const name = p.natural_name + '.';
        return {
            label: p.name,
            natural_name: p.natural_name,
            value: p,
            communes: communes.filter(c => c.natural_name.startsWith(name))
        };
    }).slice().sort(getZoneSortNumber);

    // get regions and add provinces
    return zones.filter(zone => zone.type === 'region').map(r => {
        const name = r.natural_name + '.';
        return {
            label: r.name,
            natural_name: r.natural_name,
            value: r,
            provinces: provinces.filter(p => p.natural_name.startsWith(name)),
            regionCommunes: communes.filter(c => c.natural_name.startsWith(name))
        };
    });
}

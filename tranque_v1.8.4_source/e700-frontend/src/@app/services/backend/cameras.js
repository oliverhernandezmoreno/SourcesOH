// import * as moment from 'moment/moment';
import {map} from 'rxjs/operators';
import * as config from '@app/config';
import {HttpClient} from '@app/services/httpClient';
import {handleListPagination} from '@app/services/backend/pagination';


/**
 * Performs a read request to the camera endpoint.
 */
export const read = (options) => {
    const opts = {
        cache: null,
        host: config.API_HOST,
        target: null,
        cameraId: null,
        ...(options || {})
    };
    return HttpClient.get(`${opts.host}/v1/target/${opts.target}/camera/${opts.cameraId}/`, {
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
        ...(options || {})
    };
    return HttpClient.get(`${opts.host}/v1/target/${opts.target}/camera/`, {
        cache: opts.cache,
        params: {
            ...(opts.page !== null ? {page: opts.page} : {}),
            ...(opts.page_size !== null ? {page_size: opts.page_size} : {}),
        }
    }).pipe(map((r) => r.data));
};

/**
 * Perfoms a list request to the ticket endpoint.
 */
export const list = (params) => singlePage(params).pipe((r) => r.results);

/**
 * Performs a de-paginated list request to the ticket endpoint.
 */
export const listAll = (params) => handleListPagination(params, singlePage);

/**
 * Performs a request to obtain the blob of the video frame endpoint
 */
export function downloadVideoFrame(options) {
    const opts = {
        host: config.API_HOST,
        target: null,
        cameraId: null,
        frameId: null,
        getBlobUrl: false,
        ...(options || {})
    };
    return HttpClient.getBlob(
        `${opts.host}/v1/target/${opts.target}/camera/${opts.cameraId}/frame/${opts.frameId}/download/`,
        {
            filename: opts.filename,
            getBlobUrl: opts.getBlobUrl
        }
    ).pipe(map(r => r.data));
}

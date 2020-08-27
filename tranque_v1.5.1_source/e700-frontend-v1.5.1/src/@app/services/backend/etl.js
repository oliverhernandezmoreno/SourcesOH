import * as moment from 'moment/moment';
import {of} from 'rxjs';
import {mergeMap} from 'rxjs/operators';
import * as config from '@app/config';
import {HttpClient} from '@app/services/httpClient';
import {formatDecimal} from '@app/services/formatters';

/**
 * Performs a list request to the operations endpoint.
 */
export const list = (options) => {
    const opts = {
        cache: null,
        host: config.API_HOST,
        target: null,
        executor: null,
        user: null,
        page: null,
        pageSize: null,
        ...(options || {})
    };
    const url = `${opts.host}/v1/target/${opts.target}/etl-operation/`;
    return HttpClient.get(url, {
        cache: opts.cache,
        params: {
            ...(opts.page !== null ? {page: opts.page} : {}),
            ...(opts.pageSize !== null ? {page_size: opts.pageSize} : {}),
            ...(opts.executor !== null ?
                {
                    executor: (
                        Array.isArray(opts.executor) ?
                            opts.executor.join(',') :
                            opts.executor
                    )
                } : {}),
            ...(opts.user !== null ?
                {user: opts.user} : {})
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
        operation: null,
        ...(options || {})
    };
    const url = `${opts.host}/v1/target/${opts.target}/etl-operation/${opts.operation}/`;
    return HttpClient.get(url, {
        cache: opts.cache
    }).pipe(mergeMap((r) => of(r.data)));
};

/**
 * Creates a new operation.
 */
export const create = (options) => {
    const opts = {
        host: config.API_HOST,
        target: null,
        executor: null,
        dataFileId: null,
        ...(options || {}),
        context: {
            ...((options || {}).context || {}),
            timezoneOffset: (new Date()).getTimezoneOffset(),
        }
    };
    const url = `${opts.host}/v1/target/${opts.target}/etl-operation/`;
    return HttpClient.post(url, {
        executor: opts.executor,
        data_file_id: opts.dataFileId,
        context: opts.context
    }).pipe(mergeMap((r) => of(r.data)));
};

/**
 * Delivers an operation.
 */
export const deliver = (options) => {
    const opts = {
        host: config.API_HOST,
        target: null,
        operation: null,
        ...(options || {})
    };
    const url = `${opts.host}/v1/target/${opts.target}/etl-operation/${opts.operation}/deliver/`;
    return HttpClient.post(url, {}).pipe(mergeMap((r) => of(r.data)));
};

/**
 * Creates a new operation.
 */
export const createImmediately = (options) => {
    const opts = {
        host: config.API_HOST,
        target: null,
        executor: null,
        dataFileId: null,
        ...(options || {}),
        context: {
            ...((options || {}).context || {}),
            timezoneOffset: (new Date()).getTimezoneOffset(),
        }
    };
    const url = `${opts.host}/v1/target/${opts.target}/etl-operation/deliver/`;
    return HttpClient.post(url, {
        executor: opts.executor,
        data_file_id: opts.dataFileId,
        context: opts.context
    }).pipe(mergeMap((r) => of(r.data)));
};

/**
 * Performs a data request to the operations endpoint.
 */
export const data = (options) => {
    const opts = {
        cache: null,
        host: config.API_HOST,
        target: null,
        operation: null,
        ...(options || {})
    };
    const url = `${opts.host}/v1/target/${opts.target}/etl-operation/${opts.operation}/data/`;
    return HttpClient.get(url, {
        cache: opts.cache
    }).pipe(mergeMap((r) => of(r.data)));
};

/**
 * Injects the event object with extra useful properties.
 */
const normalizeEvent = (ts) => (e) => ({
    ...e,
    date: moment(e['@timestamp']),
    roundedValue: Math.round(e.value * 1000) / 1000,
    formattedValue: (typeof ts.choices === "undefined" || ts.choices === null) ?
        formatDecimal(e.value, 3) :
        (
            ts.choices.find(
                (choice) => (typeof choice.value.gt === "undefined" || e.value > choice.value.gt) &&
          (typeof choice.value.lt === "undefined" || e.value < choice.value.lt) &&
          (typeof choice.value.gte === "undefined" || e.value >= choice.value.gte) &&
          (typeof choice.value.lte === "undefined" || e.value <= choice.value.lte)
            ) || {choice: formatDecimal(e.value, 3)}
        ).choice
});

/**
 * Fetches the explanation for an operation.
 */
export const explain = (options) => {
    const opts = {
        cache: null,
        host: config.API_HOST,
        target: null,
        operation: null,
        ...(options || {})
    };
    const url = `${opts.host}/v1/target/${opts.target}/etl-operation/${opts.operation}/explain/`;
    return HttpClient.get(url, {
        cache: opts.cache
    }).pipe(mergeMap((r) => of(r.data.plan.map((tss) => tss.map((ts) => ({
        ...ts,
        events: r.data.facts
            .filter(({name}) => name === ts.canonical_name)
            .map(normalizeEvent(ts))
            .sort((e1, e2) => e1.date.diff(e2.date) >= 0 ? 1 : -1)
    })).sort((ts1, ts2) => ts1.name.localeCompare(ts2.name))))));
};

/**
 * Downloads a data file from the backend.
 */
export const downloadDataFile = (options) => {
    const opts = {
        host: config.API_HOST,
        dataFileId: null,
        filename: null,
        ...(options || {})
    };
    const url = `${opts.host}/v1/data-file/${opts.dataFileId}/download/`;
    return HttpClient.getBlob(url, {filename: opts.filename}).subscribe();
};

/**
 * Uploads a file as a data-file to the backend.
 */
export const uploadDataFile = (options) => {
    const opts = {
        host: config.API_HOST,
        file: null,
        ...(options || {})
    };
    const url = `${opts.host}/v1/data-file/upload-multipart/`;
    return HttpClient.postFile(url, options.file).pipe(mergeMap((r) => of(r.data)));
};

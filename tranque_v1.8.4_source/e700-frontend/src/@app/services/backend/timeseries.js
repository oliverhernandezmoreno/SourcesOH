import * as moment from 'moment/moment';
import {catchError, map, mergeMap} from 'rxjs/operators';
import * as config from '@app/config';
import {HttpClient} from '@app/services/httpClient';
import {forkJoin, of, throwError} from 'rxjs';
import {handleListPagination} from '@app/services/backend/pagination';

/**
 * Injects the event object with extra useful properties.
 */
const normalizeEvent = (e) => ({
    ...e,
    date: moment(e['@timestamp']),
    roundedValue: Math.round(e.value * 1000) / 1000
});

/**
 * Injects the time series object with extra useful properties.
 */
const normalizeTimeseries = (ts) => {
    return {
        ...ts,
        events: (ts.events || []).map(normalizeEvent)
    };
};

function baseUrl(opts) {
    if (opts.target !== null && opts.target !== undefined) {
        return `${opts.host}/v1/target/${opts.target}/timeseries/`;
    } else {
        return `${opts.host}/v1/timeseries/`;
    }
}

/**
 * Performs a list request to the timeseries endpoint.
 */
export function list(params) {
    return handleListPagination(params, (options) => {
        const opts = {
            cache: null,
            host: config.API_HOST,
            page: null,
            page_size: null,
            target: null,
            template_name: null,
            template_category: null,
            type: null,
            data_source__in: null,
            canonical_name__in: null,
            max_events: null,
            ...(options || {})
        };
        const url = baseUrl(opts);
        return HttpClient.get(url, {
            cache: opts.cache,
            params: {
                ...(opts.page !== null ? {page: opts.page} : {}),
                ...(opts.page_size !== null ? {page_size: opts.page_size} : {}),
                ...(opts.template_name !== null ? {template_name: opts.template_name} : {}),
                ...(opts.template_category !== null ? {template_category: opts.template_category} : {}),
                ...(opts.type !== null ? {type: opts.type} : {}),
                ...(opts.data_source__in !== null ? {data_source__in: opts.data_source__in} : {}),
                ...(opts.canonical_name__in !== null? {canonical_name__in: opts.canonical_name__in} : {}),
                ...(opts.max_events !== null ? {max_events: opts.max_events} : {}),
            }
        }).pipe(map(r => r.data));
    }).pipe(map((r) => r.map(normalizeTimeseries)));
}
export const list_ = (options) => {
    const opts = {
        cache: null,
        host: config.API_HOST,
        page: null,
        page_size: null,
        target: null,
        template_name: null,
        template_category: null,
        type: null,
        data_source__in: null,
        max_events: null,
        ...(options || {})
    };
    const url = baseUrl(opts);
    return HttpClient.get(url, {
        cache: opts.cache,
        params: {
            ...(opts.page !== null ? {page: opts.page} : {}),
            ...(opts.page_size !== null ? {page_size: opts.page_size} : {}),
            ...(opts.template_name !== null ? {template_name: opts.template_name} : {}),
            ...(opts.template_category !== null ? {template_category: opts.template_category} : {}),
            ...(opts.type !== null ? {type: opts.type} : {}),
            ...(opts.data_source__in !== null ? {data_source__in: opts.data_source__in} : {}),
            ...(opts.max_events !== null ? {max_events: opts.max_events} : {})
        }
    }).pipe(map(r => r.data));
};

export const listAll = options => handleListPagination({
    page_size: 500,
    cache: config.DEFAULT_CACHE_TIME,
    ...options
}, list_).pipe(map((r) => r.map(normalizeTimeseries)));

/**
 * Performs a read request to the timeseries endpoint.
 */
export const read = (options) => {
    const opts = {
        cache: null,
        host: config.API_HOST,
        target: null,
        timeseries: null,
        max_events: null,
        ...(options || {})
    };
    const url = `${baseUrl(opts)}${opts.timeseries}/`;
    return HttpClient.get(url, {
        cache: opts.cache,
        params: {
            ...(opts.max_events !== null ? {max_events: opts.max_events} : {})
        }
    }).pipe(map((r) => normalizeTimeseries(r.data)));
};

/**
 * Performs an export request for a set of timeseries to a file with
 * xlsx extension.
 */
export const exportMany = (options) => {
    const opts = {
        host: config.API_HOST,
        target: null,
        canonical_names: null,
        filename: null,
        dateFrom: null,
        dateTo: null,
        head: false,
        ...(options || {})
    };
    const url = `${baseUrl(opts)}export/`;
    const filename = opts.filename === null || opts.filename === undefined
        ? 'datos.xlsx'
        : (opts.filename.endsWith('.xlsx') ? opts.filename : `${opts.filename}.xlsx`);
    return HttpClient.getBlob(url, {
        filename,
        params: {
            filename,
            canonical_name__in: Array.isArray(opts.canonical_names)
                ? opts.canonical_names.join(',')
                : opts.canonical_names,
            ...(opts.dateFrom === null || opts.dateFrom === undefined ? {} : {date_from: JSON.parse(JSON.stringify(opts.dateFrom))}),
            ...(opts.dateTo === null || opts.dateTo === undefined ? {} : {date_to: JSON.parse(JSON.stringify(opts.dateTo))}),
            ...(opts.head ? {head: '1'} : {})
        }
    });
};

/**
 * Performs an aggregation request for a single timeseries. Results
 * are returned as a nested list of consecutive valid values, in {x,y}
 * objects.
 */
export const aggregation = (options) => {
    const opts = {
        cache: null,
        host: config.API_HOST,
        target: null,
        timeseries: null,
        aggregation_type: null,
        interval: null,
        date_to: null,
        date_from: null,
        timezone_offset: (new Date()).getTimezoneOffset(),
        /** Whether to segment the results into multiple lists, when
         * null values are found. Defaults to true.
         */
        segment: true,
        ...(options || {})
    };
    const url = `${baseUrl(opts)}${opts.timeseries}/aggregation/`;
    return HttpClient.get(url, {
        cache: opts.cache,
        params: {
            ...(opts.aggregation_type !== null ? {aggregation_type: opts.aggregation_type} : {}),
            ...(opts.interval !== null ? {interval: opts.interval} : {}),
            ...(opts.date_to !== null ? {date_to: opts.date_to} : {}),
            ...(opts.date_from !== null ? {date_from: opts.date_from} : {}),
            ...(opts.timezone_offset !== null ? {timezone_offset: opts.timezone_offset} : {})
        }
    }).pipe(map((response) => {
        const nullEvent = (e) => e.value === undefined || e.value === null;
        const parseEvent = (e) => ({x: moment(e['@timestamp']), y: e.value});
        let result;
        if(opts.segment){
            result = response.data.results
                .reduce(
                    (groups, event) => nullEvent(event) ?
                        [...groups, []] :
                        [...groups.slice(0, -1), [
                            ...(groups.length > 0 ? groups[groups.length - 1] : []),
                            parseEvent(event)
                        ]],
                    []
                )
                .filter((g) => g.length > 0);
        } else {
            result = [response.data.results.map(event => parseEvent(event))];
        }
        return result;
    }));
};


/**
 * Performs an head request for a single timeseries. Results
 * are returned as a nested list of consecutive valid values, in {x,y}
 * objects.
 */
export const head = (options) => {
    const opts = {
        cache: null,
        host: config.API_HOST,
        target: null,
        timeseries: null,
        date_to: null,
        timezone_offset: (new Date()).getTimezoneOffset(),
        ...(options || {})
    };
    const url = `${baseUrl(opts)}${opts.timeseries}/head/`;
    return HttpClient.get(url, {
        cache: opts.cache,
        params: {
            ...(opts.date_to !== null ? {date_to: opts.date_to} : {}),
            ...(opts.timezone_offset !== null ? {timezone_offset: opts.timezone_offset} : {})
        }
    }).pipe(map((response) => {
        const parseEvent = (e) => ({x: e?.coords?.x, y: e?.value});
        const result = response.data.results.map(e => {
            return [parseEvent(e)];
        })
        return result;
    }));
};

export const headRaw = (options) => {
    const opts = {
        cache: null,
        host: config.API_HOST,
        target: null,
        timeseries: null,
        date_to: null,
        timezone_offset: (new Date()).getTimezoneOffset(),
        ...(options || {})
    };
    const url = `${baseUrl(opts)}${opts.timeseries}/head/`;
    return HttpClient.get(url, {
        cache: opts.cache,
        params: {
            ...(opts.date_to !== null ? {date_to: opts.date_to} : {}),
            ...(opts.timezone_offset !== null ? {timezone_offset: opts.timezone_offset} : {})
        }
    });
};

export function getVariableFromTemplateName(template_canonical_name) {
    return template_canonical_name.split('emac-mvp.').pop();
}

function predictionTimeseries(target, variable, source) {
    return `${target}.s-${source}.emac-mvp.adt.arima.${variable}`;
}

/**
 * Performs a prediction request for a single timeseries. Results
 * are returned as an object with two list of consecutive valid values
 * {predictions:[{x,y}...], confidence60: [{x, y, y0}, confidence95: [{x, y, y0}]]}.
 */
export const prediction = (options) => {
    const opts = {
        cache: null,
        host: config.API_HOST,
        target: null,
        timeseries: null,
        source: null,
        variable: null,
        ...(options || {})
    };
    const timeseries = opts.timeseries ?
        opts.timeseries :
        predictionTimeseries(opts.target, opts.variable, opts.source);
    const url = `${baseUrl(opts)}${timeseries}/`;
    return HttpClient.get(url, {
        cache: opts.cache,
        params: {max_events: 1}
    }).pipe(map((response) => {
        const ret = {confidence60: [], confidence95: [], predictions: []};
        if (response.data.events.length > 0) {
            const e = response.data.events[0];
            const predictions = (e.meta || {}).predictions || [];
            // @timestamp is the time of calculation when new data arrives => the prediction starts one month after calculation date.
            const eventX = moment(e['@timestamp']);
            predictions.forEach((p, index) => {
                const x = moment(eventX).add(index, 'months');
                ret.predictions.push({x, y: p.value});
                ret.confidence60.push({x, y: p.upper60, y0: p.lower60});
                ret.confidence95.push({x, y: p.upper95, y0: p.lower95});
            });
        }
        return ret;
    }), catchError(err => {
        if (err.status === 404) {
            return of({confidence60: [], confidence95: [], predictions: []});
        } else {
            return throwError(err);
        }
    }));
};

export function parseChartThresholds(threshold, getLabel) {
    const ret = [];
    if (threshold !== undefined) {
        if (threshold.upper) {
            const label = `Valor de referencia ${getLabel ? getLabel(threshold.kind) : threshold.kind} [${+threshold.upper}]`;
            ret.push({
                label,
                value: +threshold.upper
            });
        }
        if (threshold.lower) {
            const label = `Valor de referencia ${getLabel ? getLabel(threshold.kind) : threshold.kind} [${+threshold.lower}]`;
            ret.push({
                label,
                value: +threshold.lower
            });
        }
    }
    return ret;
}

/**
 * Given a timeseries object performs an aggregation and two prediction request
 * returns a shallow copy of the timeseries object extended with an "_extra" field containing the aggregation and prediction data
 * {...timeseries, _extra:{aggregation, prediction}}
 */
export function aggregationAndPredictionsForTimeseries(options) {
    const opts = {
        cache: null,
        host: config.API_HOST,
        target: null,
        timeseries: null,
        aggregation_type: null,
        interval: null,
        date_to: null,
        date_from: null,
        color: null,
        color_60: null,
        color_95: null,
        ...(options || {})
    };
    if (opts.target === null) {
        throw new Error('target required');
    }
    if (opts.timeseries === null) {
        throw new Error('timeseries required');
    }
    const variable = getVariableFromTemplateName(opts.timeseries.canonical_name);

    const source = opts.timeseries.data_source.hardware_id;
    return forkJoin({
        aggregation: aggregation({
            target: opts.target,
            ...(opts.aggregation_type !== null ? {aggregation_type: opts.aggregation_type} : {}),
            ...(opts.interval !== null ? {interval: opts.interval} : {}),
            ...(opts.date_to !== null ? {date_to: opts.date_to} : {}),
            ...(opts.date_from !== null ? {date_from: opts.date_from} : {}),
            timeseries: opts.timeseries.canonical_name
        }),
        prediction: prediction({
            target: opts.target,
            variable,
            source
        })
    }).pipe(
        map(({aggregation, prediction}) => {
            return {
                ...opts.timeseries,
                _extra: {
                    aggregation: [{data: aggregation, color: opts.color}],
                    prediction: {
                        data: prediction.predictions,
                        areas: [
                            {data: [prediction.confidence95], color: opts.color_95},
                            {data: [prediction.confidence60], color: opts.color_60}
                        ]
                    }
                }
            };
        })
    );
}


/**
 * Performs a list request to the timeseries endpoint.
 * Then for each timeseries it permforms an aggregation and two prediction request
 * extending the original timeseries with the aggregation and prediction data
 * returning [{...timeseries, _extra:{aggregation, prediction}}, ...]
 */
export function aggregationAndPredictionsForTemplate(options) {
    const opts = {
        cache: null,
        host: config.API_HOST,
        target: null,
        template_name: null,
        data_source__in: null,
        aggregation_type: null,
        interval: null,
        date_to: null,
        date_from: null,
        color: null,
        color_60: null,
        color_95: null,
        ...(options || {})
    };
    if (opts.target === null) {
        throw new Error('target required');
    }
    if (opts.template_name === null) {
        throw new Error('template_name required');
    }

    return list({
        target: opts.target,
        template_name: opts.template_name,
        ...(opts.data_source__in !== null ? {data_source__in: opts.data_source__in} : {})
    }).pipe(
        mergeMap((timeseries) => {
            if (timeseries.length > 0) {
                return forkJoin(...timeseries.map(t => {
                    return aggregationAndPredictionsForTimeseries({
                        ...opts,
                        timeseries: t
                    });
                }));
            } else {
                return of(timeseries);
            }
        })
    );
}

export function sortByDescription(_a, _b) {
    const a = _a.description.toLowerCase();
    const b = _b.description.toLowerCase();
    if (a > b) {
        return 1;
    }
    if (a < b) {
        return -1;
    }
    return 0;
}

export function sortByCategory(value) {
    if (value !== undefined) {
        return (
            value.map((s) => ({s, position: s.category.find((cat) => (/^q\d\d$/g).test(cat))}))
                .sort(({position: p1}, {position: p2}) => p1 < p2 ? -1 : (p1 === p2 ? 0 : 1))
                .map(({s}) => s)
        );
    } else {
        return [];
    }
}

/**
 * Performs a read request to the timeseries trace endpoint.
 */
export function getEventTrace(options) {
    const opts = {
        cache: null,
        host: config.API_HOST,
        id: null,
        target: null,
        timeseries: null,
        inputs_only: null,
        ...(options || {})
    };
    const url = `${baseUrl(opts)}${opts.timeseries}/events/${opts.id}/trace/`;
    return HttpClient.get(url, {
        cache: opts.cache,
        params: {
            ...(opts.inputs_only !== null ? {inputs_only: opts.inputs_only} : {})
        }
    }).pipe(map(r => ({
        ...r.data,
        trace: r.data.trace.map(t => normalizeTimeseries(t)),
        requests: r.data.requests.map(tr => normalizeTraceRequest(tr))
    })));
}

/**
 * Injects the event object with extra useful properties.
 */
const normalizeTraceRequest = r => ({
    ...r,
    createdAt: moment(r.created_at),
    receivedAt: moment(r.received_at)
});

/**
 * Performs a read request to the timeseries endpoint.
 */
export function createEventTraceRequest(options) {
    const opts = {
        cache: null,
        host: config.API_HOST,
        id: null,
        target: 'null',
        timeseries: null,
        ...(options || {})
    };
    const url = `${baseUrl(opts)}${opts.timeseries}/events/${opts.id}/trace-request/`;
    return HttpClient.post(url, {}).pipe(map(r => normalizeTraceRequest(r.data)));
}

/**
 * Performs a timeseries document list request.
 */
export const listDocument = (params) => handleListPagination(params, (options) => {
    const opts = {
        cache: null,
        host: config.API_HOST,
        page: null,
        page_size: null,
        target: null,
        canonical_name: null,
        created_at_from: null,
        created_at_to: null,
        type: null,
        ...(options || {})
    };
    const url = `${opts.host}/v1/target/${opts.target}/timeseries/${opts.canonical_name}/document/`;
    return HttpClient.get(url, {
        cache: opts.cache,
        params: {
            ...(opts.page !== null ? {page: opts.page} : {}),
            ...(opts.page_size !== null ? {page_size: opts.page_size} : {}),
            ...(opts.created_at_from !== null ? {created_at_from: opts.created_at_from} : {}),
            ...(opts.created_at_to !== null ? {created_at_to: opts.created_at_to} : {}),
            ...(opts.type !== null ? {type: opts.type} : {})
        }
    }).pipe(map((r) => r.data));
});

/**
 * Downloads document linked to a timeseries
 */
export function downloadDocument(options) {
    const opts = {
        host: config.API_HOST,
        id: null,
        target: null,
        canonical_name: null,
        ...(options || {})
    };
    return HttpClient.getBlob(
        `${opts.host}/v1/target/${opts.target}/timeseries/${opts.canonical_name}/document/${opts.id}/download/`,
        {filename: opts.filename}
    );
}

/*Choices for handleAnswer function*/
export const findChoice = (choices, value) => choices.find(
    (choice) => (typeof choice.value.gt === "undefined" || value > choice.value.gt) &&
          (typeof choice.value.lt === "undefined" || value < choice.value.lt) &&
          (typeof choice.value.gte === "undefined" || value >= choice.value.gte) &&
          (typeof choice.value.lte === "undefined" || value <= choice.value.lte)
);

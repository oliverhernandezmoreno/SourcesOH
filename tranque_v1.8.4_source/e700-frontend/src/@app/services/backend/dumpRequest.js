import {map} from 'rxjs/operators';
import * as config from '@app/config';
import {HttpClient} from '@app/services/httpClient';
import {handleListPagination} from '@app/services/backend/pagination';
import * as moment from 'moment/moment';
import { extendMoment } from 'moment-range';


export function listDumpRequests(options) {
    const opts = {
        cache: null,
        host: config.API_HOST,
        page: null,
        page_size: null,
        target_canonical_name: null,
        profile: null,
        ...(options || {})
    };
    return HttpClient.get(`${opts.host}/v1/target/${opts.target_canonical_name}/dump-request/`, {
        cache: opts.cache,
        params: {
            ...(opts.page !== null ? {page: opts.page} : {}),
            ...(opts.page_size !== null ? {page_size: opts.page_size} : {}),
            ...(opts.profile !== null ? {profile: opts.profile} : {})
        }
    }).pipe(map((r) => r.data));
}

export function listAllRequests(options) {
    return handleListPagination({page_size: 100, ...options}, listDumpRequests);
}


export function createDumpRequest(options) {
    const opts = {
        cache: null,
        host: config.API_HOST,
        target_canonical_name: null,
        profile: null,
        date_from: null,
        date_to: null,
        ...(options || {})
    };
    return HttpClient.post(`${opts.host}/v1/target/${opts.target_canonical_name}/dump-request/`,
        {
            ...(opts.profile !== null ? {profile: opts.profile} : {}),
            ...(opts.date_from !== null ? {date_from: opts.date_from} : {}),
            ...(opts.date_to !== null ? {date_to: opts.date_to} : {})
        },
        {
            cache: opts.cache,

        }).pipe(map((r) => r.data));
}

export function getTranslatedState(state) {
    switch (state) {
        case 'waiting_response':
            return 'Esperando respuesta';
        case 'received':
            return 'Datos recibidos';
        default: return '';
    }
}

export function dumpRequestReceived(state) {
    if (state === 'received') return true;
    else return false;
}

export function dumpInDaterange(dump, startDate, endDate) {
    const Moment = extendMoment(moment);
    const range = Moment().range(startDate, endDate);
    return range.contains(moment(dump.date_from)) ||
        (!range.contains(moment(dump.date_from)) && range.contains(moment(dump.date_to)));
}

export function getGaps(startDate, endDate, dataDumps) {
    if (dataDumps.length === 0) return [{startDate, endDate}];

    const receivedDataDumps = dataDumps.filter((dd) => dumpRequestReceived(dd.state)).sort((a,b) => {
        if (a.date_from === b.date_from){
            return moment(a.date_to).diff(moment(b.date_to));
        }
        return moment(a.date_from).diff(moment(b.date_from));
    });
    
    const normalizedReceivedDataDumps = receivedDataDumps.map((item) => ({
        startDate: moment(item.date_from),
        endDate: moment(item.date_to)
    }));
    
    let gapsArray = [];
    let dumpEndsRange = false;
    let currentDate = startDate;
    let startGap, endGap;
    
    for (let i = 0; i<normalizedReceivedDataDumps.length; i++){
        let dd = normalizedReceivedDataDumps[i];
        if (currentDate.isBefore(dd.startDate, 'day')){
            startGap = currentDate;
            endGap = dd.startDate;
            gapsArray.push({startDate: startGap, endDate: endGap});
            currentDate = dd.endDate;
        }else if (currentDate.isSameOrAfter(dd.startDate, 'day') && currentDate.isSameOrBefore(dd.endDate, 'day')){
            currentDate = dd.endDate;
        }
        
        if (currentDate.isSameOrAfter(endDate, 'day')){
            dumpEndsRange = true;
            break;
        }
    }

    if (!dumpEndsRange) {
        if (normalizedReceivedDataDumps.length > 0){
            startGap = currentDate;
            endGap = endDate;
        }else {
            startGap = startDate;
            endGap = endDate;
        }
        gapsArray.push({startDate: startGap, endDate: endGap});
    }

    return gapsArray;
}
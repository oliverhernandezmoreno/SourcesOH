import {map} from 'rxjs/operators';
import * as config from '@app/config';
import {HttpClient} from '@app/services/httpClient';
import {handleListPagination} from '@app/services/backend/pagination';

function normalizeInstance(instance) {
    return {
        ...instance,
        form_requests: instance.form_requests || [],
        period: `${instance.year} - Trimestre ${instance.trimester}`
    };
}

export function listInstances(options) {
    const opts = {
        cache: null,
        host: config.API_HOST,
        form_codename: null,
        page: null,
        page_size: null,
        zone: null,
        target: null,
        ...(options || {})
    };
    return HttpClient.get(`${opts.host}/v1/form/${opts.form_codename}/instance/`, {
        cache: opts.cache,
        params: {
            ...(opts.page !== null ? {page: opts.page} : {}),
            ...(opts.page_size !== null ? {page_size: opts.page_size} : {}),
            ...(opts.zone !== null ? {zone: opts.zone} : {})
        }
    }).pipe(map((r) => ({...r.data, results: r.data.results.map(normalizeInstance)})));
}

export function listAllInstances(options) {
    return handleListPagination({page_size: 100, ...options}, listInstances);
}

export function createInstance(options) {
    const opts = {
        cache: null,
        host: config.API_HOST,
        form_codename: null,
        trimester: null,
        year: null,
        version: null,
        target_canonical_name: null,
        ...(options || {})
    };
    return HttpClient.post(`${opts.host}/v1/form/${opts.form_codename}/instance/`,
        {
            ...(opts.trimester !== null ? {trimester: opts.trimester} : {}),
            ...(opts.year !== null ? {year: opts.year} : {}),
            ...(opts.version !== null ? {version: opts.version} : {}),
            ...(opts.target_canonical_name !== null ? {target_canonical_name: opts.target_canonical_name} : {})
        },
        {
            cache: opts.cache,
            params: {
                ...(opts.page !== null ? {page: opts.page} : {}),
                ...(opts.page_size !== null ? {page_size: opts.page_size} : {}),
                ...(opts.zone !== null ? {zone: opts.zone} : {})
            }
        }).pipe(map((r) => normalizeInstance(r.data)));
}

export function createMassiveInstance(options) {
    const opts = {
        cache: null,
        host: config.API_HOST,
        form_codename: null,
        targets: [],
        ...(options || {})
    };
    return HttpClient.post(`${opts.host}/v1/form/${opts.form_codename}/instance/`,
        opts.targets,
        {
            cache: opts.cache
        }).pipe(map(r => r.data));
}

export function createRequest(options) {
    const opts = {
        host: config.API_HOST,
        form_codename: null,
        id: null,
        comment: null,
        ...(options || {})
    };
    return HttpClient.post(`${opts.host}/v1/form/${opts.form_codename}/instance/${opts.id}/request/`,
        {
            ...(opts.comment !== null ? {comment: opts.comment} : {})
        }).pipe(map(r => r.data));
}

export function listRequests(options) {
    const opts = {
        cache: null,
        host: config.API_HOST,
        form_codename: null,
        id: null,
        ...(options || {})
    };
    const url = `${opts.host}/v1/form/${opts.form_codename}/instance/${opts.id}/request/`;
    return HttpClient.get(url, {cache: opts.cache}).pipe(map(r => r.data));
}

export function updateRequest(options) {
    const opts = {
        host: config.API_HOST,
        form_codename: null,
        instance_id: null,
        id: null,
        state: null,
        ...(options || {})
    };
    const url = `${opts.host}/v1/form/${opts.form_codename}/instance/${opts.instance_id}/request/${opts.id}/`;
    return HttpClient.put(url, {state: opts.state}).pipe(map(r => r.data));
}

export function listTargetInstances(options) {
    const opts = {
        cache: null,
        host: config.API_HOST,
        target: null,
        ...(options || {})
    };
    return HttpClient.get(`${opts.host}/v1/target/${opts.target}/form_instance/`, {
        cache: opts.cache,
        params: {
            ...(opts.page !== null ? {page: opts.page} : {}),
            ...(opts.page_size !== null ? {page_size: opts.page_size} : {}),
            ...(opts.zone !== null ? {zone: opts.zone} : {})
        }
    }).pipe(map((r) => r.data.map(normalizeInstance)));
}

export function listVersions(options) {
    const opts = {
        cache: null,
        host: config.API_HOST,
        form_codename: null,
        page: null,
        page_size: null,
        ...(options || {})
    };
    return HttpClient.get(`${opts.host}/v1/form/${opts.form_codename}/v/`, {
        cache: opts.cache,
        params: {
            ...(opts.page !== null ? {page: opts.page} : {}),
            ...(opts.page_size !== null ? {page_size: opts.page_size} : {})
        }
    }).pipe(map((r) => r.data));
}

export function listAllVersions(options) {
    return handleListPagination({page_size: 100, ...options}, listVersions);
}

export function listTargetType(options) {
    const opts = {
        host: config.API_HOST,
        ...(options || {})
    };
    return HttpClient.get(`${opts.host}/v1/target-type/`);
}

export function listCases(options) {
    const opts = {
        cache: null,
        host: config.API_HOST,
        page: null,
        page_size: null,
        ...(options || {})
    };
    return HttpClient.get(`${opts.host}/v1/form-case/`, {
        cache: opts.cache,
        params: {
            ...(opts.page !== null ? {page: opts.page} : {}),
            ...(opts.page_size !== null ? {page_size: opts.page_size} : {})
        }
    }).pipe(map((r) => r.data));
}

export function listAllCases(options) {
    return handleListPagination({page_size: 100, ...options}, listCases);
}

export function readInstance(options) {
    const opts = {
        cache: null,
        host: config.API_HOST,
        form_codename: null,
        id: null,
        ...(options || {})
    };
    return HttpClient.get(`${opts.host}/v1/form/${opts.form_codename}/instance/${opts.id}/`, {
        cache: opts.cache
    }).pipe(map((r) => normalizeInstance(r.data)));
}

export function uploadInstanceFile(options) {
    const opts = {
        host: config.API_HOST,
        form_codename: null,
        id: null,
        file: null,
        meta: {meta: {value: 'empty'}},
        ...(options || {})
    };
    return HttpClient.postFile(
        `${opts.host}/v1/form/${opts.form_codename}/instance/${opts.id}/document/upload/`,
        opts.file,
        opts.meta
    ).pipe(map(r => r.data));
}

export function deleteInstanceFile(options) {
    const opts = {
        host: config.API_HOST,
        form_codename: null,
        form_id: null,
        id: null,
        ...(options || {})
    };
    return HttpClient.delete(
        `${opts.host}/v1/form/${opts.form_codename}/instance/${opts.form_id}/document/${opts.id}/`,
        opts
    );
}

export function downloadInstanceFile(options) {
    const opts = {
        host: config.API_HOST,
        form_codename: null,
        form_id: null,
        id: null,
        filename: null,
        ...(options || {})
    };
    return HttpClient.getBlob(
        `${opts.host}/v1/form/${opts.form_codename}/instance/${opts.form_id}/document/${opts.id}/download/`,
        opts
    );
}

export function readCase(options) {
    const opts = {
        cache: null,
        host: config.API_HOST,
        id: null,
        ...(options || {})
    };
    return HttpClient.get(`${opts.host}/v1/form-case/${opts.id}/`, {
        cache: opts.cache
    }).pipe(map(r => r.data));
}

export function updateCase(options) {
    const opts = {
        cache: null,
        host: config.API_HOST,
        id: null,
        state: null,
        ...(options || {})
    };
    return HttpClient.patch(`${opts.host}/v1/form-case/${opts.id}/`,
        {
            state: opts.state
        });
}

export function commentCase(options) {
    const opts = {
        host: config.API_HOST,
        id: null,
        comment: '',

        ...(options || {})
    };
    return HttpClient.post(`${opts.host}/v1/form-case/${opts.id}/comment/`,
        {
            content: opts.comment

        });
}

export function createCase(options) {
    const opts = {
        host: config.API_HOST,
        id: null,
        title: '',
        description: '',
        ...(options || {})
    };
    return HttpClient.post(`${opts.host}/v1/form-case/`,
        {
            title: opts.title,
            description: opts.description,
            form_instance: opts.id
        });
}

export function ReadCaseComments(options) {
    const opts = {
        host: config.API_HOST,
        id: null,
        ...(options || {})
    };
    return HttpClient.get(`${opts.host}/v1/form-case/${opts.id}/comment/`);
}

export function uploadCaseFile(options) {
    const opts = {
        host: config.API_HOST,
        file: null,
        caseId: null,
        meta: {meta: {value: 'empty'}},
        ...(options || {})
    };
    return HttpClient.postFile(
        `${opts.host}/v1/form-case/${opts.caseId}/document/upload/`,
        opts.file,
        opts.meta
    ).pipe(map(r => r.data));
}

export function downloadCaseFile(options) {
    const opts = {
        host: config.API_HOST,
        caseId: null,
        id: null,
        filename: null,
        ...(options || {})
    };
    return HttpClient.getBlob(
        `${opts.host}/v1/form-case/${opts.caseId}/document/${opts.id}/download/`,
        opts
    );
}

export function sendForm(options) {
    const opts = {
        host: config.API_HOST,
        form_codename: null,
        id: null,
        ...(options || {})
    };
    return HttpClient.post(
        `${opts.host}/v1/form/${opts.form_codename}/instance/${opts.id}/send/`,
        {}
    );
}


export function saveAnswers(options) {
    const opts = {
        host: config.API_HOST,
        answer: {},
        form_codename: null,
        id: null,
        ...(options || {})
    };
    return HttpClient.patch(`${opts.host}/v1/form/${opts.form_codename}/instance/${opts.id}/`,
        {
            answer: opts.answer
        }
    );
}

export function updateFormState(options) {
    const opts = {
        host: config.API_HOST,
        state: null,
        form_codename: null,
        id: null,
        ...(options || {})
    };
    return HttpClient.patch(`${opts.host}/v1/form/${opts.form_codename}/instance/${opts.id}/`,
        {
            state: opts.state
        });
}

export function saveObservations(options) {
    const opts = {
        host: config.API_HOST,
        comment: '',
        form_codename: null,
        id: null,
        ...(options || {})
    };
    return HttpClient.post(`${opts.host}/v1/form/${opts.form_codename}/instance/${opts.id}/comment/`,
        {
            content: opts.comment
        });
}

export function reassignForm(options) {
    const opts = {
        host: config.API_HOST,
        reason: '',
        id: null,
        ...(options || {})
    };
    return HttpClient.post(`${opts.host}/v1/form-case/${opts.id}/reassign/`,
        {
            reason: opts.reason
        });
}

/**
 * Performs an export request for a single form to a file with xlsx extension.
 */

export const exportFile = (options) => {
    const opts = {
        host: config.API_HOST,
        form_codename: null,
        instance_ids: null,
        ...(options || {})
    };
    const url = `${opts.host}/v1/form/${opts.form_codename}/export/`;
    const filename = `${opts.form_codename}.xlsx`;
    return HttpClient.getBlob(url, {
        filename,
        params: {
            ...(opts.instance_ids !== null ? {instance_id__in: opts.instance_ids.join(',')} : {})
        }
    });
};

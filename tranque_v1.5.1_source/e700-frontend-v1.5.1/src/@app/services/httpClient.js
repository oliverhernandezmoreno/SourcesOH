import {Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import axios from 'axios';
import {saveAs} from 'file-saver';
import store from '@app/store';
import buildURL from 'axios/lib/helpers/buildURL';

import {API_HOST} from '@app/config';
import {authActions} from '@app/actions';

/**
 * Returns HttpHeaders for the requests
 */
export function getHttpHeaders(givenStore = null) {
    const headers = {'Content-Type': 'application/json'};

    const newStore = givenStore === null ? store : givenStore;
    const state = newStore.getState();
    if (state.auth && state.auth.accessToken) {
        const token = state.auth.accessToken;
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

const axiosClient = axios.create();

// The maximum age of a cache entry, independent of
// configuration. Each request will trigger a cleanup round.
const maxCacheAge = 10 * 60 * 1000;

const cachedRequest = (() => {
    const cache = {};  // request URI -> response
    return (url, config) => {
        if (!config.cache) {
            return axiosClient.get(url, config);
        }
        const paramsSerializer = config.paramsSerializer || axios.defaults.paramsSerializer;
        const key = buildURL(url, config.params, paramsSerializer);
        const timestamp = (new Date()).getTime();
        Object.keys(cache).forEach((k) => {
            if ((timestamp - cache[k].timestamp) > maxCacheAge) {
                delete cache[k];
            }
        });
        if (cache[key] && (timestamp - cache[key].timestamp) <= config.cache) {
            return Promise.resolve(cache[key].response);
        }
        return axiosClient.get(url, config)
            .then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    cache[key] = {timestamp, response};
                }
                return response;
            });
    };
})();

function makeRequest(method, url, config = {}, body = {}) {
    const ret = new Observable((subscriber) => {
        const cancelSource = axios.CancelToken.source();
        const headers = {...getHttpHeaders(), ...config.headers};
        let request;
        switch (method) {
            case 'GET':
                request = cachedRequest(url, {...config, headers, cancelToken: cancelSource.token});
                break;
            case 'POST':
                request = axiosClient.post(url, body, {...config, headers, cancelToken: cancelSource.token});
                break;
            case 'PUT':
                request = axiosClient.put(url, body, {...config, headers, cancelToken: cancelSource.token});
                break;
            case 'PATCH':
                request = axiosClient.patch(url, body, {...config, headers, cancelToken: cancelSource.token});
                break;
            case 'DELETE':
                request = axiosClient.delete(url, {...config, headers, cancelToken: cancelSource.token});
                break;
            case 'GET_BLOB':
                request = axios.default({url, ...config, headers, method: 'get', responseType: 'blob'});
                break;
            case 'POST_FILE':
                request = axios.default({
                    url,
                    ...config,
                    headers: {
                        ...headers,
                        'Content-Type': 'multipart/form-data'
                    },
                    cancelToken: cancelSource.token,
                    method: 'post',
                    data: (() => {
                        const data = new FormData();
                        data.append('file', body.file);
                        data.append('filename', body.file.name);
                        data.append('meta', JSON.stringify(body.meta));
                        return data;
                    })()
                });
                break;
            case 'POST_FORM':
                const data = new FormData();
                Object.entries(body).forEach(([key, value]) => {
                    data.append(key, value);
                });
                request = axios.default({
                    url,
                    ...config,
                    headers: {
                        ...headers,
                        'Content-Type': 'multipart/form-data'
                    },
                    cancelToken: cancelSource.token,
                    method: 'post',
                    data
                });
                break;
            default:
                throw new Error('Method not supported');
        }
        request.then(
            (response) => {
                if (response.status >= 200 && response.status < 300) {
                    subscriber.next(response);
                } else {
                    subscriber.error(response);
                }
                subscriber.complete();
            },
            (err) => {
                if (axios.isCancel(err)) {
                    console.info(err.message);
                    subscriber.complete();
                } else if (err.response && err.response.status === 401 && !config.refreshTokenRequest) {
                    // The token is invalid or it has expired so a token refresh request has to be sent
                    store.dispatch(authActions.tokenRefreshRequest());
                    refreshJWT().subscribe(
                        (res) => {
                            // The refresh token works and the request returns a new access token
                            // the previous (failed) request has to be sent again with the new access token
                            config.headers = config.headers || {};
                            config.headers.Authorization = `Bearer ${res.data.access}`;
                            makeRequest(method, url, config, body).subscribe(
                                (res) => subscriber.next(res),
                                (err) => subscriber.error(err.response),
                                () => subscriber.complete()
                            );
                        },
                        (err) => {
                            // The refreh token doesn't work so we have to change its state
                            subscriber.error(err.response);
                            subscriber.complete();
                        }
                    );
                } else {
                    subscriber.error(err.response);
                    subscriber.complete();
                }
            });

        return () => {
            cancelSource.cancel('Request canceled by the user.');
        };
    });
    if (method === 'GET_BLOB') {
        return ret.pipe(map(res => {
            const filename = config.filename || 'unknown';
            saveAs(new Blob([res.data]), filename);
            return {...res, data: filename};
        }));
    }
    return ret;
}

export function refreshJWT() {
    const refreshToken = store.getState().auth.refreshToken;
    const url = `${API_HOST}/v1/auth/token/refresh/`;
    const data = {'refresh': refreshToken};
    const dispatch = store.dispatch;

    return HttpClient.post(url, data, {refreshTokenRequest: true}).pipe(
        tap(
            response => dispatch(authActions.tokenRefreshSuccess(response)),
            error => dispatch(authActions.tokenRefreshFailure(error))
        )
    );
}

export const HttpClient = {
    get: (url, config = {}) => makeRequest('GET', url, config),
    getBlob: (url, config = {}) => makeRequest('GET_BLOB', url, config),
    post: (url, body, config = {}) => makeRequest('POST', url, config, body),
    postForm: (url, body, config = {}) => makeRequest('POST_FORM', url, config, body),
    postFile: (url, file, meta = {}, config = {}) => makeRequest('POST_FILE', url, config, {file, meta}),
    put: (url, body, config = {}) => makeRequest('PUT', url, config, body),
    patch: (url, body, config = {}) => makeRequest('PATCH', url, config, body),
    delete: (url, config = {}) => makeRequest('DELETE', url, config)
};

import {API_HOST} from '@app/config';

import {LOGIN_FAILURE, LOGIN_REQUEST, LOGIN_SUCCESS, LOGOUT, TOKEN_REFRESH_REQUEST, TOKEN_REFRESH_SUCCESS, TOKEN_REFRESH_FAILURE} from '@app/actions/auth.actionTypes';
import {tap} from 'rxjs/operators';
import {HttpClient} from '@app/services';

/**
 * Action creator related to the start of the login request
 */
function loginRequest() {
    return {type: LOGIN_REQUEST};
}

/**
 * Action creator if loggin success
 */
function loginSuccess(response) {
    return {type: LOGIN_SUCCESS, payload: response.data};
}

/**
 * Action creator if loggin fails
 */
function loginFailure(response) {
    return {type: LOGIN_FAILURE, payload: response};
}

/**
 * Action creator for user logout
 */
function logout() {
    return {type: LOGOUT};
}

/**
 * Login action creator
 *
 * This action creator uses the previous functions
 * to follow the life cycle of the user request
 *
 * Note: Implicit use of redux-thunk to manage the async requests
 */
function login(username, password) {
    const url = `${API_HOST}/v1/auth/token/`;
    const data = {'username': username, 'password': password};
    return dispatch => {
        dispatch(loginRequest());
        return HttpClient.post(url, data).pipe(
            tap(
                response => dispatch(loginSuccess(response)),
                error => dispatch(loginFailure(error))
            )
        );
    };
}

/**
 * Action creator related to the start of the token refresh request
 */
function tokenRefreshRequest() {
    return {type: TOKEN_REFRESH_REQUEST};
}

/**
 * Action creator if token refresh success
 */
function tokenRefreshSuccess(response) {
    return {type: TOKEN_REFRESH_SUCCESS, payload: response};
}

/**
 * Action creator if token refresh fails
 */
function tokenRefreshFailure(response) {
    return {type: TOKEN_REFRESH_FAILURE, payload: response};
}

/**
 * Selected action creators to export
 */
export const authActions = {
    login,
    loginSuccess,
    logout,
    tokenRefreshRequest,
    tokenRefreshSuccess,
    tokenRefreshFailure
};

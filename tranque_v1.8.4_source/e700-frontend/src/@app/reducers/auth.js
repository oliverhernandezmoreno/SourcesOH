import {LOGIN_SUCCESS, LOGOUT, TOKEN_REFRESH_SUCCESS, TOKEN_REFRESH_FAILURE, TOKEN_REFRESH_REQUEST} from '@app/actions/auth.actionTypes';

/**
 * Initial state for the reducer
 */
export const initialState = {
    isAuthenticated: false,
    isAccessTokenValid: false,
    isRefreshTokenValid: false,
    accessToken: null,
    refreshToken: null,
    user: null
};

/**
 * Authentication reducer
 */
function authReducer(state = initialState, action = {}) {
    switch (action.type) {
        case LOGIN_SUCCESS: {
            return {
                isAuthenticated: true,
                isAccessTokenValid: true,
                isRefreshTokenValid: true,
                accessToken: action.payload.access,
                refreshToken: action.payload.refresh,
                user: action.payload.user
            };
        }
        case LOGOUT: {
            return initialState;
        }
        case TOKEN_REFRESH_REQUEST: {
            return {...state,
                isAccessTokenValid: false
            }
        }
        case TOKEN_REFRESH_SUCCESS: {
            return {...state,
                isAccessTokenValid: true,
                isRefreshTokenValid: true,
                accessToken: action.payload.data.access
            }
        }
        case TOKEN_REFRESH_FAILURE: {
            return {...state,
                isRefreshTokenValid: false
            }
        }
        default: {
            return state;
        }
    }
}

export default authReducer;

import {LOGIN_SUCCESS, LOGOUT} from '@app/actions/auth.actionTypes';

import reducer, {initialState} from '@app/reducers/auth';

describe('auth reducer ', () => {

    it('should return the initial state by default', () => {
        // Arrange:
        const action = {};
        // Act:
        const state = reducer(undefined, action);
        // Assert:
        expect(state).toEqual(initialState);
    });

    it('should handle LOGIN_SUCCCESS', () => {
        // Arrange:
        const expectedState = {
            isAuthenticated: true,
            isAccessTokenValid: true,
            isRefreshTokenValid: true,
            accessToken: 'mockToken',
            refreshToken: 'mockToken',
            user: {}
        };
        const action = {
            type: LOGIN_SUCCESS,
            payload: {
                access: expectedState.accessToken,
                refresh: expectedState.refreshToken,
                user: expectedState.user
            }
        };
        expect(initialState.isAuthenticated).toEqual(false);
        expect(initialState.accessToken).toEqual(null);
        // Act:
        const state = reducer(undefined, action);
        // Assert:
        expect(state).toEqual(expectedState);
    });

    it('should handle LOGOUT', () => {
        // Arrange:
        const mockPreviousState = {
            isAuthenticated: true, accessToken: 'mockToken', refreshToken: 'mockToken', user: {}
        };
        const prevState = reducer(mockPreviousState, {});
        expect(prevState).toEqual(mockPreviousState);
        const action = {type: LOGOUT};
        // Act:
        const state = reducer(mockPreviousState, action);
        // Assert:
        expect(state).toEqual(initialState);
    });

});

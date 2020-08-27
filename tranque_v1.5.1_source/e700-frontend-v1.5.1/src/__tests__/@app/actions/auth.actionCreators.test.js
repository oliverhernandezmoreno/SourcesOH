import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {authActions} from '@app/actions/auth.actionCreators';
import {LOGIN_REQUEST, LOGIN_SUCCESS} from '@app/actions/auth.actionTypes';

import {configureStore} from '@app/store';

import {tap} from 'rxjs/operators';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const appStore = configureStore();
const initialState = appStore.getState();

beforeEach(() => {

    jest.resetAllMocks();

    axios.post.mockImplementation(
        jest.fn((config) => {
            return Promise.resolve({
                data: {
                    access: 'mockToken',
                    refresh: 'mockToken',
                    user: {}
                },
                status: 200,
                statusText: 'Ok',
                headers: {},
                config: {}
            });
        })
    );

});

describe('async actions ', () => {

    it('creates LOGIN_SUCCESS when login request has been done with no problems', () => {

        const store = mockStore(initialState);
        const expectedDataResponse = {
            access: 'mockToken',
            refresh: 'mockToken',
            user: {}
        };
        const expectedActions = [
            {type: LOGIN_REQUEST},
            {type: LOGIN_SUCCESS, payload: expectedDataResponse}
        ];

        return store.dispatch(authActions.login('user', 'pass'))
            .pipe(
                tap(() => {
                    expect(store.getActions()).toEqual(expectedActions);
                })
            ).toPromise();
    });

});

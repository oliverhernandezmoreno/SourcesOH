import axios from 'axios';
import {getHttpHeaders, HttpClient} from '@app/services';
import {configureStore} from '@app/store';
import {authActions} from '@app/actions';

const httpClientFunctions = Object.keys(HttpClient);

beforeEach(() => {
    localStorage.clear();
});

describe('httpClient ', () => {
    test('it should be created', () => {
        expect(HttpClient).toBeDefined();
    });
    test('it should be defined a post function', () => {
        expect(httpClientFunctions).toContain('post');
    });
    test('it should be defined a get function', () => {
        expect(httpClientFunctions).toContain('get');
    });
});

describe('getHttpHeaders function ', () => {

    test('it should retreive a basic header if no auth data in the store', () => {
        // Arrange:
        const expectedHeaders = {
            'Content-Type': 'application/json'
        };
        // Act:
        const headers = getHttpHeaders();
        // Assert:
        expect(headers).toEqual(expectedHeaders);
    });

    test('it should retreive a header with token, if available on store', () => {
        // Arrange:
        const store = configureStore();
        const mockToken = 'mocktoken';
        const payload = {data: {isAuthenticated: true, access: mockToken, refresh: mockToken, user: {}}};

        store.dispatch(authActions.loginSuccess(payload));

        const expectedHeaders = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + mockToken
        };
        // Act:
        const headers = getHttpHeaders(store);
        // Assert:
        expect(headers).toEqual(expectedHeaders);
    });

});


describe('refreshJWT function', () => {
    test('it is triggered by a 401 response status', (done) => {
    // setup a failing-and-then-passing request
        axios.get
            .mockImplementationOnce(() => Promise.reject({response: {status: 401, data: {messages: [{token_class: 'AccessToken'}]}}}))
            .mockImplementationOnce(() => Promise.resolve({status: 200, data: 'yay!'}));

        // setup a valid token response
        axios.post
            .mockImplementationOnce(() => Promise.resolve({status: 200, data: {access: 'supersuccessful'}}));

        // try a get request
        HttpClient.get('/some/random/url').subscribe(
            ({data}) => {
                // expect success
                expect(data).toEqual('yay!');
                done();
            },
            () => done.fail(new Error('refreshJWT failed'))
        );
    });
});

import React from 'react';
import ReactDOM from 'react-dom';
import mockConfigureStore from 'redux-mock-store';
import {Provider} from 'react-redux';
import {Router} from 'react-router-dom';
import {configureStore} from '@app/store';
import {history} from '@app/history';

import {E700} from '@e700/e700';

const appStore = configureStore();

it('renders without crashing', () => {
    const middlewares = [];
    const mockStore = mockConfigureStore(middlewares);
    const initialState = appStore.getState();
    const store = mockStore(initialState);
    const div = document.createElement('div');
    ReactDOM.render(
        <Provider store={store}>
            <Router history={history}>
                <E700 user={{
                    username: 'test',
                    global_permissions: [],
                    entities: [],
                    targets: []
                }}/>
            </Router>
        </Provider>,
        div);
    ReactDOM.unmountComponentAtNode(div);
});

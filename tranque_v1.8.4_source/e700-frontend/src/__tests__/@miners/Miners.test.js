import React from 'react';
import ReactDOM from 'react-dom';
import mockConfigureStore from 'redux-mock-store';
import {Provider} from 'react-redux';
import {Router} from 'react-router-dom';
import {configureStore} from '@app/store';
import {history} from '@app/history';

import Miners from '@miners/Miners';

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
                <Miners/>
            </Router>
        </Provider>,
        div);
    ReactDOM.unmountComponentAtNode(div);
});

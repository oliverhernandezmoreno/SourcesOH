import React from 'react';
import ReactDOM from 'react-dom';
import C40X from '@app/components/utils/C40X';
import {Router} from 'react-router-dom';
import {history} from '@app/history';

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Router history={history}><C40X /></Router>, div);
    ReactDOM.unmountComponentAtNode(div);
});

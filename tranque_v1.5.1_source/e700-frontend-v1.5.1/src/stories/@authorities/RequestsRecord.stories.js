import React from 'react';
import theme from '@authorities/theme';
import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';

import RequestsRecord from '@authorities/components/target/RequestsRecord';

const data = [{
    created_at: "2020-01-15T19:53:32.662872Z",
    created_by: "admin",
    date_from: "2019-01-01T03:00:00Z",
    date_to: "2020-01-03T02:59:00Z",
    id: "MNiBJmOdWwGk6DynNC_Wug",
    profile: "emac-mvp",
    received_at: "2020-01-15T19:53:58.158350Z",
    state: "received",
    target: "ov36as2HU3mahB6h98r4rQ"
}];

function getEqualRows(number) {
    let newData = []
    for (var i = 0; i < number; i ++) {
        newData = [...newData, ...data];
    }
    return newData;
}

storiesOf('Authorities/RequestsRecord', module)
    .addDecorator(muiTheme([theme]))
    .add('Example', () => (<RequestsRecord data={getEqualRows(5)}/>))
    .add('No records', () => (<RequestsRecord data={[]}/>))
    .add('Long table (300 rows)', () => (<RequestsRecord data={getEqualRows(300)}/>))

import React from 'react';
import theme from '@miners/theme';
import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import {ParametersTable} from '@alerts_events/components/ticket/detail/ParametersTable';
import {data} from './data/Params';

storiesOf('Alerts&Events/ParametersTable', module)
    .addDecorator(muiTheme([theme]))
    .add('Table with Tickets factors-list ', () => (
        <ParametersTable data={data}/>
    ))
    .add('Table without Tickets factors-list ', () => (
        <ParametersTable data={[]}/>
    ))

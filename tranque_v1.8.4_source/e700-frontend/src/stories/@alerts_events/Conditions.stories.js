import React from 'react';
import theme from '@miners/theme';
import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import Conditions from '@alerts_events/components/ticket/detail/Conditions';

const divStyle = {
    backgroundColor: theme.palette.secondary.light,
    color: '#ffffff'
};

const conditions = [
    {complete: true, description: "Condición 1"},
    {complete: false, description: "Condición 2"},
    {complete: false, description: "Condición 3"},
]


storiesOf('Alerts&Events/ticket-detail/Conditions', module)
    .addDecorator(muiTheme([theme]))
    .add('Example', () => <div style={divStyle}>
        <Conditions
            approvalLevel={1}
            type='hacer algo con'
            conditions={conditions}
        />
    </div>)
    .add('Without conditions', () => <div style={divStyle}>
        <Conditions
            approvalLevel={1}
            type='hacer algo con'
            conditions={[]}
        />
    </div>)



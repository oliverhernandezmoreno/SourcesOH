import React from 'react';
import ListSensor from '@miners/components/EF/dashboard/ListSensor';
import { storiesOf } from "@storybook/react";
import theme from '../../@miners/theme';
import {muiTheme} from 'storybook-addon-material-ui';

const divStyle = {
    backgroundColor: '#000000',
    padding: 100
}

function getVal(props) {
    return {
        name: 'PZ CPTU-10',
        values: 2,
        threshold: 4,
        units: undefined,
        ...props
    }
}

function getListSensor(valProps) {
    return <div style={divStyle}>
        <ListSensor value={getVal(valProps)}/>
    </div>
}

storiesOf('Miners/ListSensor', module)
    .addDecorator(muiTheme([theme]))
    .add('Green', () => getListSensor({}))
    .add('Yellow (icon + name)', () => getListSensor({values: 6}))
    .add('Grey (values=null)', () => getListSensor({values: null}))
    .add('Green (threshold=null & value!=NaN)', () => getListSensor({threshold: null}))

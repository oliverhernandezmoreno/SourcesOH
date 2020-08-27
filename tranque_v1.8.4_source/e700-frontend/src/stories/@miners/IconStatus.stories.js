import React from 'react';
import IconStatus from '@miners/components/EF/IconStatus';
import { storiesOf } from "@storybook/react";
import theme from '../../@miners/theme';
import {muiTheme} from 'storybook-addon-material-ui';
import {UPPER, LOWER} from '@miners/constants/thresholdTypes';

const divStyle = {
    backgroundColor: '#000000',
    padding: 100
}

function getIconStatus(val, threshold, type) {
    return <div style={divStyle}>
        <IconStatus
            value={val}
            threshold={threshold}
            type={type}
        />
    </div>
}

storiesOf('Miners/IconStatus/Green', module)
    .addDecorator(muiTheme([theme]))
    .add('val<upper threshold', () => getIconStatus(5, 10, UPPER))
    .add('val>lower threshold', () => getIconStatus(10, 5, LOWER))
    .add('threshold=null, value!=NaN', () => getIconStatus(5, null, UPPER))

storiesOf('Miners/IconStatus/Yellow', module)
    .addDecorator(muiTheme([theme]))
    .add('val greater than upper threshold', () => getIconStatus(10, 5, UPPER))
    .add('val=upper threshold', () => getIconStatus(7, 7, UPPER))
    .add('val lesser than lower threshold', () => getIconStatus(5, 7, LOWER))
    .add('val=lower threshold', () => getIconStatus(5, 5, LOWER))

storiesOf('Miners/IconStatus/Grey', module)
    .addDecorator(muiTheme([theme]))
    .add('value=null', () => getIconStatus(null, 6, LOWER))
    .add('type=null', () => getIconStatus(4, 3, null))

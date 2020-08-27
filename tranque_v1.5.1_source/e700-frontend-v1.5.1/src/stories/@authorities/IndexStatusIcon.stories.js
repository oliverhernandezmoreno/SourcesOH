import React from 'react';

import theme from '@authorities/theme';

import {storiesOf} from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import {IndexStatusIcon} from '@authorities/components/IndexStatusIcon';
import {NONE, NOT_CONFIGURED, RED_ALERT, WITHOUT_ALERT, YELLOW_ALERT} from '@authorities/constants/indexState';


storiesOf('Authorities/IndexStatusIcon', module)
    .addDecorator(muiTheme([theme]))
    .add('status: NONE', () => (<IndexStatusIcon status={NONE}/>))
    .add('status: NOT_CONFIGURED', () => (<IndexStatusIcon status={NOT_CONFIGURED}/>))
    .add('status: WITHOUT_ALERT', () => (<IndexStatusIcon status={WITHOUT_ALERT}/>))
    .add('status: YELLOW_ALERT', () => (<IndexStatusIcon status={YELLOW_ALERT}/>))
    .add('status: RED_ALERT', () => (<IndexStatusIcon status={RED_ALERT}/>));

import React from 'react';

import theme from '@authorities/theme';

import {storiesOf} from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import {RemoteStatusIcon} from '@authorities/components/RemoteStatusIcon';
import {CONNECTED, FAILED, NOT_IN_SMC} from '@authorities/constants/connectionState';


storiesOf('Authorities/RemoteStatusIcon', module)
    .addDecorator(muiTheme([theme]))
    .add('status: NOT_IN_SMC', () => (<RemoteStatusIcon status={NOT_IN_SMC}/>))
    .add('status: FAILED', () => (<RemoteStatusIcon status={FAILED}/>))
    .add('status: CONNECTED', () => (<RemoteStatusIcon status={CONNECTED}/>));

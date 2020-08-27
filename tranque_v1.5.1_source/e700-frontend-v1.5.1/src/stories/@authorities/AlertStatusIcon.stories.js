import React from 'react';

import theme from '@authorities/theme';

import {storiesOf} from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import {AlertStatusIcon} from '@authorities/components/AlertStatusIcon';
import { NO_ALERT_COLOR, YELLOW_ALERT_COLOR, RED_ALERT_COLOR } from '@authorities/constants/alerts';


storiesOf('Authorities/AlertStatusIcon', module)
    .addDecorator(muiTheme([theme]))
    .add('Green Alert (no issues)', () => (<AlertStatusIcon size="2em" color={NO_ALERT_COLOR}/>))
    .add('Yellow Alert', () => (<AlertStatusIcon size="2em" color={YELLOW_ALERT_COLOR}/>))
    .add('Red Alert', () => (<AlertStatusIcon size="2em" color={RED_ALERT_COLOR}/>))
    .add('Disconnected Green Alert', () => (<AlertStatusIcon size="2em" color={NO_ALERT_COLOR} disconnected/>))
    .add('Disconnected Yellow Alert', () => (<AlertStatusIcon size="2em" color={YELLOW_ALERT_COLOR} disconnected/>));

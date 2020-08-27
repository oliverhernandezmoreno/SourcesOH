import React from 'react';

import theme from '@authorities/theme';
import {storiesOf} from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';

import TSymbology from '@authorities/components/TSymbology';

/* ACT */
storiesOf('TSymbology', module)
    .addDecorator(muiTheme([theme]))
    .add('General story', () => (        
        <TSymbology/>          
    ));
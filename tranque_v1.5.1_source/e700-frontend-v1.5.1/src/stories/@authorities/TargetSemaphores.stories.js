import React from 'react';
import theme from '@authorities/theme';
import {storiesOf} from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import {Container} from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import SemaphoreStatus from '@authorities/components/target/semaphore/SemaphoreStatus';

storiesOf('Authorities/TargetSemaphores', module)
    .addDecorator(muiTheme([theme]))
    .add('Green Semaphore', () => (
        <CssBaseline>
            <Container maxWidth="md"><SemaphoreStatus/></Container>
        </CssBaseline>));

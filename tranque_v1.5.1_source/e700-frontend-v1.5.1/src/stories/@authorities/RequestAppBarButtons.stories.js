import React from 'react';
import theme from '@authorities/theme';
import {storiesOf} from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import RequestAppBarButtons from '@alerts_events/components/RequestAppBarButtons';

storiesOf('Authorities/RequestAppBarButtons', module)
    .addDecorator(muiTheme([theme]))
    .add('Example', () => (
        <RequestAppBarButtons typedRequests={{
            pendingReceivedRequests: 1,
            resolvedRequestedRequests: 1
        }}/>
    ))
    .add('Null values', () => (
        <RequestAppBarButtons typedRequests={{
            pendingReceivedRequests: null,
            resolvedRequestedRequests: null
        }}/>
    ))

import React from 'react';

import theme from '@authorities/theme';

import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';

import TAppBar from '@app/components/TAppBar';

import { action } from '@storybook/addon-actions';

const tabs = [{name: "Tab1", onClick: (() => action("Click on Tab1"))},
    {name: "Tab2", onClick: (() => action("Click on Tab2"))}];

const username = "User Name";

const requestsCounter = {
    pendingReceivedRequests: 0,
    resolvedRequestedRequests: 0,
}

storiesOf('App/TAppBar', module)
    .addDecorator(muiTheme([theme]))
    .add('Simple App Bar', () => (
        <TAppBar tabs={tabs}
            typedRequests={requestsCounter}
            onUserExit={(event) => action("Exit user account")}
            userName={username} />
    ))

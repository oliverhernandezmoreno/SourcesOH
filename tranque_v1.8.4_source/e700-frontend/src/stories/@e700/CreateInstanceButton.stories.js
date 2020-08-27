import React from 'react';
import {Provider} from 'react-redux';
import {configureStore} from '@app/store';
import { storiesOf } from '@storybook/react';
import theme from '@e700/theme';
import {muiTheme} from 'storybook-addon-material-ui';
import CreateInstanceButton from '@e700/components/registry/CreateInstanceButton';

const store = configureStore();

storiesOf('e700/Create Instance Button', module)
    .addDecorator(muiTheme([theme]))
    .addDecorator(story => <Provider store={store}>{story()}</Provider>)
    .add('Example', () => (<CreateInstanceButton/> ))




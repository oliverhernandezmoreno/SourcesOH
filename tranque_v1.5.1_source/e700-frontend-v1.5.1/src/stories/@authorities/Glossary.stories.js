import React from 'react';

import theme from '@authorities/theme';
import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';

import Glossary from '@app/components/help/Glossary';

const data = [{name: 'Término1', value: 'Significado de término1'},
    {name: 'Término2', value: 'Significado de término2'},
    {name: 'Término3', value: 'Significado de término3'}]

storiesOf('Authorities/Glossary', module)
    .addDecorator(muiTheme([theme]))
    .add('Example', () => (<Glossary data={data}/> ));

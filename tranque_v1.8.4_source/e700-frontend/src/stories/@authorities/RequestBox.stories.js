import React from 'react';
import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import {CssBaseline} from '@material-ui/core';
import RequestsBox from '@authorities/components/target/RequestsBox';
import theme from '@authorities/theme';
import * as moment from 'moment';

const dataGaps = [
    {startDate: moment('2020-01-01'), endDate: moment()}
];

storiesOf('Authorities/RequestsBox', module)
    .addDecorator(muiTheme([theme]))
    .add('Example with data gaps', () => (<CssBaseline><RequestsBox dataGaps={dataGaps} handleRequest={() => null}/></CssBaseline>))
    .add('Example without data gaps', () => (<CssBaseline><RequestsBox dataGaps={[]}/></CssBaseline>))
    .add('Example with failed request', () => (<CssBaseline><RequestsBox failedDump/></CssBaseline>))
    .add('Example with pending data dump', () => (<CssBaseline><RequestsBox dataGaps={dataGaps} waitingDumps handleRequest={() => null}/></CssBaseline>));
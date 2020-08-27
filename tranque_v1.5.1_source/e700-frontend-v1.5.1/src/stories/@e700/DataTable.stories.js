import React from 'react';
import theme from '@e700/theme';
import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import DataTable from '@app/components/utils/DataTable';

const longText = [
    {
        label: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.In quis neque risus. ' +
               'Nunc sit amet rutrum tortor. ',
        data: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
              'In quis neque risus. Nunc sit amet rutrum tortor.' +
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
              'In quis neque risus. Nunc sit amet rutrum tortor.'
    },
    {
        label: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.In quis neque risus. ' +
               'Nunc sit amet rutrum tortor. ',
        data: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
              'In quis neque risus. Nunc sit amet rutrum tortor.' +
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
              'In quis neque risus. Nunc sit amet rutrum tortor.'
    },
    {
        label: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.In quis neque risus. ' +
               'Nunc sit amet rutrum tortor. ',
        data: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
              'In quis neque risus. Nunc sit amet rutrum tortor.' +
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
              'In quis neque risus. Nunc sit amet rutrum tortor.'
    }
]

storiesOf('e700/Data Table', module)
    .addDecorator(muiTheme([theme]))
    .add('Simple example', () => (
        <DataTable title='Título'
            items={[
                {label: 'Label1', data: 'Data1'},
                {label: 'Label2', data: 'Data2'},
                {label: 'Label3', data: 'Data3'}
            ]}
        />
    ))
    .add('Long data', () => (
        <DataTable title='Data table with long labels and data'
            items={longText}
        />
    ))
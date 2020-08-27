import React from 'react';
import DownloadSheetButton from '@miners/containers/EF/data/EFViews/DownloadSheetButton';
import theme from '../../@miners/theme';
import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import {getDataSource} from '../data/dataSources';
import {generateTarget} from '../data/targets';
import {getDocuments} from '../data/documents';
import { MemoryRouter } from 'react-router';

const divStyle = {
    backgroundColor: theme.palette.secondary.light,
    color: '#ffffff',
    padding: 50
};

const dataSource = getDataSource({});
const dataSource_with_sheet = getDataSource({sheet: getDocuments(1, {}, {})[0]})

function getDownloadButton(dataSource) {
    return <div style={divStyle}>
        <DownloadSheetButton target={generateTarget(1)} dataSource={dataSource}/>
    </div>
}

storiesOf('Miners/DownloadSheetButton', module)
    .addDecorator(muiTheme([theme]))
    .addDecorator(story => <MemoryRouter initialEntries={['/']}>{story()}</MemoryRouter>)
    .add('Example', () => getDownloadButton(dataSource_with_sheet))
    .add('Datasource with no sheet (blue snackbar on click)', () => getDownloadButton(dataSource))
    .add('Null Datasource', () => getDownloadButton(null))

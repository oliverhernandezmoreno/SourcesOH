import React from 'react';
import DataSourceSheet from '@miners/containers/EF/data/EFViews/DataSourceSheet';
import theme from '../../@miners/theme';
import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import {getDataSource} from '../data/dataSources';
import {getTargetByAttrs} from '../data/targets';
import {getDocuments} from '../data/documents';
import { MemoryRouter } from 'react-router';

const dataSource = getDataSource({});
const dataSource_with_sheet = getDataSource({sheet: getDocuments(1, {}, {})[0]})

const fileData = {
    location: 'Location info...',
    coords: `${dataSource.coords.x} E ${dataSource.coords.y} N`,
    sector: 'Sector info...',
    drenaje: 'Drenaje info...',
};

const fileData_null_values = {
    location: null,
    coords: null,
    sector: null,
    drenaje: null
}
const fileData_undefined = {}

function getSheet(fileData, sheet, sector, drenaje) {
    return <DataSourceSheet excludeSector={!sector} excludeDrenaje={!drenaje}
        target={getTargetByAttrs({})}
        dataSource={sheet ? dataSource_with_sheet : dataSource}
        fileData={fileData}
    />

}

storiesOf('Miners/DataSourceSheet', module)
    .addDecorator(muiTheme([theme]))
    .addDecorator(story => <MemoryRouter initialEntries={['/']}>{story()}</MemoryRouter>)
    .add('Example', () => getSheet(fileData, true, true, true))
    .add('Excluding sector and drenaje', () => getSheet(fileData, true, false, false))
    .add('Null info', () => getSheet(fileData_null_values, true, true, true))
    .add('Undefined info', () => getSheet(fileData_undefined, true, true, true))
    .add('Without a sheet file (blue snackbar on button click)', () => getSheet(fileData, false, true, true))
    .add('Null props', () => <DataSourceSheet/>)

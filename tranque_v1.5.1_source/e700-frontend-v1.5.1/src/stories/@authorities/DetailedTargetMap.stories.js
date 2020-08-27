import React from 'react';
import theme from '@authorities/theme';
import {storiesOf} from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import DetailedTargetMap from '@authorities/components/target/data/DetailedTargetMap';
import {getDataSource} from './data/dataSources';
import {getTargetByAttrs} from '../data/targets';

const mapProps = {
    mapLayerUrl: 'https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibmFndWlsZXJhIiwiYSI6ImNqMHhxcXp2YTAwMWszMnBiaGhuY29zcWYifQ.j9_7JTL8ynbknCo9XjbUCQ',
    mapAttribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    satelliteLayerUrl: 'https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.jpg90?access_token=pk.eyJ1IjoibmFndWlsZXJhIiwiYSI6ImNqMHhxcXp2YTAwMWszMnBiaGhuY29zcWYifQ.j9_7JTL8ynbknCo9XjbUCQ',
    satelliteAttribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
}

const dataSources = [
    getDataSource({
        name: 'Punto de medición 1',
        coords: {x: 469149, y: 7379171, srid: 32719},
        deg_coords: {lat: -23.698042116185366, lng: -69.302617107696},
    }),
    getDataSource({
        name: 'Punto de medición 2',
        coords: {x: 469435, y: 7378512, srid: 32719},
        deg_coords: {lat: -23.704000001628128, lng: -69.29982536392438},
    }),
    getDataSource({
        name: 'Punto de medición 3',
        coords: {x: 467949, y: 7379967, srid: 32719},
        deg_coords: {lat: -23.690828781781914, lng: -69.31437054296464},
    })
]

const table = [
    {
        title: 'Punto de Monitoreo',
        field: 'name',
        headerStyle: {textAlign: 'center'}
    },
    { title: 'columna 2' },
    { title: 'columna 3' },
    {
        title: 'UTM este',
        render: data => data.coords.x
    },
    {
        title: 'UTM norte',
        render: data => data.coords.y
    }
]

storiesOf('Authorities/DetailedTargetMap', module)
    .addDecorator(muiTheme([theme]))
    .add('General example', () => (
        <DetailedTargetMap
            mapProps={mapProps}
            dataSources={dataSources}
            tableColumns={table}
            name='Punto de monitoreo de aguas'
            target={getTargetByAttrs({
                deg_coords: {lat: -23.704000001628128, lng: -69.29982536392438}}
            )}
        />
    ));

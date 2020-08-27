import React from 'react';
import theme from '@authorities/theme';
import {storiesOf} from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import InstrumentsMap from '@app/components/map/InstrumentsMap';
import {getDataSource} from '../data/dataSources';
import tranqueImage from '../data/test-map-image.png';


const mapProps = {
    mapLayerUrl: 'https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibmFndWlsZXJhIiwiYSI6ImNqMHhxcXp2YTAwMWszMnBiaGhuY29zcWYifQ.j9_7JTL8ynbknCo9XjbUCQ',
    mapAttribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    satelliteLayerUrl: 'https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.jpg90?access_token=pk.eyJ1IjoibmFndWlsZXJhIiwiYSI6ImNqMHhxcXp2YTAwMWszMnBiaGhuY29zcWYifQ.j9_7JTL8ynbknCo9XjbUCQ',
    satelliteAttribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
}

const dataSources = [
    getDataSource({
        name: 'Punto 1 (inferior izquierdo si hay imagen, inferior derecho si no)',
        coords: {x: 6462500, y: 306300, srid: 32719},
        deg_coords: {lat: -42.82692015438234, lng: 18.46147525305683},
    }),
    getDataSource({
        name: 'Punto 2 (superior derecho si hay imagen, superior izquierdo si no)',
        coords: {x: 6463600, y: 307200, srid: 32719},
        deg_coords: {lat: -42.81982058112475, lng: 18.454578454557414},
    }),
    getDataSource({
        name: 'Punto de medición 3',
        coords: {x: 6462500, y: 307200, srid: 32719},
        deg_coords: {lat: -42.82692015438234, lng: 18.454578454557414},
    }),
    getDataSource({
        name: 'Punto de medición 4',
        coords: {x: 6463600, y: 306300, srid: 32719},
        deg_coords: {lat: -42.81982058112475, lng: 18.46147525305683},
    }),
    getDataSource({
        name: 'Punto central',
        coords: {
            x: 6462500 + (parseFloat(Math.abs(6463600-6462500))/2),
            y: 306300 + (parseFloat(Math.abs(307200-306300))/2), srid: 32719
        },
        deg_coords: {
            lat: -42.82692015438234 + (parseFloat(Math.abs(-42.81982058112475+42.82692015438234))/2),
            lng: 18.454578454557414 + (parseFloat(Math.abs(18.46147525305683-18.454578454557414))/2)
        },
    })
]

const image = {
    lowerLeftX: -42.82692015438234, lowerLeftY: 18.46147525305683,
    upperRightX: -42.81982058112475, upperRightY: 18.454578454557414,
    imageUrl: tranqueImage,
    imageName: 'Imagen del tranque',
    imageWidth: 690,
    imageHeight: 436
};

const divStyle = {height: 500};

storiesOf('App/InstrumentsMap', module)
    .addDecorator(muiTheme([theme]))
    .add('Without image', () =>
        <div style={divStyle}>
            <InstrumentsMap
                dataSources={dataSources}
                name={'Punto de monitoreo de aguas'}
                mapProps={mapProps} /></div>
    )
    .add('With image', () => {
        const InstrumentsMapProps = {
            dataSources,
            mapProps,
            showImage: true, image};
        return <div style={divStyle}><InstrumentsMap
            name='Ubicación de piezómetros - vista de planta'
            {...InstrumentsMapProps}/></div>;
    })
    .add('Without image and defaultMap', () => {
        const finalMapProps = {
            ...mapProps, mapLayerUrl: null
        };
        return <div style={divStyle}><InstrumentsMap
            dataSources={dataSources}
            name={'Punto de monitoreo de aguas'}
            mapProps={finalMapProps} /></div>
    })


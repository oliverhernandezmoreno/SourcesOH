import React, {Component} from 'react';
import {ResponsiveMap} from '@app/components/map/ResponsiveMap';
import {JSXMarker} from '@app/components/map/JSXMarker';
import {LayerGroup, Popup} from 'react-leaflet';
import {RoomTwoTone} from '@material-ui/icons';
import {Typography, Grid, withStyles} from '@material-ui/core';
import {latLngBounds} from 'leaflet'


const styles = theme => ({
    source: {
        fill: '#303030'
    },
    map: {
        padding: 20,
        width: '100%',
        height: '100%'
    },
    title: {
        padding: 12
    },
    noMap: {
        padding: 30
    }
});

class InstrumentsMap extends Component {

    render() {
        const {dataSources, classes, name, showImage, image, mapProps} = this.props;
        let borders = {};
        let center = null;
        const sourceRender = (dataSources || []).map(
            (source, i) => {
                if (!source || !source.deg_coords) return null;

                const position = showImage && image ?
                    [-source.deg_coords.lng, source.deg_coords.lat] :
                    [source.deg_coords.lat, source.deg_coords.lng]

                if (!center) center = position;

                if (!borders.minLat || borders.minLat > source.deg_coords.lat) {
                    borders['minLat'] = source.deg_coords.lat;
                }
                if (!borders.maxLat || borders.maxLat < source.deg_coords.lat) {
                    borders['maxLat'] = source.deg_coords.lat;
                }
                if (!borders.minLng || borders.minLng > source.deg_coords.lng) {
                    borders['minLng'] = source.deg_coords.lng;
                }
                if (!borders.maxLng || borders.maxLng < source.deg_coords.lng) {
                    borders['maxLng'] = source.deg_coords.lng;
                }
                return (
                    <JSXMarker
                        key={'marker_' + i}
                        position={position}
                    >
                        <Popup>
                            <Grid container direction='column'>
                                <Grid item>
                                    <b>Nombre: </b>{source.name}
                                </Grid>
                                <Grid item>
                                    <b>UTM Este: </b>{source.coords.x}
                                </Grid>
                                <Grid item>
                                    <b>UTM Norte: </b>{source.coords.y}
                                </Grid>
                            </Grid>
                        </Popup>
                        {React.createElement(RoomTwoTone, {fontSize: 'large', className: classes.source})}
                    </JSXMarker>
                );
            }
        );
        let imageBounds = null;
        let mapBounds = [];
        let fitBounds = null;
        let finalMapProps = {...mapProps};
        if (borders.minLat && borders.maxLat && borders.minLng && borders.maxLng) {
            if (borders.minLat !== borders.maxLat || borders.minLng !== borders.maxLng) {
                fitBounds = [[borders.minLat, borders.minLng], [borders.maxLat, borders.maxLng]];
                finalMapProps = {...finalMapProps, fitBounds: latLngBounds(fitBounds)}
            }
        }
        if (showImage && image) {
            imageBounds = [[-image.upperRightY, image.upperRightX], [-image.lowerLeftY, image.lowerLeftX]];
            mapBounds = image.lowerLeftX !== 0 ? latLngBounds(imageBounds) : null;
            finalMapProps = {...finalMapProps, maxBounds: mapBounds}
        }
        return (!fitBounds && !center) || (showImage && !imageBounds) || (!showImage && !mapProps.mapLayerUrl) ?
            <div className={classes.noMap}>Mapa no disponible</div> :
            <div className={classes.map}>
                <Typography className={classes.title} variant="subtitle1">{name}</Typography>
                <ResponsiveMap
                    center={!fitBounds && center}
                    imageLayer={imageBounds && showImage}
                    imageBounds={imageBounds}
                    image={image && image.imageUrl}
                    imageName={image && image.imageName}
                    {...finalMapProps}
                    controlledLayers={[
                        <LayerGroup key={'layer1'}>
                            {sourceRender}
                        </LayerGroup>
                    ]}
                />
            </div>;
    }
}

export default withStyles(styles)(InstrumentsMap);

import React, {Component} from 'react';
import {ResponsiveMap} from '@app/components/map/ResponsiveMap';
import {JSXMarker} from '@app/components/map/JSXMarker';
import {LayerGroup, LayersControl, Popup} from 'react-leaflet';
import {RoomTwoTone} from '@material-ui/icons';
import {Grid, withStyles} from '@material-ui/core';
import TMaterialTable from '@app/components/utils/TMaterialTable';


const styles = theme => ({
    source: {
        fill: '#303030'
    },
    map: {
        width: '100%',
        height: '500px',
    },
    table: {
        paddingBottom: 20
    }
});

class DetailedTargetMap extends Component {

    render() {
        const {target, dataSources, classes, mapProps, tableColumns, name} = this.props;
        const target_deg_coords = target.deg_coords ? [target.deg_coords.lat, target.deg_coords.lng] : null;
        const sourceRender = dataSources.map(
            (source, i) => {
                if (!source.deg_coords) return null;
                return (
                    <JSXMarker
                        key={'marker_' + i}
                        position={[source.deg_coords.lat, source.deg_coords.lng]}
                    >
                        <Popup>
                            <Grid container>
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
        return <>
            <div className={classes.map}>
                <ResponsiveMap zoom={12} center={target_deg_coords} {...mapProps}
                    controlledLayers={[
                        <LayersControl.Overlay name={name} key='layer1' checked={true}>
                            <LayerGroup>
                                {sourceRender}
                            </LayerGroup>
                        </LayersControl.Overlay>
                    ]}
                />
            </div>
            {
                tableColumns &&
                <div className={classes.table}>
                    <TMaterialTable
                        data={dataSources}
                        columns={tableColumns}
                        options={{
                            paging: false, search: false, sorting: false
                        }}
                    />
                </div>
            }
        </>;
    }
}

export default withStyles(styles)(DetailedTargetMap);

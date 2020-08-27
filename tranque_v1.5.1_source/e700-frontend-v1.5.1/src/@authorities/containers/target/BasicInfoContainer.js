import React from 'react';
import PropTypes from 'prop-types';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import * as SiteParameterService from '@app/services/backend/siteParameter';
import * as config from '@app/config';
import BasicInfo from '@authorities/components/target/BasicInfo';
import {ResponsiveMap} from '@app/components/map/ResponsiveMap';
import {Marker, Popup} from 'react-leaflet';
import {Table, TableBody, TableCell, TableRow, withStyles} from '@material-ui/core';

const styles = theme => ({
    map: {
        width: '100%',
        height: '400px',
        padding: '24px 0'
    },
    table: {
        minWidth: 300,
    },
    tableCell: {
        fontSize: '10pt',
        color: theme.palette.grey[900]
    }
});

/**
 * A component for rendering a table used for monitoring.
 *
 * @version 1.0.0
 * @author [Natalia Vidal](https://gitlab.com/nattoV)
 */
export const BasicInfoContainer = withStyles(styles)(class extends SubscribedComponent {

    state = {
        mapProps: {}
    };

    componentDidMount() {
        this.subscribe(
            SiteParameterService.getMapParameters({cache: config.DEFAULT_CACHE_TIME * 3}),
            (mapProps) => {
                this.setState({mapProps});
            }
        );
    }


    render() {
        const {target, entityName, regionName, comunaName, workSiteName, classes} = this.props;
        const {mapProps} = this.state;
        const center = target.deg_coords ? [target.deg_coords.lat, target.deg_coords.lng] : undefined;
        return (
            <>
                <BasicInfo data={target}/>
                <div className={classes.map}>
                    <ResponsiveMap {...mapProps} zoom={14} center={center}>
                        <Marker position={center}>
                            {target.coords && <Popup>
                                <Table className={classes.table}>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className={classes.tableCell}>UTM Este:</TableCell>
                                            <TableCell className={classes.tableCell}>{target.coords.x}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className={classes.tableCell}>UTM Norte:</TableCell>
                                            <TableCell className={classes.tableCell}>{target.coords.y}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className={classes.tableCell}>Empresa:</TableCell>
                                            <TableCell className={classes.tableCell}>{entityName}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className={classes.tableCell}>Faena:</TableCell>
                                            <TableCell className={classes.tableCell}>{workSiteName}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className={classes.tableCell}>Región:</TableCell>
                                            <TableCell className={classes.tableCell}>{regionName}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className={classes.tableCell}>Comuna:</TableCell>
                                            <TableCell className={classes.tableCell}>{comunaName}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </Popup>}
                        </Marker>
                    </ResponsiveMap>
                </div>
            </>
        );
    }
})

BasicInfoContainer.propTypes = {
    target: PropTypes.object.isRequired
};

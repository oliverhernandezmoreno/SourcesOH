import * as React from 'react';
import {Popup} from 'react-leaflet';
import {JSXMarker} from '@app/components/map/JSXMarker';
import {RemoteStatusIcon} from '@authorities/components/RemoteStatusIcon';
import {getRemoteStatus} from '@authorities/services/remote';
import {AlertStatusIcon} from '@authorities/components/AlertStatusIcon';
import {
    NO_ALERT_COLOR,
    YELLOW_ALERT_COLOR,
    RED_ALERT_COLOR
} from '@authorities/constants/alerts';
import PropTypes from 'prop-types';
import {Table, TableBody, TableCell, TableRow} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';
import {Link} from 'react-router-dom';
import {reverse} from '@app/urls';

const iconAnchor = [20, 38];
const popupAnchor = [0, -33];
const fontSize = '40px';

const styles = theme => ({
    table: {
        minWidth: 300,
    },
    tableCell: {
        fontSize: '10pt',
        color: theme.palette.grey[900]
    }
});

export const TargetMarker = withStyles(styles)(({target, color, classes, ...rest}) => {
    const targetName = target.name || '--';
    const stateName = target.state || '--';
    const entityName = target.work_sites && target.work_sites.length > 0 ?
        target.work_sites[0].entity.name : "--";
    const regionName = target.zone && target.zone.zone_hierarchy.length > 0 ?
        target.zone.zone_hierarchy[1].name : "--";
    const comunaName = target.zone ? target.zone.name : "--";
    const workSiteName = target.work_sites && target.work_sites.length > 0 ?
        target.work_sites[0].name : '--';

    return (
        <JSXMarker
            {...rest}
            position={[target.deg_coords.lat, target.deg_coords.lng]}
            iconAnchor={iconAnchor}
            popupAnchor={popupAnchor}
        >
            <Popup>
                <Table className={classes.table}>
                    <TableBody>
                        <TableRow>
                            <TableCell className={classes.tableCell}>Depósito:</TableCell>
                            <TableCell className={classes.tableCell}>{targetName}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className={classes.tableCell}>Estado:</TableCell>
                            <TableCell className={classes.tableCell}>{stateName}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className={classes.tableCell}>Conexión:</TableCell>
                            <TableCell className={classes.tableCell}><RemoteStatusIcon status={getRemoteStatus(target.remote)}/></TableCell>
                        </TableRow>
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
                        <TableRow>
                            <TableCell colSpan={2}>
                                <Link
                                    to={reverse('authorities.target.semaphores', {target: target.canonical_name})}
                                >
                                    Monitorear semáforos
                                </Link>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Popup>
            <div style={{fontSize: fontSize}}>
                <AlertStatusIcon marker color={color}/>
            </div>
        </JSXMarker>
    );
});


TargetMarker.propTypes = {
    target: PropTypes.object.isRequired,
    color: PropTypes.oneOf([
        NO_ALERT_COLOR,
        YELLOW_ALERT_COLOR,
        RED_ALERT_COLOR
    ]).isRequired
};

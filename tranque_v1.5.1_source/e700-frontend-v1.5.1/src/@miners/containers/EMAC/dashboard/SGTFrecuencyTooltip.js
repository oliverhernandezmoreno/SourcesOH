import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import moment from 'moment/moment';
import classNames from 'classnames';
import {Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography} from '@material-ui/core';
import {DEFAULT_STG_FREQUENCY} from '@miners/containers/EMAC/dashboard/constants';

const textColor = '#000000';

const styles = theme => ({
    root: {
        backgroundColor: '#ffffff',
        padding: theme.spacing(1),
        color: textColor,
        maxWidth: 'none'
    },
    cell: {
        color: textColor,
        whiteSpace: 'nowrap'
    },
    tableHeader: {
        color: textColor,
        whiteSpace: 'nowrap'
    },
    statusNotOk: {
        color: '#FF2700'
    }
});

const SGTFrecuencyTooltip = withStyles(styles)((props) => {
    const {classes, source, timeseries, children} = props;

    const defaultFromDate = moment().subtract(DEFAULT_STG_FREQUENCY, 'minutes');
    const renderRow = (ts, tsi) => {
        let status = 'Sin datos disponibles';
        let notOk = true;
        if (ts.events.length > 0) {
            let fromDate;
            if (ts.frequencies.length > 0) {
                fromDate = moment().subtract(+ts.frequencies[0].minutes, 'minutes');
            } else {
                fromDate = defaultFromDate;
            }
            const date = ts.events[0].date;
            if (date.isSameOrAfter(fromDate)) {
                status = 'Cumple frecuencia esperada';
                notOk = false;
            } else {
                status = 'No cumple frecuencia esperada';
            }
        }
        return (
            <TableRow key={tsi}>
                <TableCell className={classes.cell}>{ts.description}</TableCell>
                <TableCell className={classNames(classes.cell, {
                    [classes.statusNotOk]: notOk
                })}>{status}</TableCell>
            </TableRow>
        );
    };

    return (
        <Tooltip
            classes={{tooltip: classes.root}}
            placement="right"
            title={<>
                <Typography variant="h6">{source.name}</Typography>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell className={classes.tableHeader}>Variable</TableCell>
                            <TableCell className={classes.tableHeader}>Disponibilidad del dato</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {timeseries.length === 0 && <TableRow>
                            <TableCell className={classes.cell} colSpan={2}>
                                No hay variables para mostrar
                            </TableCell>
                        </TableRow>}
                        {timeseries.map(renderRow)}
                    </TableBody>
                </Table>
            </>}>
            {children}
        </Tooltip>
    );
});

SGTFrecuencyTooltip.propTypes = {
    source: PropTypes.object.isRequired,
    timeseries: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default SGTFrecuencyTooltip;

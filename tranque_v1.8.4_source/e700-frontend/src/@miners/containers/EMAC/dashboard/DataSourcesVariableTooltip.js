import React from 'react';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/core/styles';
import {Table, TableBody, TableCell, TableRow, Tooltip, Typography} from '@material-ui/core';
import {formatDecimal} from '@app/services/formatters';

const textColor = '#000000';

const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: '#ffffff',
        padding: theme.spacing(1),
        color: textColor,
        maxWidth: 'none'
    },

    cell: {
        color: textColor,
        whiteSpace: 'nowrap'
    }
}));

export function DataSourcesVariableTooltip({timeseries, children}) {
    const classes = useStyles();

    const lastEvent = timeseries.events.length > 0 ? timeseries.events[0] : null;
    const value = lastEvent ? formatDecimal(lastEvent.value, 3) : '-- ';
    const date = lastEvent ? lastEvent.date.format('DD.MM.YYYY') : '--.--.--';
    const hour = lastEvent ? lastEvent.date.format('HH:mm') : '--:--';
    const timezone = lastEvent ? lastEvent.date.format('(Z)') : '(--:--)';
    const unit = timeseries.unit ? timeseries.unit.abbreviation : '--';
    let frequency = '--';
    if (timeseries.frequencies.length > 0) {
        frequency = +timeseries.frequencies[0].minutes;
    }

    return (
        <Tooltip
            classes={{tooltip: classes.root}}
            placement="top-start"
            title={<>
                <Typography variant="h6">{timeseries.description}</Typography>
                <Table size="small">
                    <TableBody>
                        <TableRow>
                            <TableCell className={classes.cell}>
                                <b>Frecuencia esperada</b>
                            </TableCell>
                            <TableCell className={classes.cell}>
                                {frequency} minutos
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className={classes.cell}>
                                <b>Último valor</b>
                            </TableCell>
                            <TableCell className={classes.cell}>
                                {value} [{unit}]
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className={classes.cell}>
                                <b>Fecha y hora</b>
                            </TableCell>
                            <TableCell className={classes.cell}>
                                {date} {hour} {timezone}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </>}>
            {children}
        </Tooltip>
    );
}

DataSourcesVariableTooltip.propTypes = {
    timeseries: PropTypes.object.isRequired
};

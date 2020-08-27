import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import {Close} from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton';
import * as config from '@app/config';
import moment from 'moment/moment';
import classNames from 'classnames';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from '@material-ui/core';
import {DEFAULT_VARIABLE_FREQUENCY} from '@miners/containers/EMAC/dashboard/constants';
import {sortByDescription} from '@app/services/backend/timeseries';

const textColor = '#000000';

const styles = theme => ({
    root: {
        backgroundColor: '#ffffff',
        color: textColor
    },
    cell: {
        color: textColor
    },
    cellNoWrap: {
        color: textColor,
        whiteSpace: 'nowrap'
    },
    tableHeader: {
        color: textColor,
        whiteSpace: 'nowrap'
    },
    statusNotOk: {
        color: '#FF2700'
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(0.5),
        top: theme.spacing(0.5),
        color: theme.palette.grey[500]
    }
});

const VariableDialog = withStyles(styles)((props) => {
    const {classes, source, onClose, open} = props;
    const timeseries = [...props.timeseries].sort(sortByDescription);

    const now = moment();
    const renderRow = (ts, tsi) => {
        let status = 'Sin información';
        let notOk = false;
        let dateStr = '--';
        let nextDateStr = '--';
        if (ts.events.length > 0) {
            const date = ts.events[0].date;
            dateStr = date.format(config.DATE_FORMAT);
            let nextDate = moment(date);
            if (ts.frequencies.length > 0) {
                nextDate.add(+ts.frequencies[0].minutes, 'minutes');
            } else {
                nextDate.add(DEFAULT_VARIABLE_FREQUENCY, 'minutes');
            }
            if (nextDate.isSameOrAfter(now)) {
                status = 'Actualizado';
                nextDateStr = nextDate.format(config.DATE_FORMAT);
            } else {
                const daysDiff = now.diff(nextDate, 'days');
                status = `Atrasado ${daysDiff} días`;
                nextDateStr = '';
                notOk = true;
            }
        }
        return (
            <TableRow key={tsi}>
                <TableCell className={classes.cell}>{ts.description}</TableCell>
                <TableCell className={classes.cellNoWrap}>{dateStr}</TableCell>
                <TableCell className={classNames(classes.cellNoWrap, {
                    [classes.statusNotOk]: notOk
                })}>{status}</TableCell>
                <TableCell className={classes.cellNoWrap}>{nextDateStr}</TableCell>
            </TableRow>
        );
    };

    return (
        <Dialog
            maxWidth="md" onClose={onClose} open={open}
            PaperProps={{className: classes.root}}>
            <DialogTitle disableTypography>
                <Typography variant="h6">{source.name}</Typography>
                <Typography variant="subtitle2">La frecuencia de ingreso de datos no debe exceder los 30
                    días.</Typography>
                {onClose ? (
                    <IconButton aria-label="Close" className={classes.closeButton} onClick={onClose}>
                        <Close/>
                    </IconButton>
                ) : null}
            </DialogTitle>
            <DialogContent>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell className={classes.tableHeader}>Variable</TableCell>
                            <TableCell className={classes.tableHeader}>Fecha última medición</TableCell>
                            <TableCell className={classes.tableHeader}>Status</TableCell>
                            <TableCell className={classes.tableHeader}>Fecha máxima próxima medición</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {timeseries.length === 0 && <TableRow>
                            <TableCell className={classes.cellNoWrap} colSpan={4}>
                                No hay variables para mostrar
                            </TableCell>
                        </TableRow>}
                        {timeseries.map(renderRow)}
                    </TableBody>
                </Table>
            </DialogContent>
        </Dialog>
    );
});

VariableDialog.propTypes = {
    source: PropTypes.object.isRequired,
    timeseries: PropTypes.arrayOf(PropTypes.object).isRequired,
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired
};

export default VariableDialog;

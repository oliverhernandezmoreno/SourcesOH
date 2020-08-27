import React, { Component } from 'react';
import {history} from '@app/history';
import {reverse} from '@app/urls';
import { Typography, Button, Link, withStyles,
    Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from '@material-ui/core';
import TMaterialTable from '@app/components/utils/TMaterialTable';
import {AlertStatusIcon} from '@authorities/components/AlertStatusIcon';
import {BlueButton} from '@authorities/theme';
import { YELLOW_ALERT_COLOR, RED_ALERT_COLOR, DISCONNECTED_ALERT_COLOR } from '@authorities/constants/alerts';
import * as config from '@app/config';
import {ConsoleHelper} from '@app/ConsoleHelper';

const styles = theme => ({
    root: {
        padding: theme.spacing(2)
    },
});

class SemaphoreHistoryTable extends Component {
    state = {
        openDialog: false,
        selectedDisconnection: null,
    };

    handleOpenDialog = (disconnection) => {
        this.setState({
            openDialog: true,
            selectedDisconnection: disconnection
        });
    };

    handleCloseDialog = () => {
        this.setState({
            openDialog: false,
            selectedDisconnection: null,
        });
    };

    handleRequest = () => {
        ConsoleHelper("close dialog", "log");
    }

    render() {
        const {classes, data} = this.props;
        return (
            <div className={classes.root}>
                <TMaterialTable
                    data={(data && data.map(this.normalizeData)) || []}
                    columns={this.getMonitoringColumns()}
                    options={{
                        search: false,
                        toolbar: false,
                    }}/>
                {this.renderGraySemaphoreDialog()}
            </div>
        );
    }

    renderGraySemaphoreDialog() {
        const {target, services: {downloadDisconnectionFile}} = this.props;
        const {openDialog, selectedDisconnection} = this.state;
        return (<Dialog open={openDialog} onClose={this.handleCloseDialog}>
            <DialogTitle>Justificación anexada a la desconexión</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Justificación ingresada:
                </DialogContentText>
                <DialogContentText>
                    {selectedDisconnection?.disconnectionData.comment ?? "-"}
                </DialogContentText>
                <DialogContentText>
                    Archivos cargados:
                </DialogContentText>
                {selectedDisconnection?.disconnectionData.documents.length > 0
                    ? (<ul>{selectedDisconnection.disconnectionData.documents.map(doc => (
                        <li key={doc.id}>
                            <Link
                                component="button"
                                color="textPrimary"
                                variant="body2"
                                onClick={() => {
                                    downloadDisconnectionFile(
                                        target,
                                        selectedDisconnection.disconnectionData.id,
                                        doc.id,
                                        doc.name
                                    )}
                                }>
                                {doc.name}
                            </Link>
                        </li>
                    ))}</ul>)
                    : "-"
                }
            </DialogContent>
            <DialogActions>
                <Button onClick={this.handleCloseDialog} variant='contained' color="primary">Ok</Button>
            </DialogActions>
        </Dialog>);
    }

    normalizeData(d) {
        return {...d, from: d.x0.format(config.DATE_FORMAT), to: d.x.format(config.DATE_FORMAT)};
    }

    renderComplementaryInfo(data) {
        if (data.color === YELLOW_ALERT_COLOR || data.color === RED_ALERT_COLOR) {
            return (<BlueButton disableElevation onClick={() => this.goToTicket(data.target, data.ticketId, data.status)}>Ver ticket asociado</BlueButton>);
        } else if (data.color === DISCONNECTED_ALERT_COLOR) {
            return (<BlueButton disableElevation onClick={() => this.handleOpenDialog(data)}>Justificación</BlueButton>);
        }
    }

    getMonitoringColumns() {
        return [
            {
                title: (<Typography variant="subtitle2">Estado</Typography>),
                field: 'status',
                render: (data) => (
                    <AlertStatusIcon
                        id={data.tableData.id}
                        color={!data.disconnectedColor ? data.color : data.disconnectedColor}
                        disconnected={data.disconnectedColor ? true: false}
                        size="default" />
                ),
            },
            {
                title: (<Typography variant="subtitle2">Desde</Typography>),
                field: 'from'
            },
            {
                title: (<Typography variant="subtitle2">Hasta</Typography>),
                field: 'to'
            },
            {
                title: (<Typography variant="subtitle2">Resumen Genérico</Typography>),
                field: 'publicAlertAbstract',
            },
            {
                title: (<Typography variant="subtitle2">Mensaje Público</Typography>),
                field: 'publicMessage',
            },
            {
                title: (<Typography variant="subtitle2">Información Complementaria</Typography>),
                render: data => this.renderComplementaryInfo(data)
            },
        ];
    }

    goToTicket(target, ticketId, status) {
        const {scope} = this.props;
        history.push(reverse('authorities.target.tickets.'+scope+'.'+status+'.detail', {target, ticketId}));
    }

}

export default withStyles(styles)(SemaphoreHistoryTable);

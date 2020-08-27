import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {forkJoin} from 'rxjs';
import {Route, Switch} from 'react-router';
import {Grid, Box, Typography, styled} from '@material-ui/core';
import {route} from '@app/urls';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import SemaphoreStatus from '@authorities/components/target/semaphore/SemaphoreStatus';
import SemaphoreHistory from '@authorities/components/target/semaphore/SemaphoreHistory';
import SemaphoreManualAlert from '@authorities/components/target/semaphore/SemaphoreManualAlert';
import SemaphoreAlertConnection from '@authorities/components/target/semaphore/SemaphoreAlertConnection';
import {getAlertColor, getWorstActiveAlert} from '@authorities/services/tickets';
import {hasActiveDisconnection} from '@authorities/services/disconnections';
import * as TicketsService from '@app/services/backend/tickets';
import * as DisconnectionsService from '@app/services/backend/disconnections';
import * as ManualAlertLogService from '@app/services/backend/manualAlerts';
import * as moment from 'moment';
import * as config from '@app/config';
import {COLORS} from '@authorities/theme.js';
import {snackbarActions} from '@app/actions/snackbar.actionCreators';
import {DISCONNECTED_ALERT} from '@alerts_events/constants/ticketGroups';

const EmptyChoiceBox = styled(Box)({
    background: COLORS.primary.main,
    borderRadius: 8,
    padding: 24,
    marginTop: 24
});

const EF_CANONICAL_NAME = 'ef';
const EMAC_CANONICAL_NAME = 'emac';

class TargetSemaphores extends SubscribedComponent {

    state = {
        initialLoading: false,
        initialLoadText: "",
        tickets: [],
        disconnections: [],
        manualAlertLogs: [],
        publicMessages: [],
        activeAlerts: {ef: false, emac: false},
    };

    /**
     * Function triggered to get target tickets from tickets end-point.
     *
     * @public
     */
    loadData() {
        const {target} = this.props.match.params;

        this.setState({
            initialLoading: true,
            initialLoadText: 'cargando tickets...',
        });

        this.subscribe(
            forkJoin({
                tickets: TicketsService.listAll({target}),
                publicMessages: TicketsService.readPublicAlertMessages({target}),
                disconnections: DisconnectionsService.readAlertDisconnections({target})
            }),
            ({tickets, disconnections, publicMessages}) => {
                this.setState(state => ({
                    tickets,
                    publicMessages,
                    disconnections,
                    initialLoading: false,
                    lastUpdate: moment().format(config.DATETIME_FORMAT)
                }));
            },
            (err) => this.setState({loadError: true, initialLoading: false})
        );
    }

    /**
     * Function triggered to create an alert disconnection.
     *
     * @public
     */
    disconnectAlert = (target, scope, newPublicMessage, files, comment) => {
        this.subscribe(
            forkJoin({
                resDisconnectionAlert: DisconnectionsService.addNewAlertDisconnection({
                    target,
                    scope,
                    comment
                }),
                resPublicMessage: TicketsService.addNewPublicAlertMessage({
                    target,
                    scope,
                    alertType: DISCONNECTED_ALERT,
                    content: newPublicMessage,
                }),
            }),
            ({resDisconnectionAlert, resPublicMessage}) => {
                this.setState(state => ({
                    disconnections: [resDisconnectionAlert.data, ...state.disconnections],
                    publicMessages: [resPublicMessage.data, ...state.publicMessages]
                }));
                if (files?.length > 0) {
                    const filesSuccessArray = [];
                    files.forEach(file => {
                        this.subscribe(
                            DisconnectionsService.uploadAlertDisconnectionFile({
                                target,
                                disconnectionId: resDisconnectionAlert.data.id,
                                file
                            }),
                            res => filesSuccessArray.push(true),
                            err => filesSuccessArray.push(false),
                            () => {
                                // Last file added  
                                if (filesSuccessArray.length === files.length && filesSuccessArray.every(fileSuccess => fileSuccess)) {
                                    this.props.actions.openSnackbar(
                                        "Alerta desconectada exitósamente",
                                        "success",
                                        null,
                                        4000
                                    );
                                } else if (filesSuccessArray.length === files.length){
                                    this.props.actions.openSnackbar(
                                        "No se han podido cargar todos los archivos",
                                        "error",
                                        null,
                                        4000
                                    );
                                }
                            }
                        );
                    });
                }
            },
            err => {
                this.props.actions.openSnackbar(
                    "No se ha podido desconectar el semáforo",
                    "error",
                    null,
                    4000
                );
            }
        );
    }

    /**
     * Function triggered to close an alert disconnection.
     *
     * @public
     */
    connectAlert = (target, disconnectionId) => {
        this.subscribe(
            DisconnectionsService.connectAlertDisconnection({
                target,
                disconnectionId,
                closed_at: moment().toISOString()
            }),
            res => {
                this.setState(state => ({
                    disconnections: state.disconnections.map(d => {
                        d.closed = d.id === res.data.id ? true : d.closed;
                        return d;
                    })
                }));
                this.props.actions.openSnackbar(
                    "Semáforo conectado exitósamente",
                    "success",
                    null,
                    4000
                );
            },
            err => {
                this.props.actions.openSnackbar(
                    "No se ha podido conectar el semáforo",
                    "error",
                    null,
                    4000
                );
            }
        );
    }

    /**
     * Function triggered to download an alert disconnection file justification
     *
     * @public
     */
    downloadDisconnectionFile = (target, disconnectionId, documentId, filename) => {
        return this.subscribe(
            DisconnectionsService.downloadAlertDisconnectionFile({
                target,
                disconnectionId,
                documentId,
                filename
            })
        );
    }

    /**
     * Function triggered to create an alert disconnection.
     *
     * @public
     */
    manualAlertCreation = (target, scope, alertType, newPublicMessage, files, comment) => {
        this.subscribe(
            TicketsService.createIntent({
                target,
                module: '_.'+scope+'.alert',
                state: alertType,
                archived: false,
            }),
            res => {
                const newTicket = res.tickets[0];
                this.setState(state => ({
                    tickets: [newTicket, ...state.tickets]
                }));
                this.subscribe(
                    forkJoin({
                        resManualAlertLog: ManualAlertLogService.addNewManualAlertLog({
                            target,
                            ticketId: newTicket.id,
                            scope,
                            comment
                        }),
                        resPublicMessage: TicketsService.addNewPublicAlertMessage({
                            target,
                            scope,
                            alertType,
                            content: newPublicMessage,
                        })
                    }),
                    ({resManualAlertLog, resPublicMessage}) => {
                        this.setState(state => ({
                            manualAlertLogs: [resManualAlertLog.data, ...state.manualAlertLogs],
                            publicMessages: [resPublicMessage.data, ...state.publicMessages]
                        }));
                        if (files?.length > 0) {
                            const filesSuccessArray = [];
                            files.forEach(file => {
                                this.subscribe(
                                    ManualAlertLogService.uploadManualAlertLogFile({
                                        target,
                                        ticketId: newTicket.id,
                                        manualAlertLogId: resManualAlertLog.data.id,
                                        file
                                    }),
                                    res => filesSuccessArray.push(true),
                                    err => filesSuccessArray.push(false),
                                    () => {
                                        // Last file added  
                                        if (filesSuccessArray.length === files.length 
                                        && filesSuccessArray.every(fileSuccess => fileSuccess)) {
                                            this.props.actions.openSnackbar(
                                                "Alerta creada exitósamente",
                                                "success",
                                                null,
                                                4000
                                            );
                                        } else if (filesSuccessArray.length === files.length){
                                            this.props.actions.openSnackbar(
                                                "No se han podido cargar todos los archivos",
                                                "error",
                                                null,
                                                4000
                                            );
                                        }
                                    }
                                );
                            });
                        }
                    },
                    err => {
                        this.props.actions.openSnackbar(
                            "No se ha podido crear la alerta manual",
                            "error",
                            null,
                            4000
                        );
                    }
                );
            },
            err => {
                this.props.actions.openSnackbar(
                    "No se ha podido crear la alerta manual",
                    "error",
                    null,
                    4000
                );
            }
        );
        
    }

    /**
     * Function triggered to download a manual alert log file justification
     *
     * @public
     */
    downloadManualAlertLogFile = (target, ticketId, manualAlertLogId, documentId, filename) => {
        return this.subscribe(
            ManualAlertLogService.downloadManualAlertLogFile({
                target,
                ticketId,
                manualAlertLogId,
                documentId,
                filename
            })
        );
    }

    /**
     * Function triggered to create a public message when a semaphore is green (i.e. doesn't have alerts)
     *
     * @public
     */
    updatePublicAlertMessage = (content, scope, alertType) => {
        const {target} = this.props.match.params;
        this.subscribe(
            TicketsService.addNewPublicAlertMessage({
                content,
                scope,
                target,
                alertType,
            }),
            res => {
                this.setState(state => ({
                    publicMessages: [res.data, ...state.publicMessages]
                }));
                this.props.actions.openSnackbar(
                    "Mensaje público "+scope.toUpperCase()+" actualizado exitósamente",
                    "success",
                    null,
                    4000
                );
            },
            err => {
                this.props.actions.openSnackbar(
                    "No se pudo actualizar el mensaje público",
                    "error",
                    null,
                    4000
                );
            }
        );
    }

    getLastPublicMessage = (scope) => {
        const {publicMessages} = this.state;
        const filteredMessages = (publicMessages || []).filter(pm => pm.scope === scope);
        return filteredMessages.length > 0 ? filteredMessages[0] : null; // Since list of messages is ordered descendingn by date
    }

    componentDidMount() {
        this.loadData();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.tickets !== this.state.tickets){
            this.setState({
                activeAlerts: {
                    ef: !!getWorstActiveAlert(this.state.tickets, EF_CANONICAL_NAME), 
                    emac: !!getWorstActiveAlert(this.state.tickets, EMAC_CANONICAL_NAME)
                }
            });
        }
    }

    render() {
        const {target} = this.props.match.params;
        const {tickets, disconnections, publicMessages, activeAlerts} = this.state;
        return (
            <Box>
                <Typography variant="h5" style={{margin: '16px 0'}}>Estado de los Semáforos del Sitio Público</Typography>
                <Typography style={{margin: '16px 0'}}>{this.state.initialLoading && this.state.initialLoadText}</Typography>
                <Box mb={4}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <SemaphoreStatus
                                target={target}
                                ticket={getWorstActiveAlert(tickets, EF_CANONICAL_NAME)}
                                publicMessage={this.getLastPublicMessage(EF_CANONICAL_NAME)}
                                scope={EF_CANONICAL_NAME}
                                alertStatusColor={getAlertColor(this.state.tickets, EF_CANONICAL_NAME)}
                                services={{updatePublicAlertMessage: this.updatePublicAlertMessage}}
                                disconnected={hasActiveDisconnection(disconnections, EF_CANONICAL_NAME)}/>
                        </Grid>
                        <Grid item xs={6}>
                            <SemaphoreStatus
                                target={target}
                                ticket={getWorstActiveAlert(tickets, EMAC_CANONICAL_NAME)}
                                publicMessage={this.getLastPublicMessage(EMAC_CANONICAL_NAME)}
                                scope={EMAC_CANONICAL_NAME}
                                alertStatusColor={getAlertColor(this.state.tickets, EMAC_CANONICAL_NAME)}
                                services={{updatePublicAlertMessage: this.updatePublicAlertMessage}}
                                disconnected={hasActiveDisconnection(disconnections, EMAC_CANONICAL_NAME)}/>
                        </Grid>
                    </Grid>
                </Box>

                { this.props.menuNav || null }

                <Switch>
                    <Route path={route('authorities.target.semaphores.history')}
                        component={(props) => <SemaphoreHistory {...props}
                            data={{tickets, disconnections, publicMessages}}
                            services={{
                                downloadDisconnectionFile: this.downloadDisconnectionFile
                            }}/>}/>
                    <Route path={route('authorities.target.semaphores.create')}
                        component={(props) => <SemaphoreManualAlert {...props}
                            data={{activeAlerts}}
                            services={{
                                alertCreation: this.manualAlertCreation
                            }}/>}/>
                    <Route path={route('authorities.target.semaphores.connection')}
                        component={(props) => <SemaphoreAlertConnection {...props}
                            data={{tickets, disconnections}}
                            services={{
                                disconnection: this.disconnectAlert,
                                connection: this.connectAlert,
                                getLastPublicMessage: this.getLastPublicMessage
                            }}/>}/>
                    <Route exact path={route('authorities.target.semaphores')}
                        render={(props) => (
                            <EmptyChoiceBox><Typography variant="h5" align="center">Seleccione una opción</Typography></EmptyChoiceBox>
                        )}/>
                </Switch>
            </Box>
        );
    }
}

function mapStateToProps(state) {
    return { user: state.auth.user };
}

function mapDispatchToProps(dispatch) {
    return { actions: bindActionCreators(snackbarActions, dispatch) };
}

export default connect(mapStateToProps, mapDispatchToProps)(TargetSemaphores);

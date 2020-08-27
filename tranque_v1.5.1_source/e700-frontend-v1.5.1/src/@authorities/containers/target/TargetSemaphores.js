import React from 'react';
import {forkJoin} from 'rxjs';
import {Route, Switch} from 'react-router';
import {Grid, Box, Typography, styled} from '@material-ui/core';
import {route} from '@app/urls';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import SemaphoreStatus from '@authorities/components/target/semaphore/SemaphoreStatus';
import SemaphoreHistory from '@authorities/components/target/semaphore/SemaphoreHistory';
import SemaphoreManualAlert from '@authorities/components/target/semaphore/SemaphoreManualAlert';
import SemaphoreAlertConnection from '@authorities/components/target/semaphore/SemaphoreAlertConnection';
import { getAlertColor, getWorstActiveAlert} from '@authorities/services/tickets';
import * as TicketsService from '@app/services/backend/tickets';
import * as moment from 'moment';
import * as config from '@app/config';
import {COLORS} from '@authorities/theme.js';

const EmptyChoiceBox = styled(Box)({
    background: COLORS.primary.main,
    borderRadius: 8,
    padding: 24,
    marginTop: 24
});

const EF_CANONICAL_NAME = 'ef';
const EMAC_CANONICAL_NAME = 'emac';

export class TargetSemaphores extends SubscribedComponent {

    state = {
        initialLoading: false,
        initialLoadText: "",
        tickets: null,
        disconnections: null,
        publicMessages: null
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
                disconnections: TicketsService.readAlertDisconnections({target}),
                publicMessages: TicketsService.readPublicAlertMessages({target})
            }),
            ({tickets, disconnections, publicMessages}) => {
                this.setState(state => ({
                    tickets,
                    disconnections,
                    publicMessages,
                    initialLoading: false,
                    lastUpdate: moment().format(config.DATETIME_FORMAT)
                }));
            },
            (err) => this.setState({loadError: true, initialLoading: false})
        );
    }

    disconnectAlert(target, scope, comment, files, callback) {
        this.subscribe(
            TicketsService.addNewAlertDisconnection({target, scope, comment}),
            obj => {
                this.setState({disconnections: [obj, ...this.state.disconnections]});
                if (files.length > 0) {
                    const filesSuccessArray = [];
                    files.forEach(file =>
                        this.subscribe(
                            TicketsService.uploadAlertDisconnectionFile({
                                target,
                                disconnection_id: obj.data.id,
                                file,
                                // meta: {comment: {value: obj.data.id}}
                            }),
                            (res) => {
                                filesSuccessArray.push(true);
                            },
                            error => {
                                filesSuccessArray.push(false);
                            }
                        )
                    );
                    if (filesSuccessArray.every(fileSuccess => fileSuccess)){
                        callback("Semáforo "+scope.toUpperCase()+" desconectado exitósamente");
                    }else{
                        callback("No se han podido cargar todos los archivos");
                    }
                }
            },
            err => callback("No se ha podido desconectar el semáforo")
        );
    }

    connectAlert(disconnectionId, callback) {
    }

    getLastPublicMessage(scope) {
        // const {publicMessages} = this.state;
        const publicMessages = [];
        const filteredMessages = (publicMessages || []).filter(pm => pm.scope === scope);
        return filteredMessages.length > 0 ? filteredMessages[0] : null; // Since list of messages is ordered descending
    }

    componentDidMount() {
        this.loadData();
    }

    render() {
        const {target} = this.props.match.params;
        const {tickets, disconnections, publicMessages} = this.state;
        return (
            <Box>
                <Typography variant="h5" style={{margin: '16px 0'}}>Estado de los Semáforos del Sitio Público</Typography>
                <Typography style={{margin: '16px 0'}}>{this.state.initialLoading && this.state.initialLoadText}</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <SemaphoreStatus
                            target={target}
                            ticket={getWorstActiveAlert(tickets, EF_CANONICAL_NAME)}
                            publicMessage={this.getLastPublicMessage(EF_CANONICAL_NAME)}
                            scope={EF_CANONICAL_NAME}
                            alertStatusColor={getAlertColor(this.state.tickets, EF_CANONICAL_NAME)}/>
                    </Grid>
                    <Grid item xs={6}>
                        <SemaphoreStatus
                            target={target}
                            ticket={getWorstActiveAlert(tickets, EMAC_CANONICAL_NAME)}
                            publicMessage={this.getLastPublicMessage(EMAC_CANONICAL_NAME)}
                            scope={EMAC_CANONICAL_NAME}
                            alertStatusColor={getAlertColor(this.state.tickets, EMAC_CANONICAL_NAME)}/>
                    </Grid>
                </Grid>

                <br></br>

                { this.props.menuNav || null }
                <Switch>
                    <Route path={route('authorities.target.semaphores.history')}
                        component={(props) => <SemaphoreHistory {...props} data={{tickets, disconnections}}/>}/>
                    <Route path={route('authorities.target.semaphores.create')}
                        component={(props) => <SemaphoreManualAlert {...props}/>}/>
                    <Route path={route('authorities.target.semaphores.connection')}
                        component={(props) => <SemaphoreAlertConnection {...props}
                            data={{tickets, disconnections, publicMessages}}
                            services={{
                                disconnection: (scope, comment, files, errorCallback) => this.disconnectAlert(target, scope, comment, files, errorCallback)
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

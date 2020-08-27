import React from 'react';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import * as TicketsService from '@app/services/backend/tickets';
import {Grid, withStyles} from '@material-ui/core';
import SubMenu from '@authorities/containers/layout/SubMenu';
import {Route, Switch} from 'react-router';
import {connect} from 'react-redux';
import {reverse, route} from '@app/urls';
import {Redirect} from 'react-router-dom';
import RequestsList from '@alerts_events/components/requests/RequestsList';
import { PENDING, isResolved } from '@alerts_events/constants/authorizationStates';
import { isReceivedRequest, isRequestedRequest } from '@alerts_events/constants/userActions';
import { CLOSED } from '@alerts_events/constants/ticketGroups';

const styles = theme => ({
    subMenu: {
        marginBottom: 20,
    }
});

export function getTypedRequests(user, requests) {
    const activeTicketRequests = requests ? requests.filter(req=> req.ticket.state !== CLOSED) : [];
    return {
        pendingReceivedRequests: activeTicketRequests.filter(req=> req.status===PENDING && isReceivedRequest(user, req)),
        resolvedReceivedRequests: activeTicketRequests.filter(req=> isResolved(req) && isReceivedRequest(user, req)),
        pendingRequestedRequests: activeTicketRequests.filter(req=> req.status===PENDING && isRequestedRequest(user, req)),
        resolvedRequestedRequests: activeTicketRequests.filter(req=> isResolved(req) && isRequestedRequest(user, req))
    }
}

const PETITIONER = 'solicitante';
const AUTHORIZER = 'autorizador';

/**
 * A container for listing all ticket authorization requests.
 *
 * @version 1.0.0
 * @author [Natalia Vidal](https://gitlab.com/nattoV)
 */
class RequestsListContainer extends SubscribedComponent {

    state = {
        loading: false,
        loadError: false,
        pendingReceivedRequests: [],
        resolvedReceivedRequests: [],
        pendingRequestedRequests: [],
        resolvedRequestedRequests: []
    };

    componentDidMount() {
        this.getRequests();
    }

    getUserRouteString() {
        const {location} = this.props;
        if (location.pathname.includes('/autoridades/solicitudes')) {
            return 'authorities';
        }
        if (location.pathname.includes('/mineras/solicitudes')) {
            return 'miners';
        }
        else return '';
    }

    getRequests() {
        const {user} = this.props;
        this.setState({ loadError: false, loading: true });
        this.subscribe(
            TicketsService.readNationalAuthorizationRequests(),
            data => {
                const requests = data.data && data.data.results ? data.data.results : [];
                this.setState(getTypedRequests(user, requests));
            },
            (err) => this.setState({ loadError: true, loading: false }),
            res => this.setState({loading: false})
        );
    }

    getMenuItems(num_pendingReceived, num_pendingRequested, num_resolvedReceived, num_resolvedRequested) {
        const userRoute = this.getUserRouteString();
        return [
            { subtitle: ''},
            { subtitle: 'Solicitudes recibidas' },
            {
                title: 'Por resolver (' + num_pendingReceived + ')',
                path: reverse(userRoute + '.requests.pendingReceived')
            },
            {
                title: 'Resueltas (' + num_resolvedReceived + ')',
                path: reverse(userRoute + '.requests.resolvedReceived')
            },
            { subtitle: '' },
            { subtitle: 'Autorizaciones solicitadas' },
            {
                title: 'Esperando resolución (' + num_pendingRequested + ')',
                path: reverse(userRoute + '.requests.pendingRequested')
            },
            {
                title: 'Resueltas (' + num_resolvedRequested + ')',
                path: reverse(userRoute + '.requests.resolvedRequested')
            }
        ];
    }

    render() {
        const {loading, loadError,
            pendingReceivedRequests,
            pendingRequestedRequests,
            resolvedReceivedRequests,
            resolvedRequestedRequests} = this.state;
        const {classes, user} = this.props;
        const userRoute = this.getUserRouteString();
        const listProps = {loading, loadError, userRoute, user};
        return (<>
            <Grid container alignItems="stretch">
                <Grid item xs={12} sm={3} className={classes.subMenu}>
                    <SubMenu
                        title='Solicitudes y autorizaciones'
                        items={this.getMenuItems(
                            pendingReceivedRequests.length,
                            pendingRequestedRequests.length,
                            resolvedReceivedRequests.length,
                            resolvedRequestedRequests.length
                        )}/>
                </Grid>
                <Grid item xs={12} sm={9}>
                    <Switch>
                        <Route path={route(userRoute + '.requests.pendingReceived')}
                            render={() =>
                                <RequestsList {...listProps}
                                    title='Solicitudes recibidas pendientes'
                                    requests={pendingReceivedRequests}
                                    userFilters={[PETITIONER]}
                                    type='pendingReceived'
                                />}
                        />
                        <Route path={route(userRoute + '.requests.resolvedReceived')}
                            render={() =>
                                <RequestsList {...listProps}
                                    title='Solicitudes recibidas resueltas'
                                    requests={resolvedReceivedRequests}
                                    userFilters={[PETITIONER, AUTHORIZER]}
                                    type='resolvedReceived'
                                />}
                        />
                        <Route path={route(userRoute + '.requests.pendingRequested')}
                            render={() =>
                                <RequestsList {...listProps}
                                    title='Solicitudes realizadas pendientes'
                                    requests={pendingRequestedRequests}
                                    userFilters={[]}
                                    type='pendingRequested'

                                />}
                        />
                        <Route path={route(userRoute + '.requests.resolvedRequested')}
                            render={() =>
                                <RequestsList {...listProps}
                                    title='Solicitudes realizadas resueltas'
                                    requests={resolvedRequestedRequests}
                                    userFilters={[AUTHORIZER]}
                                    type='resolvedRequested'
                                />}
                        />
                        <Route path={route(userRoute + '.requests')}
                            render={() => <Redirect
                                to={reverse(userRoute + '.requests.pendingReceived')}/>
                            }
                        />
                    </Switch>
                </Grid>
            </Grid>
        </>);
    }
}

function mapStateToProps(state) {
    return {
        user: state.auth.user
    };
}

export default connect(mapStateToProps)(withStyles(styles)(RequestsListContainer));

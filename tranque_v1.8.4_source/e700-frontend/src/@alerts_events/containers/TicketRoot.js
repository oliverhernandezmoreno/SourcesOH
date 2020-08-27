import React from 'react';
import {Route, Switch, withRouter} from 'react-router';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';
import {Subscription} from 'rxjs';
import Grid from '@material-ui/core/Grid';
import * as config from '@app/config';
import {reverse, route} from '@app/urls';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import * as ticketService from '@app/services/backend/tickets';
import * as ZoneService from '@app/services/backend/zone';
import {CLOSED, getGroup, A} from '@alerts_events/constants/ticketGroups';
import TicketMenu from '@alerts_events/components/TicketMenu';
import TicketList from '@alerts_events/components/TicketList';
import { canSeeTicket } from '@alerts_events/constants/userActions';


const pristineState = {
    modules: [],
    tickets: [],
    loading: false,
    errorLoading: false
};

class TicketRoot extends SubscribedComponent {

    state = {
        ...pristineState,
        regions: []
    };

    ticketSub = new Subscription();

    componentDidMount() {
        this.loadData();
        this.getZoneInfo();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.subtitle !== this.props.subtitle) {
            this.loadData();
        }
    }

    loadData() {
        this.setState({errorLoading: false});
        const {target, group} = this.props;
        this.unsubscribeAll();
        this.subscribeInterval(
            config.DEFAULT_REFRESH_TIME,
            ticketService.listAll({target, group}),
            (tickets) => this.setState({...pristineState, tickets}),
            (err) => this.setState({loading: false, errorLoading: true}),
            () => {
            },
            () => this.setState({loading: true})
        );
    }

    getZoneInfo() {
        const {target} = this.props;
        if (target) return null;
        this.subscribe(
            ZoneService.listAll(),
            zones => {
                this.setState({
                    regions: ZoneService.parseZoneOptions(zones)
                });
            }
        );
    }

    render() {
        const {
            location, target, group, subtitle, openPath,
            archivedPath, unevaluablePath, closedPath,
            newPath, basePath, user
        } = this.props;
        const {tickets, errorLoading, regions} = this.state;
        const filteredTickets = tickets.filter(t => !(getGroup(t) === A && !canSeeTicket(user, A)));
        const open = filteredTickets.filter((t) => !t.archived && t.evaluable && t.state !== CLOSED);
        const archived = filteredTickets.filter((t) => t.archived && t.evaluable && t.state !== CLOSED);
        const closed = filteredTickets.filter((t) => t.state === CLOSED);
        const unevaluable = filteredTickets.filter((t) => !t.evaluable);
        const componentProps = {
            errorLoading,
            target,
            group,
            regions,
            user,
            newLink: (t) => reverse(newPath, {target, module: t.module})
        };
        return (
            <Grid container spacing={3} style={{padding: '24px'}}>
                <Grid item xs={3}>
                    <TicketMenu
                        loading={this.state.loading} errorLoading={this.state.errorLoading}
                        subtitle={subtitle}>
                        <TicketMenu.Item
                            total={open.length}
                            link={reverse(openPath, {target})}
                            active={location.pathname === reverse(openPath, {target})}>
                            Activos
                        </TicketMenu.Item>
                        <TicketMenu.Item
                            total={archived.length}
                            link={reverse(archivedPath, {target})}
                            active={location.pathname === reverse(archivedPath, {target})}>
                            Archivados
                        </TicketMenu.Item>
                        <TicketMenu.Item
                            total={unevaluable.length}
                            link={reverse(unevaluablePath, {target})}
                            active={location.pathname === reverse(unevaluablePath, {target})}>
                            No evaluables
                        </TicketMenu.Item>
                        <TicketMenu.Item
                            total={closed.length}
                            link={reverse(closedPath, {target})}
                            active={location.pathname === reverse(closedPath, {target})}>
                            Cerrados
                        </TicketMenu.Item>
                    </TicketMenu>
                </Grid>
                <Grid item xs={9}>
                    <Switch>
                        <Route
                            exact path={route(basePath)}
                            render={() =>
                                <Redirect to={{
                                    pathname: reverse(openPath, {target})
                                }}/>
                            }/>
                        <Route
                            path={route(openPath)}
                            render={() => (
                                <TicketList
                                    {...componentProps}
                                    type={'open'}
                                    tickets={open}
                                    title="Tickets activos"/>
                            )}/>
                        <Route
                            path={route(archivedPath)}
                            render={() => (
                                <TicketList
                                    {...componentProps}
                                    type={'archived'}
                                    tickets={archived}
                                    title="Tickets archivados"/>
                            )}/>
                        <Route
                            path={route(unevaluablePath)}
                            render={() => (
                                <TicketList
                                    {...componentProps}
                                    type={'unevaluable'}
                                    tickets={unevaluable}
                                    title="Tickets no evaluables"/>
                            )}/>
                        <Route
                            path={route(closedPath)}
                            render={() => (
                                <TicketList
                                    {...componentProps}
                                    type={'closed'}
                                    tickets={closed}
                                    title="Tickets cerrados"/>
                            )}/>
                    </Switch>
                </Grid>
            </Grid>
        );
    }
}

function mapStateToProps(state) {
    return {
        user: state.auth.user
    };
}

export default connect(mapStateToProps)(withRouter(TicketRoot));

import React, {Component} from 'react';
import {Typography, withStyles} from '@material-ui/core';
import {history} from '@app/history';
import {reverse, route} from '@app/urls';
import { CLOSED } from '@alerts_events/constants/ticketGroups';
import LinkTabs from '@app/components/utils/LinkTabs';
import {Switch, Route, withRouter} from 'react-router';
import {Redirect} from 'react-router-dom';
import RequestsScopedList from '@alerts_events/components/requests/RequestsScopedList';


const styles = theme => ({
    container: {
        marginBottom: 20,
        padding: 20
    },
    header: {
        marginBottom: '40px'
    }
});

const EF = 'ef';
const EMAC = 'emac';
const EF_EMAC = 'ef-emac';

/**
 * A component for rendering a ticket requests list.
 *
 * @version 1.0.0
 * @author [Natalia Vidal](https://gitlab.com/nattoV)
 */
class RequestsList extends Component {

    onRequestClick(request) {
        const { userRoute } = this.props;
        const scope = request.ticket.scope;
        let type;
        if (request.ticket.state === CLOSED) type = 'closed'
        else if (request.ticket.archived) type = 'archived';
        else if (!request.ticket.evaluable) type = 'unevaluable';
        else type = 'open';
        const route = userRoute === 'miners' ? 'miners.target.' + scope + '.tickets.' + type + '.detail' :
            ( userRoute === 'authorities' && userRoute + '.tickets.' + scope + '.' + type + '.target.detail')
        history.push(reverse(route, {
            target: request.ticket.target.canonical_name,
            ticketId: request.ticket.id
        }))
    }

    getScopedRequests(scope) {
        if (scope === EF_EMAC) return this.props.requests;
        return this.props.requests.filter(req=> req.ticket.scope===scope || scope===EF_EMAC);
    }

    renderTabs() {
        const tabs = [
            {
                label: 'EF+EMAC',
                to: reverse(this.getTabPath(EF_EMAC))
            },
            {
                label: 'EF',
                to: reverse(this.getTabPath(EF))
            },
            {
                label: 'EMAC',
                to: reverse(this.getTabPath(EMAC))
            }
        ]
        return <LinkTabs tabs={tabs}/>;
    }

    getTabPath(scope) {
        const {userRoute, type} = this.props;
        const tabBasePath = userRoute + '.requests.' + type;
        return tabBasePath + '.' + scope;
    }

    render() {
        const {classes, title, userRoute, type, userFilters, user, loading, loadError} = this.props;
        const tabBasePath = userRoute + '.requests.' + type;
        const scopedListProps = {type, user, userFilters, loading, loadError}
        return (<div className={classes.container}>

            <Typography variant="h4" className={classes.header}>{title}</Typography>

            {this.renderTabs()}

            <Switch>
                <Route path={route(this.getTabPath(EF))}
                    render={() =>
                        <RequestsScopedList
                            {...scopedListProps}
                            scope={EF}
                            requests={this.getScopedRequests(EF)}
                            onRequestClick={(r) => this.onRequestClick(r)}/>
                    }
                />
                <Route path={route(this.getTabPath(EMAC))}
                    render={() =>
                        <RequestsScopedList
                            {...scopedListProps}
                            scope={EMAC}
                            requests={this.getScopedRequests(EMAC)}
                            onRequestClick={(r) => this.onRequestClick(r)}/>
                    }
                />
                <Route path={route(this.getTabPath(EF_EMAC))}
                    render={() =>
                        <RequestsScopedList
                            {...scopedListProps}
                            scope={EF_EMAC}
                            requests={this.getScopedRequests(EF_EMAC)}
                            onRequestClick={(r) => this.onRequestClick(r)}/>
                    }
                />
                <Route exact path={route(tabBasePath)}
                    render={() =>
                        <Redirect to={{
                            pathname: reverse(this.getTabPath(EF_EMAC))
                        }}/>
                    }/>
            </Switch>

        </div>);
    }
}

export default withStyles(styles)(withRouter(RequestsList));

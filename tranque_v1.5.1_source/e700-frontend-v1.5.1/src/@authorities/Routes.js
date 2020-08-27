import React from 'react';
import {Route, Switch} from 'react-router';
import C40X from '@app/components/utils/C40X';
import {route} from '@app/urls';
import {TargetMain} from '@authorities/containers/target/TargetMain';
import {TargetMapContainer} from '@authorities/containers/home/TargetMapContainer';
import {MonitoringTableContainer} from '@authorities/containers/home/MonitoringTableContainer';
import RequestsListContainer from '@alerts_events/containers/RequestsListContainer';
import AllTickets from '@authorities/containers/tickets/AllTickets';

export const Routes = () => (
    <Switch>
        <Route exact path={route('authorities.home')} component={MonitoringTableContainer}/>
        <Route exact path={route('authorities.map')} component={TargetMapContainer}/>
        <Route path={route('authorities.target')} component={TargetMain}/>
        <Route path={route('authorities.tickets')} component={AllTickets}/>
        <Route path={route('authorities.requests')} component={RequestsListContainer}/>
        <Route component={C40X}/>
    </Switch>
);

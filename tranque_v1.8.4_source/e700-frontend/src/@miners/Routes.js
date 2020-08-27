import React from 'react';
import {Route, Switch} from 'react-router';
import C40X from '@app/components/utils/C40X';
import TargetRoutes from '@miners/containers/TargetRoutes';
import Home from '@miners/containers/home/Home';
import {route} from '@app/urls';
import RequestsListContainer from '@alerts_events/containers/RequestsListContainer';

export const Routes = () => (
    <Switch>
        <Route exact path={route('miners.home')} component={Home}/>
        <Route path={route('miners.target')} component={TargetRoutes}/>
        <Route path={route('miners.requests')} component={RequestsListContainer}/>
        <Route component={C40X}/>
    </Switch>
);

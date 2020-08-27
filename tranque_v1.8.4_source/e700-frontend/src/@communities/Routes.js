import React from 'react';
import {Route, Switch} from 'react-router';
import C40X from '@app/components/utils/C40X';
import Home from '@communities/containers/home/Home';
import PublicMonitorTableContainer from '@communities/containers/PublicMonitorTableContainer';
import {route} from '@app/urls';
import TargetIndexes from '@communities/containers/TargetIndexes';

export const Routes = () => (
    <Switch>
        <Route exact path={route('public.home')} component={Home}/>
        <Route path={route('public.targets.target')} component={TargetIndexes}/>
        <Route path={route('public.targets')} component={PublicMonitorTableContainer}/>
        <Route component={C40X}/>
    </Switch>
);

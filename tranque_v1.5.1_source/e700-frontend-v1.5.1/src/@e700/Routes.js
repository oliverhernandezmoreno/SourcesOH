import React from 'react';
import {Route, Switch} from 'react-router';
import PrivateRoute from '@app/containers/auth/PrivateRoute';
import FormInstanceDetail from '@e700/components/instance/FormInstanceDetail';
import C40X from '@app/components/utils/C40X';
import RegistryDetail from '@e700/components/registry/FormRegistryDetail';
import CaseDetail from '@e700/containers/authority/CaseDetail';
import Home from '@e700/containers/Home';
import {route} from '@app/urls';
import FormInstanceListContainer from '@e700/containers/miner/FormInstanceListContainer';
import {FormRegistryContainer} from '@e700/containers/authority/FormRegistryContainer';
import CreateInstances from '@e700/components/registry/CreateInstances';
import {PERMS} from '@app/permissions';

const MINE_PERMS = [{codename: PERMS.miner.e700, fromAnyTarget: true}];
const AUTHORITY_PERMS = [{codename: PERMS.authority.e700, fromAnyTarget: true}];

export const Routes = () => (
    <Switch>
        <PrivateRoute
            path={route('e700.form')} component={FormInstanceDetail}
            requiredPerm={MINE_PERMS}/>
        <PrivateRoute
            path={route('e700.target')} component={FormInstanceListContainer}
            requiredPerm={MINE_PERMS}/>
        <PrivateRoute
            path={route('e700.registry')} component={FormRegistryContainer}
            requiredPerm={AUTHORITY_PERMS}/>
        <PrivateRoute
            path={route('e700.assign')} component={CreateInstances}
            requiredPerm={AUTHORITY_PERMS}/>
        <PrivateRoute
            path={route('e700.detail')} component={RegistryDetail}
            requiredPerm={AUTHORITY_PERMS}/>
        <PrivateRoute
            path={route('e700.case')} component={CaseDetail}
            requiredPerm={AUTHORITY_PERMS}/>
        <PrivateRoute exact path={route('e700')} component={Home}/>
        <Route component={C40X}/>
    </Switch>
);

import React from 'react';
import {Route, Switch} from 'react-router';
import {DEFAULT_REDIRECT, EXCLUDED_ROUTES, INCLUDED_ROUTES} from '@app/config';
import C40X from '@app/components/utils/C40X';
import {reverse, route} from '@app/urls';
import {Redirect} from 'react-router-dom';
import e700 from '@e700/e700';
import Miners from '@miners/Miners';
import LoginContainer from '@app/containers/auth/LoginContainer';
import Authorities from '@authorities/Authorities';
import Communities from '@communities/Communities';
import Glossary from '@app/components/help/Glossary';
import PrivateRoute from '@app/containers/auth/PrivateRoute';
import GlobalSnackbar from '@app/components/utils/GlobalSnackbar';
import {PERMS} from '@app/permissions';

const MINERS_PERMS = [
    {codename: PERMS.miner.emac, fromAnyTarget: true},
    {codename: PERMS.miner.e700, fromAnyTarget: true},
    {codename: PERMS.miner.ef, fromAnyTarget: true}
];

const AUTHORITY_PERMS = [
    {codename: PERMS.authority.emac, fromAnyTarget: true},
    {codename: PERMS.authority.e700, fromAnyTarget: true},
    {codename: PERMS.authority.ef, fromAnyTarget: true}
];

const E700_PERMS = [
    {codename: PERMS.miner.e700, fromAnyTarget: true},
    {codename: PERMS.authority.e700, fromAnyTarget: true}
];

const sections = {
    'public': <Route path={route('public')} component={Communities}/>,
    'miners': <PrivateRoute
        path={route('miners')} component={Miners}
        anyPermOf={MINERS_PERMS}/>,
    'authorities': <PrivateRoute
        path={route('authorities')} component={Authorities}
        anyPermOf={AUTHORITY_PERMS}/>,
    'e700': <PrivateRoute
        path={route('e700')} component={e700}
        anyPermOf={E700_PERMS}
    />,
    'glossary': <PrivateRoute
        path={route('glossary')}
        component={Glossary}
        anyPermOf={[...AUTHORITY_PERMS, ...MINERS_PERMS]}/>,
    'login': <Route path={route('login')} component={LoginContainer}/>
};

const sectionSet = (expr) => new Set(
    expr
        .split(',')
        .map((key) => key.trim())
        .filter((key) => key.length > 0)
        .map((key) => key === '*' ? Object.keys(sections) : [key])
        .reduce((flat, nested) => [...flat, ...nested], [])
        .filter((key) => typeof sections[key] !== 'undefined')
);
const includes = sectionSet(INCLUDED_ROUTES);
const excludes = sectionSet(EXCLUDED_ROUTES);

const whitelistedSections = Object.entries(sections)
    .filter(([k]) => includes.has(k) && !excludes.has(k))
    .map(([k, section]) => React.cloneElement(section, {key: `section-${k}`}));

const homeRedirect = includes.has(DEFAULT_REDIRECT) && !excludes.has(DEFAULT_REDIRECT) ?
    DEFAULT_REDIRECT :
    (Object.keys(sections).find((k) => includes.has(k) && !excludes.has(k)) || DEFAULT_REDIRECT);

export const App = () => (<>
    <Switch>
        {whitelistedSections}
        <Route
            exact
            path={route('home')}
            render={() => <Redirect to={reverse(homeRedirect)}/>}/>
        <Route component={C40X}/>
    </Switch>
    <GlobalSnackbar/>
</>);

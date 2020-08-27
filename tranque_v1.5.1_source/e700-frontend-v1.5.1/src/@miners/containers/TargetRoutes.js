import React from 'react';
import {Route, Switch} from 'react-router';

import EMACRoutes from '@miners/containers/EMAC/EMAC.Routes';
import EFRoutes from '@miners/containers/EF/EF.Routes';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import C40X from '@app/components/utils/C40X';
import {route} from '@app/urls';

export default class TargetRoutes extends SubscribedComponent {
    render() {
        const target = this.props.match.params.target;
        return (
            <Switch>
                {/* EMAC */}
                <Route path={route('miners.target.emac')}
                    render={(props) => <EMACRoutes {...props} target={target}/>}/>
                {/* EF */}
                <Route path={route('miners.target.ef')}
                    render={(props) => <EFRoutes {...props} target={target}/>}/>
                {/* DEFAULT 404 */}
                <Route path={route('miners.target')} component={C40X}/>
            </Switch>
        );
    }
}

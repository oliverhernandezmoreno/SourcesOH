import React, {Component} from 'react';
import {Route, Switch} from 'react-router';
import {Redirect} from 'react-router-dom';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import Grid from '@material-ui/core/Grid';
import EMACETL from '@miners/containers/EMAC/EMACETL';
import EMACDataII from '@miners/containers/EMAC/indexes/EMACDataII';
import EMACDataIR from '@miners/containers/EMAC/indexes/EMACDataIR';
import SubMenu from '@miners/containers/layout/SubMenu';
import {EMACIRRoutes, getEMACDrawerItems, getEMACSubMenuItems} from '@miners/containers/EMAC/EMAC.nav';
import EMACMonitoringDashboard from '@miners/containers/EMAC/EMACMonitoringDashboard';
import {menuActions} from '@miners/actions';
import {reverse, route} from '@app/urls';
import EMACRawByVariable from '@miners/containers/EMAC/raw/EMACRawByVariable';
import EMACRawBySource from '@miners/containers/EMAC/raw/EMACRawBySource';

function EMACData(target) {
    return (props) => (
        <Grid container spacing={1} style={{padding: '8px'}}>
            <Grid item xs={3}>
                <SubMenu {...props} title='Datos' items={getEMACSubMenuItems(target)}/>
            </Grid>
            <Grid item xs={9}>
                <Switch>
                    <Route path={route('miners.target.emac.massLoad')} component={EMACETL}/>
                    <Route path={route('miners.target.emac.data.load')} component={EMACETL}/>
                    <Route
                        path={route('miners.target.emac.data.iiSuperficial')}
                        render={(props) => (
                            <EMACDataII
                                {...props}
                                template='emac-mvp.superficial.ii'
                                label='aguas superficiales'
                                target={target}/>
                        )}/>
                    <Route
                        path={route('miners.target.emac.data.iiSubterranean')}
                        render={(props) => (
                            <EMACDataII
                                {...props}
                                template='emac-mvp.subterraneo.ii'
                                label='aguas subterráneas'
                                target={target}/>
                        )}/>

                    {EMACIRRoutes.map((irRoute, index) => (
                        <Route
                            key={index} path={route(irRoute.route)}
                            render={(props) => <EMACDataIR {...props} {...irRoute.props} target={target}/>}/>
                    ))}
                    <Route path={route('miners.target.emac.data.raw.byVariable')} component={EMACRawByVariable}/>
                    <Route path={route('miners.target.emac.data.raw.bySource')} component={EMACRawBySource}/>
                    <Route
                        path={route('miners.target.emac.data')}
                        render={(props) => <Redirect
                            to={reverse('miners.target.emac.data.irSuperficial.riego', {target: props.match.params.target})}/>}/>
                </Switch>
            </Grid>
        </Grid>
    );
}

class EMACRoutes extends Component {

    setUp() {
        this.props.actions.menuUpdate(getEMACDrawerItems(this.props.target));
    }

    componentDidMount() {
        this.setUp();
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.target !== prevProps.target) {
            this.setUp();
        }
    }

    render() {
        const target = this.props.target;
        return (
            <Switch>
                {/*Dashboard */}
                <Route
                    path={route('miners.target.emac.dashboard')}
                    render={(props) => <EMACMonitoringDashboard {...props} target={target}/>}/>
                {/*Data */}
                <Route path={route('miners.target.emac.data')} render={EMACData(target)}/>
                <Route path={route('miners.target.emac.massLoad')} render={EMACData(target)}/>
                <Route render={() => <Redirect to={reverse('miners.target.emac.dashboard', {target})}/>}/>
            </Switch>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(menuActions, dispatch)
    };
}

export default connect(null, mapDispatchToProps)(EMACRoutes);

import React, {Component} from 'react';
import {Route, Switch} from 'react-router';
import {Redirect} from 'react-router-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import Grid from '@material-ui/core/Grid';

import {menuActions} from '@miners/actions';
import SubMenu from '@miners/containers/layout/SubMenu';
import TicketRoot from '@alerts_events/containers/TicketRoot';
import { getEFDrawerItems, getEFSubMenuItems } from '@miners/containers/EF/EF.nav';
import { getInspectSubMenuItems } from '@miners/containers/EF/inspections/Inspect.nav';
import DashBoard from '@miners/containers/EF/DashBoard';
import CardGraphicFilter from '@miners/containers/EF/data/CardGraphicFilter';

import ExecutorsStepper from '@miners/containers/EF/etl/EFETLStepper';
import ExecutorsOperation from '@miners/containers/EF/etl/EFETLOperationList';
import DailyInspection from '@miners/containers/EF/inspections/DailyInspection';
import InspectionOperation from '@miners/components/EF/InspectionOperation';
import InspectionVoucher from '@miners/components/EF/InspectionVoucher';
import MounthlyEvaluation from '@miners/containers/EF/inspections/MounthlyEvaluation';

import {reverse, route} from '@app/urls';

function EFData(target) {
    return (props) => (
        <Grid container spacing={3} style={{padding: '24px'}}>
            <Grid item xs={3}>
                <SubMenu {...props} title='Datos' items={getEFSubMenuItems(target)}/>
            </Grid>
            <Grid item xs={9}>
                <Switch>
                    <Route path={route('miners.target.ef.dataLoad.fromFile')} component={ExecutorsStepper}/>
                    <Route path={route('miners.target.ef.registry.operationList')} component={ExecutorsOperation}/>
                    <Route path={route('miners.target.ef.data.template')} component={CardGraphicFilter}/>
                </Switch>
            </Grid>
        </Grid>
    );
}

function EFInspection(target) {
    return (props) => (
        <Grid container spacing={3} style={{padding: '24px'}}>
            <Grid item xs={3}>
                <SubMenu {...props} title='Inspecciones y evaluaciones' items={getInspectSubMenuItems(target)}/>
            </Grid>
            <Grid item xs={9}>
                <Switch>
                    <Route path={route('miners.target.ef.inspection-and-evaluation.inspection')}
                        component={DailyInspection}/>
                    <Route path={route('miners.target.ef.inspection-and-evaluation.evaluation')}
                        component={MounthlyEvaluation}/>
                    <Route path={route('miners.target.ef.inspection-and-evaluation.registry')}
                        component={InspectionOperation}/>
                    <Route path={route('miners.target.ef.inspection-and-evaluation.voucher')}
                        render={(props) => <InspectionVoucher target={props.match.params.target}
                            operation={props.match.params.operation} />} />
                    <Route render={() => <Redirect to={reverse('miners.target.ef.inspection-and-evaluation.registry', {target})}/>}/>
                </Switch>
            </Grid>
        </Grid>
    );
}

function EFTickets(target) {
    return (props) => (
        <TicketRoot {...props}
            target={target}
            group="ef"
            subtitle="Estabilidad física del depósito"
            basePath="miners.target.ef.tickets"
            openPath="miners.target.ef.tickets.open.detail"
            archivedPath="miners.target.ef.tickets.archived.detail"
            unevaluablePath="miners.target.ef.tickets.unevaluable.detail"
            closedPath="miners.target.ef.tickets.closed.detail"
            newPath="miners.target.ef.tickets.new"
        />
    );
}

class EFRoutes extends Component {
    setUp() {
        this.props.actions.menuUpdate(getEFDrawerItems(this.props.target));
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
                {/* Dashboard */}
                <Route
                    path={route('miners.target.ef.dashboard')}
                    render={(props) => <DashBoard {...props} target={target}/>}/>
                {/* Data */}
                <Route path={route('miners.target.ef.data')} render={EFData(target)}/>
                <Route path={route('miners.target.ef.dataLoad')} render={EFData(target)}/>
                {/* Inspection & Evaluation */}
                <Route path={route('miners.target.ef.inspection-and-evaluation')} render={EFInspection(target)}/>
                {/* Tickets */}
                <Route path={route('miners.target.ef.tickets')}
                    render={EFTickets(target)}/>
                {/* Default redirect to dashboard */}
                <Route render={() => <Redirect to={reverse('miners.target.ef.dashboard', {target})}/>}/>
            </Switch>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(menuActions, dispatch)
    };
}

export default connect(null, mapDispatchToProps)(EFRoutes);

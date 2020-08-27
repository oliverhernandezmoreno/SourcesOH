import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import {Box, Grid, Typography} from '@material-ui/core';
import {homeFiltersActions} from '@authorities/actions/homeFilters.actionCreators';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import TicketTypeIcon from '@alerts_events/components/icons/TicketTypeIcon';
import { A, B, C, D } from '@alerts_events/constants/ticketGroups';
import {getTicketsCount, checkTicketActive} from '@authorities/services/tickets';
import {getActiveDisconnectionsCount} from '@authorities/services/disconnections';
import {getNumberOfRequests} from '@alerts_events/constants/authorizationStates';
import {ARCHIVE, CLOSE, ESCALATE, UNESCALATE} from '@alerts_events/constants/userActions';
import ProfileTabs from '@authorities/components/ProfileTabs';
import CounterBox from '@authorities/components/home/CounterBox';
import AlertBox from '@authorities/components/home/AlertBox';

const EF_CANONICAL_NAME = 'ef';
const EMAC_CANONICAL_NAME = 'emac';

const styles = theme => ({
    toolbar: {
        [theme.breakpoints.up('md')]: {
            paddingLeft: '0px'
        },
        [theme.breakpoints.up('sm')]: {
            paddingLeft: '0px'
        },
        paddingLeft: '0px',
        width: '100%'
    }
});

/**
 * A component for rendering the alerts and events monitoring.
 *
 * @version 1.0.0
 */
class MonitoringAlertsEvents extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openTicketsData: []
        };
    }

    componentDidMount(){
        this.updateTicketsData();
    }

    componentDidUpdate(prevProps, prevState, snapshot){
        if (prevProps !== this.props){
            this.updateTicketsData();
        }
    }

    render(){
        const {disconnections, actions, storedSelectedProfileMonitoringAlerts} = this.props;
        const {openTicketsData} = this.state;
        return (
            <Box>
                <Typography variant='h5' style={{margin: 16}}>Monitoreo de eventos y alertas</Typography>
                <ProfileTabs both
                    handleChange={(e, v) => actions.setProfileMonitoringAlerts(v)}
                    tabValue={storedSelectedProfileMonitoringAlerts}
                />
                <Grid container spacing={5}>
                    <Grid item><Grid item xs={12}><Typography variant="h6">Alertas</Typography></Grid></Grid>
                </Grid>
                <Grid container spacing={5} style={{marginBottom: 16}}>
                    <AlertBox
                        alertType={'red-alert'}
                        selectedProfile={storedSelectedProfileMonitoringAlerts}
                        efTotal={getTicketsCount(openTicketsData, 6, EF_CANONICAL_NAME)}
                        emacTotal={getTicketsCount(openTicketsData, 6, EMAC_CANONICAL_NAME)}
                    />
                    <AlertBox
                        alertType={'yellow-alert'}
                        selectedProfile={storedSelectedProfileMonitoringAlerts}
                        efTotal={getTicketsCount(openTicketsData, 5, EF_CANONICAL_NAME)}
                        emacTotal={getTicketsCount(openTicketsData, 5, EMAC_CANONICAL_NAME)}
                    />
                    <AlertBox
                        alertType={'disconnected-alert'}
                        selectedProfile={storedSelectedProfileMonitoringAlerts}
                        efTotal={getActiveDisconnectionsCount(disconnections, EF_CANONICAL_NAME)}
                        emacTotal={getActiveDisconnectionsCount(disconnections, EMAC_CANONICAL_NAME)}
                    />
                </Grid>

                <Grid container spacing={5}>
                    <Grid item xs={12} lg={6}>
                        <Typography variant="h6">Incidentes</Typography>
                        {this.renderEventsBox()}
                    </Grid >
                    <Grid item xs={12} lg={6}>
                        <Typography variant="h6">Solicitudes</Typography>
                        {this.renderRequestsBox()}
                    </Grid>
                </Grid>

                {/* <Grid container spacing={5}>
                    <Grid item xs={6}><Typography variant="h6">Depósitos con más incidentes</Typography></Grid>
                    <Grid item xs={6}><Typography variant="h6">Regiones con más incidentes</Typography></Grid>
                </Grid>
                <Grid container spacing={5} style={{marginBottom: 16}}>
                    {this.renderDepositsBox()}
                    {this.renderRegionsBox()}
                </Grid> */}
            </Box>
        );
    }

    updateTicketsData() {
        this.setState({
            openTicketsData: this.props.data.filter((t) => checkTicketActive(t))
        });
    }

    renderEventsBox(){
        const { openTicketsData } = this.state;
        const { storedSelectedProfileMonitoringAlerts } = this.props;
        const rows = [
            {
                type: A,
                totalEF: getTicketsCount(openTicketsData, 1, EF_CANONICAL_NAME),
                totalEMAC: getTicketsCount(openTicketsData, 1, EMAC_CANONICAL_NAME),
                icon: <TicketTypeIcon group={A} showLabels evaluable/>
            },
            {
                type: B,
                totalEF: getTicketsCount(openTicketsData, 2, EF_CANONICAL_NAME),
                totalEMAC: getTicketsCount(openTicketsData, 2, EMAC_CANONICAL_NAME),
                icon: <TicketTypeIcon group={B} showLabels evaluable/>
            },
            {
                type: C,
                totalEF: getTicketsCount(openTicketsData, 3, EF_CANONICAL_NAME),
                totalEMAC: getTicketsCount(openTicketsData, 3, EMAC_CANONICAL_NAME),
                icon: <TicketTypeIcon group={C} showLabels evaluable/>
            },
            {
                type: D,
                totalEF: getTicketsCount(openTicketsData, 4, EF_CANONICAL_NAME),
                totalEMAC: getTicketsCount(openTicketsData, 4, EMAC_CANONICAL_NAME),
                icon: <TicketTypeIcon group={D} showLabels evaluable/>
            }
        ];

        return <CounterBox
            totalHeaderText='Total de incidentes'
            rows={rows}
            selectedProfile={storedSelectedProfileMonitoringAlerts}
            bottomText='Los incidentes no necesariamente están relacionados a estados de alerta'
        />;
    }

    renderRequestsBox(){
        const {requests, storedSelectedProfileMonitoringAlerts} = this.props;
        const rows = [
            {
                type: 'archivado', label: 'Archivado',
                totalEF: getNumberOfRequests(requests, EF_CANONICAL_NAME, ARCHIVE),
                totalEMAC: getNumberOfRequests(requests, EMAC_CANONICAL_NAME, ARCHIVE)
            },
            {
                type: 'cierre', label: 'Cierre',
                totalEF: getNumberOfRequests(requests, EF_CANONICAL_NAME, CLOSE),
                totalEMAC: getNumberOfRequests(requests, EMAC_CANONICAL_NAME, CLOSE)
            },
            {
                type: 'escalamiento', label: 'Escalamiento',
                totalEF: getNumberOfRequests(requests, EF_CANONICAL_NAME, ESCALATE),
                totalEMAC: getNumberOfRequests(requests, EMAC_CANONICAL_NAME, ESCALATE)
            },
            {
                type: 'desescalamiento', label: 'Desescalamiento',
                totalEF: getNumberOfRequests(requests, EF_CANONICAL_NAME, UNESCALATE),
                totalEMAC: getNumberOfRequests(requests, EMAC_CANONICAL_NAME, UNESCALATE)
            }
        ];

        return <CounterBox
            totalHeaderText='Total de solicitudes'
            rows={rows}
            selectedProfile={storedSelectedProfileMonitoringAlerts}
        />;
    }

    renderDepositsBox(){
        const {storedSelectedProfileMonitoringAlerts} = this.props;
        const rows = [
            {type: 'top1', label: 'Deposito 1', totalEF: 10, totalEMAC: 0},
            {type: 'top2', label: 'Deposito 2', totalEF: 10, totalEMAC: 0},
            {type: 'top3', label: 'Deposito 3', totalEF: 10, totalEMAC: 0},
            {type: 'top4', label: 'Deposito 4', totalEF: 10, totalEMAC: 0},
            {type: 'top5', label: 'Deposito 5', totalEF: 10, totalEMAC: 0},
        ];

        return <CounterBox
            rows={rows}
            selectedProfile={storedSelectedProfileMonitoringAlerts}
        />;
    }

    renderRegionsBox(){
        const {storedSelectedProfileMonitoringAlerts} = this.props;
        const rows = [
            {type: 'top1', label: 'Región 1', totalEF: 10, totalEMAC: 0},
            {type: 'top2', label: 'Región 2', totalEF: 10, totalEMAC: 0},
            {type: 'top3', label: 'Región 3', totalEF: 10, totalEMAC: 0},
            {type: 'top4', label: 'Región 4', totalEF: 10, totalEMAC: 0},
            {type: 'top5', label: 'Región 5', totalEF: 10, totalEMAC: 0},
        ];

        return <CounterBox
            rows={rows}
            selectedProfile={storedSelectedProfileMonitoringAlerts}
        />;
    }

}

MonitoringAlertsEvents.propTypes = {
    data: PropTypes.array.isRequired
};

const mapStateToProps = state => {
    return {
        storedSelectedProfileMonitoringAlerts: state.authorities.aut_home_selected_profile_monitoring_alerts,
    };
};

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(homeFiltersActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(MonitoringAlertsEvents));
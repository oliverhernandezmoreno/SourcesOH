import React, {Component} from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Grid, Box, Radio, RadioGroup, FormControl, FormControlLabel } from '@material-ui/core';
import {COLORS} from '@authorities/theme.js';
import { HorizontalBarSeriesChart } from '@app/components/charts/HorizontalBarSeriesChart';
import SemaphoreHistoryTable from './SemaphoreHistoryTable';
import * as moment from 'moment';
import { extendMoment } from 'moment-range';
import { NO_ALERT_COLOR, YELLOW_ALERT_COLOR, RED_ALERT_COLOR, DISCONNECTED_ALERT_COLOR } from '@authorities/constants/alerts';
import { getAlertLabel, getTicketStatus } from '@authorities/services/tickets';

const styles = theme => ({
    root: {
        padding: theme.spacing(2),
        marginTop: theme.spacing(2),
        borderRadius: "8px"
    },
    radioGroup: {
        flexDirection: 'row'
    },
    formControl: {
        border: `1px solid ${theme.palette.secondary.main}`,
        borderRadius: 8
    },
    formControlLabel: {
        width: '100%',
        justifyContent: 'center'
    },
    radioButton: {
        backgroundColor: 'red',
        '&$checked': {
            backgroundColor: 'green'
        }
    },
    checked: {}
});

const EF_CANONICAL_NAME = 'ef';
const EMAC_CANONICAL_NAME = 'emac';

const alertsDomain = [
    getAlertLabel(DISCONNECTED_ALERT_COLOR),
    getAlertLabel(NO_ALERT_COLOR),
    getAlertLabel(YELLOW_ALERT_COLOR),
    getAlertLabel(RED_ALERT_COLOR)
];

const alertsColors = [
    DISCONNECTED_ALERT_COLOR,
    NO_ALERT_COLOR,
    YELLOW_ALERT_COLOR,
    RED_ALERT_COLOR
]

const DEFAULT_INITIAL_DATE = '2020-01-01';

const emptyPublicMessage = "No existe un mensaje público asociado";

/**
 * A component for rendering the status of EF and EMAC semaphores
 */
class SemaphoreHistory extends Component {

    state = {
        selectedScope: EF_CANONICAL_NAME
    };

    handleScopeChange(event) {
        this.setState({
            selectedScope: event.target.value
        });
    }

    render() {
        const {target} = this.props.match.params;
        const {classes, services: {downloadDisconnectionFile}} = this.props;
        const {selectedScope} = this.state;

        const chartData = this.getHistoryChartData();
        const xDomain = [this.getFirstAndLastDate(chartData).firstDate, this.getFirstAndLastDate(chartData).lastDate];

        return (<Box className={classes.root}>
            <FormControl className={classes.formControl} component="fieldset" fullWidth>
                <RadioGroup className={classes.radioGroup} aria-label="scope" name="scope" value={this.state.selectedScope} onChange={e => this.handleScopeChange(e)}>
                    <Grid container>
                        <Grid item xs={6} style={{borderRight: `1px solid ${COLORS.secondary.main}`}}>
                            <Box justifyContent="center">
                                <FormControlLabel className={classes.formControlLabel} value={EF_CANONICAL_NAME}
                                    control={<Radio />}
                                    label={EF_CANONICAL_NAME.toUpperCase()} />
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box justifyContent="center">
                                <FormControlLabel className={classes.formControlLabel} value={EMAC_CANONICAL_NAME}
                                    control={<Radio />}
                                    label={EMAC_CANONICAL_NAME.toUpperCase()} />
                            </Box>
                        </Grid>
                    </Grid>
                </RadioGroup>
            </FormControl>

            <HorizontalBarSeriesChart data={chartData} yDomain={alertsDomain} xDomain={xDomain}/>

            <SemaphoreHistoryTable 
                data={chartData}
                target={target}
                scope={selectedScope}
                services={{
                    downloadDisconnectionFile
                }}/>
        </Box>);
    }

    getHistoryChartData(){
        const {data: {tickets, disconnections, publicMessages}} = this.props;
        const { selectedScope } = this.state;
        const Moment = extendMoment(moment);
        let range, disconnectionsInRange, publicMessagesInRange;
        const chartData = [];
        const alertsNormalized = [];

        // Filter by scope: EF or EMAC
        const filteredTickets = (tickets || []).filter(t => t.base_module.split('.')[0] === selectedScope);
        const filteredDisconnections = (disconnections || []).filter(d => d.scope === selectedScope);
        const filteredPublicMessages = (publicMessages || []).filter(d => d.scope === selectedScope);

        // Keep only alerts
        const alerts = filteredTickets.filter(t => t.result_state.level > 4).sort((a,b) => a.created_at.diff(b.created_at));

        // If doesn't exist alerts then return green semaphore from first to last date
        if (alerts.length === 0){
            range = Moment().range(moment(DEFAULT_INITIAL_DATE), moment());
            disconnectionsInRange = filteredDisconnections.filter(d => range.contains(d.created_at));
            publicMessagesInRange = filteredPublicMessages.find(pm => range.contains(moment(pm.created_at)));
            
            disconnectionsInRange.forEach(d => {
                chartData.push({
                    y: alertsDomain[0],
                    x0: d.created_at,
                    x: d.closed_at || moment(), 
                    color: alertsColors[0],
                    disconnectedColor: alertsColors[1],
                    disconnectionData: {id: d.id, comment: d.comment, documents: d.documents},
                    publicMessage: (publicMessagesInRange && publicMessagesInRange.content) || emptyPublicMessage
                });
            });

            chartData.push({
                y: alertsDomain[1],
                x0: moment(DEFAULT_INITIAL_DATE),
                x: moment(),
                color: alertsColors[1],
                publicAlertAbstract: null,
                publicMessage: (publicMessagesInRange && publicMessagesInRange.content) || emptyPublicMessage
            });
            return chartData.sort((a,b) => -a.x0.diff(b.x0));
        }

        // First element: Green Status always (without alerts)
        range = Moment().range(moment(DEFAULT_INITIAL_DATE), alerts[0].created_at);
        publicMessagesInRange = filteredPublicMessages.find(pm => range.contains(moment(pm.created_at)));

        chartData.push({
            y: alertsDomain[1],
            x0: moment(DEFAULT_INITIAL_DATE),
            x: alerts[0].created_at,
            color: alertsColors[1],
            publicAlertAbstract: null,
            publicMessage: (publicMessagesInRange && publicMessagesInRange.content) || emptyPublicMessage
        });

        alertsNormalized.push({
            color: alertsColors[1],
            startDate: moment(DEFAULT_INITIAL_DATE),
            endDate: alerts[0].created_at
        });

        // Then for each alert set status period
        let prevAlert = alerts[0];
        for (let i=1; i<alerts.length+1; i++){
            let alert = i < alerts.length ? alerts[i] : null;
            let range, publicMessagesInRange;
            if (prevAlert && prevAlert.result_state && prevAlert.result_state.level){
                // Is alert
                range = Moment().range(prevAlert.created_at, (alert && alert.created_at) || moment());
                publicMessagesInRange = filteredPublicMessages.find(pm => range.contains(moment(pm.created_at)));
                chartData.push({
                    y: alertsDomain[+prevAlert.result_state.level - 3],
                    x0: prevAlert.created_at,
                    x: (alert && alert.created_at) || moment(),
                    color: alertsColors[+prevAlert.result_state.level - 3],
                    status: getTicketStatus(prevAlert),
                    target: prevAlert.target.canonical_name,
                    ticketId: prevAlert.id,
                    publicAlertAbstract: prevAlert.public_alert_abstract,
                    publicMessage: (publicMessagesInRange && publicMessagesInRange.content) || emptyPublicMessage
                });
                alertsNormalized.push({
                    color: alertsColors[+prevAlert.result_state.level - 3],
                    startDate: prevAlert.created_at,
                    endDate: (alert && alert.created_at) || moment()
                });
                
            }
            prevAlert = alert;
        }

        // Add disconnections data periods
        filteredDisconnections.forEach(d => {
            let range = Moment().range(d.created_at, d.closed_at || moment());
            let alertsInRange = alertsNormalized.filter(an => range.contains(an.startDate) || range.contains(an.endDate));
            publicMessagesInRange = filteredPublicMessages.find(pm => range.contains(moment(pm.created_at)));

            alertsInRange.forEach(an => {
                let x0, x;
                if (d.created_at.isSameOrBefore(an.startDate)){
                    x0 = an.startDate;
                    x = an.endDate;
                }else if (d.created_at.isAfter(an.startDate) ){
                    x0 = d.created_at;
                    x = an.endDate;
                }
                chartData.push({
                    y: alertsDomain[0],
                    x0,
                    x,
                    color: alertsColors[0],
                    disconnectedColor: an.color,
                    disconnectionData: {id: d.id, comment: d.comment, documents: d.documents},
                    publicMessage: (publicMessagesInRange && publicMessagesInRange.content) || emptyPublicMessage
                });
            });
        });

        return chartData.sort((a,b) =>  a.x0.diff(b.x0));
    }

    getFirstAndLastDate(data){
        let firstDate = moment();
        data.forEach(d => {
            firstDate = d.x0.isBefore(firstDate) ? d.x0 : firstDate;
        });
        // firstDate = firstDate.subtract(1, 'years');

        let lastDate = moment(0);
        data.forEach(d => {
            lastDate = d.x.isAfter(lastDate) ? d.x : lastDate;
        });
        // lastDate = lastDate.add(1, 'years');

        return {firstDate, lastDate};
    }
}

export default withStyles(styles)(SemaphoreHistory);

import React, { Component } from 'react';
import {history} from '@app/history';
import {reverse} from '@app/urls';
import { Typography, withStyles } from '@material-ui/core';
import TMaterialTable from '@app/components/utils/TMaterialTable';
import {AlertStatusIcon} from '@authorities/components/AlertStatusIcon';
import {BlueButton} from '@authorities/theme';
import { YELLOW_ALERT_COLOR, RED_ALERT_COLOR, DISCONNECTED_ALERT_COLOR } from '@authorities/constants/alerts';
import * as config from '@app/config';


const styles = theme => ({
    root: {
        padding: theme.spacing(2)
    },
});

class SemaphoreHistoryTable extends Component {
    state = {
    };

    static getDerivedStateFromProps(props, state) {
        return null;
    }

    render() {
        const {classes, data} = this.props;
        return (
            <div className={classes.root}>
                <TMaterialTable
                    data={(data && data.map(this.normalizeData)) || []}
                    columns={this.getMonitoringColumns()}
                    options={{
                        search: false,
                        toolbar: false,
                    }}/>
            </div>
        );
    }

    normalizeData(d) {
        return {...d, from: d.x0.format(config.DATE_FORMAT), to: d.x.format(config.DATE_FORMAT)};
    }

    getMonitoringColumns() {
        return [
            {
                title: (<Typography variant="subtitle2">Estado</Typography>),
                field: 'status',
                render: (data) => (
                    <AlertStatusIcon
                        id={data.tableData.id}
                        color={data.color}
                        disconnected={data.color === DISCONNECTED_ALERT_COLOR}
                        size="default" />
                ),
            },
            {
                title: (<Typography variant="subtitle2">Desde</Typography>),
                field: 'from'
            },
            {
                title: (<Typography variant="subtitle2">Hasta</Typography>),
                field: 'to'
            },
            {
                title: (<Typography variant="subtitle2">Resumen Genérico</Typography>),
                field: 'publicAlertAbstract',
            },
            {
                title: (<Typography variant="subtitle2">Mensaje Público</Typography>),
                field: 'publicMessage',
            },
            {
                title: (<Typography variant="subtitle2">Información Complementaria</Typography>),
                render: data => (data.color === YELLOW_ALERT_COLOR || data.color === RED_ALERT_COLOR
                    ? <BlueButton disableElevation onClick={() => this.goToTicket(data.target, data.ticketId, data.status)}>Ver ticket asociado</BlueButton>
                    : null
                )
            },
        ];
    }

    goToTicket(target, ticketId, status) {
        const {scope} = this.props;
        history.push(reverse('authorities.target.tickets.'+scope+'.'+status+'.detail', {target, ticketId}));
    }

}

SemaphoreHistoryTable.propTypes = {};

export default withStyles(styles)(SemaphoreHistoryTable);
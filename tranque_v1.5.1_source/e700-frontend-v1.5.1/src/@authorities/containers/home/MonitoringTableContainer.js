import React from 'react';

import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import moment from 'moment';
import * as TargetService from '@app/services/backend/target';
import * as TimeseriesService from '@app/services/backend/timeseries';
import * as TicketsService from '@app/services/backend/tickets';
import * as config from '@app/config';
import {CircularProgress, Typography, withStyles} from '@material-ui/core';
import MonitoringTable from '@authorities/components/home/MonitoringTable';
import IconTextGrid from '@app/components/utils/IconTextGrid';
import {generateTableData} from '@authorities/services/home/dataFieldsGenerator';
import {LastUpdate} from '@authorities/components/LastUpdate';
import Box from '@material-ui/core/Box';
import {forkJoin} from 'rxjs';
import * as ZoneService from '@app/services/backend/zone';
import MonitoringAlertsEvents from '@authorities/components/home/MonitoringAlertsEvents';

const styles = theme => ({
    container: {
        padding: theme.spacing(3)
    },
    mapButton: {
        border: 'none',
        color: 'black',
        whiteSpace: 'nowrap'
    }
});

const availability = {
    efPublico: false, indiceRiesgo: true,
    efInterno: false, indiceRiesgoEstandar: true,
    indiceImpacto: true, monitoreoRemoto: false
};





/**
 * A container for preparing data for MonitoringTable component.
 *
 * @version 1.0.0
 * @author [Natalia Vidal](https://gitlab.com/nattoV)
 */
export const MonitoringTableContainer = withStyles(styles)(class extends SubscribedComponent {

    state = {
        tickets: [],
        requests: [],
        targets: [],
        indexes: [],
        tableData: [],
        initialLoading: false,
        initialLoadText: '...',
        loading: false,
        regionOptions: [],
        lastUpdate: '--',
        zoneInfo: [],
        loadError: false
    };

    componentDidMount() {
        // this.getInitialTargetList();
        this.getInitialTickets();
        this.getZoneInfo();
    }

    /**
     * Function triggered to get tickets from tickets end-point.
     *
     * @public
     */
    getInitialTickets() {
        this.setState({
            initialLoading: true,
            initialLoadText: 'tickets...',
            loadError: false
        });
        this.subscribe(
            TicketsService.listAll(),
            data => {
                this.setState(state => ({
                    tickets: data,
                    initialLoading: false,
                    lastUpdate: moment().format(config.DATETIME_FORMAT)
                }));
            },
            (err) => this.setState({loadError: true, initialLoading: false}),
            () => this.getInitialRequests()
        );
    }

    getInitialRequests() {
        this.setState({
            initialLoading: true,
            initialLoadText: 'solicitudes...',
            loadError: false
        });
        this.subscribe(
            TicketsService.readNationalAuthorizationRequests(),
            data => {
                this.setState({
                    requests: data.data.results,
                });
            },
            (err) => this.setState({loadError: true}),
            () => this.getInitialTargetList()
        );

    }

    /**
     * Function triggered to get the deposits data from end-point.
     *
     * @public
     */
    getInitialTargetList() {
        this.setState({
            initialLoading: true,
            initialLoadText: 'depósitos...',
            loadError: false
        });
        this.subscribe(
            TargetService.listAll({cache: config.DEFAULT_CACHE_TIME, streamPageResults: true}),
            ({total, page, data}) => {
                this.setState(state => {
                    const targets = data.reduce((acc, t) => ({...acc, [t.canonical_name]: t}), {...state.targets});
                    const targetArray = Object.values(targets);
                    const ret = {
                        targets,
                        initialLoadText: `depósitos... ${targetArray.length} de ${total}`
                    };
                    if (page === 1) {
                        ret.tableData = generateTableData(targetArray, [], state.tickets, availability);
                    }
                    return ret;
                });
            },
            (err) => this.setState({loadError: true, initialLoading: false}),
            () => {
                this.getInitialIndexes();
            }
        );
    }


    /**
     * Function triggered to get index values from timeseries end-point.
     *
     * @public
     */
    getInitialIndexes() {
        this.setState({
            initialLoading: true,
            initialLoadText: 'índices...',
            loadError: false
        });
        this.subscribe(
            TimeseriesService.list({template_category: 'emac-index', max_events: 1}),
            data => {
                this.setState(state => ({
                    indexes: data,
                    tableData: generateTableData(Object.values(state.targets), data, state.tickets, availability),
                    initialLoading: false,
                    lastUpdate: moment().format(config.DATETIME_FORMAT)
                }));
                this.setDataUpdate();
            },
            (err) => this.setState({loadError: true, initialLoading: false})
        );
    }

    setDataUpdate() {
        this.subscribeInterval(
            config.DEFAULT_REFRESH_TIME,
            forkJoin({
                tickets: TicketsService.listAll(),
                requests_data: TicketsService.readNationalAuthorizationRequests(),
                targets: TargetService.listAll({with_remote: true}),
                timeseries: TimeseriesService.list({template_category: 'emac-index', max_events: 1}),
            }),
            ({tickets, targets, timeseries, requests_data}) => {
                this.setState(state => {
                    const _targets = targets.reduce((acc, t) => ({...acc, [t.canonical_name]: t}), {...state.targets});
                    return {
                        loading: false,
                        lastUpdate: moment().format(config.DATETIME_FORMAT),
                        tableData: generateTableData(Object.values(_targets), timeseries, state.tickets, availability),
                        tickets: tickets,
                        indexes: timeseries,
                        targets: _targets,
                        requests: requests_data.data.results
                    };
                });
            },
            undefined,
            undefined,
            () => {
                this.setState({loading: true});
            }
        );
    }


    getZoneInfo() {
        this.subscribe(
            ZoneService.listAll(),
            zones => {
                this.setState({
                    zoneInfo: ZoneService.parseZoneOptions(zones)
                });
            }
        );
    }

    render() {
        const {initialLoading, loading, lastUpdate, tableData, tickets,
            zoneInfo, initialLoadText, loadError, requests} = this.state;
        const {classes} = this.props;
        return (
            <div className={classes.container}>
                <Box display="flex" justifyContent="flex-end" alignItems="center">
                    {initialLoading && <Box display="flex" flexGrow="1" justifyContent="center">
                        <IconTextGrid
                            icon={<CircularProgress size={20}/>}
                            text={<Typography variant="h6">Cargando {initialLoadText}</Typography>}/>
                    </Box>}
                    {loadError && <Box display="flex" flexGrow="1" justifyContent="center">
                        <Typography variant="h6">
                                        No se pudieron cargar los datos
                        </Typography>
                    </Box>}
                    <div>
                        <LastUpdate date={lastUpdate} loading={loading}/>
                    </div>
                </Box>

                <MonitoringAlertsEvents data={tickets} requests={requests}/>

                <MonitoringTable
                    data={tableData}
                    regions={zoneInfo}
                    availability={availability}
                    disabled={initialLoading || loadError}
                />
            </div>
        );
    }
});

export default MonitoringTableContainer;

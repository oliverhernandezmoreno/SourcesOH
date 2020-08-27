import React from 'react';

import {withStyles} from '@material-ui/core/styles';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import {Subscription} from 'rxjs';
import moment from 'moment';
import * as TimeseriesService from '@app/services/backend/timeseries';
import * as config from '@app/config';
import {reverse} from '@app/urls';

import {
    Card,
    CardContent,
    CircularProgress,
    Breadcrumbs,
    Grid,
    LinearProgress,
    Link,
    Paper,
    Typography} from '@material-ui/core';
import CompareArrowsIcon from '@material-ui/icons/CompareArrows';
import Button from '@material-ui/core/Button';
import {Announcement} from '@material-ui/icons';
import IconTextGrid from '@app/components/utils/IconTextGrid';
import {Link as RouterLink} from 'react-router-dom';
import StateDatesList from '@authorities/components/target/index/StateDatesList';
import IndexDateDetail from '@authorities/components/target/index/IndexDateDetail';
import GetIndexDetail from '@authorities/components/target/index/GetIndexDetail';
import {LastUpdate} from '@authorities/components/LastUpdate';
import {getIndexStatus} from '@authorities/services/indexes';
import {getDescription} from '@authorities/services/IndexStateDescriptions';
import {MarkSeriesChart} from '@app/components/charts/MarkSeriesChart';
import {
    getIndexStateColor,
    getIndexStateLabel,
    indexStateToAffectedState,
    NOT_CONFIGURED,
    WITHOUT_ALERT,
    WITH_EVENTS
} from '@authorities/constants/indexState';

const styles = theme => ({
    list: {
        paddingTop: 20
    },
    titleRow: {
        paddingTop: 20
    },
    breadCrumbs: {
        paddingBottom: 10
    },
    chartTitle: {
        padding: theme.spacing(2),
        paddingBottom: 0
    },
    card: {
        backgroundColor: theme.palette.secondary.main,
        textAlign: 'center',
        display: 'block'
    },
    divNoData: {
        display: 'block',
    },
    getDataText: {
        textAlign: 'left',
        padding: 10
    },
    getDataButton: {
        backgroundColor: theme.palette.secondary.main,
        textAlign: 'center',
    },
    textWaiting1: {
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: '400',
        lineHeight: '17px',
        paddingTop: '20px',
        paddingBottom: '10px',
    },
    textWaiting2: {
        textAlign: 'center',
        fontSize: '10px',
        fontWeight: '400',
        lineHeight: '12px',
        paddingTop: '20px',
        paddingBottom: '20px',
    },
});

/**
 * A container for preparing data for an index detail.
 *
 * @version 1.0.0
 * @author [Natalia Vidal](https://gitlab.com/nattoV)
 */
export const IndexDetail = withStyles(styles)(
    class extends SubscribedComponent {
        state = {
            indexName: '',
            indexStatesInfo: [],
            loadingData: false,
            loadingTrace: false,
            lastUpdate: '--',
            selectedData: null,
            chartData: [],
            timeseries: null,
            eventTraces: {}
        };

        traceSub = new Subscription();

        componentDidMount() {
            this.loadData();
        }

        /**
         * Function triggered to handle index state click (list item).
         *
         * @param {date} the state date.
         * @param {indexValue} the index value (state).
         * @public
         */
        handleDetailChange = (indexData) => {
            this.setState({selectedData: indexData});
            this.loadTrace(indexData.event);
            this.setState({loadingData: true});
        };

        /**
         * Function triggered to get a description according an index state.
         *
         * @param {indexValue} the index value (state).
         * @public
         */
        getDescription(indexValue) {
            //const {templateName} = this.props.match.params;
            return getDescription('EMAC-IR-estandar', indexValue); //CAMBIAR DESPUÉS CUANDO HAYAN OTROS TIPOS DE ÍNDICE DISPONIBLE Y LAS DESCRIPCIONES EN BACKEND
        }

        /**
         * Function triggered to get an index data.
         *
         * @public
         */
        loadData() {
            this.unsubscribeAll();
            const {target, templateName} = this.props.match.params;
            this.subscribeInterval(
                config.DEFAULT_REFRESH_TIME,
                TimeseriesService.list({
                    target,
                    template_name: templateName,
                    max_events: 50
                }),
                (data) => {
                    if (data.length > 0) {
                        const {timeseries, indexStatesInfo, chartData} = this.parseTimeseriesData(data);
                        this.setState((state) => ({
                            loadingData: false,
                            indexStatesInfo,
                            timeseries,
                            indexName: data[0].name.split('--').join('•'),
                            selectedData: (state.selectedData ? state.selectedData : this.getDefaultDescription(indexStatesInfo)),
                            chartData,
                            lastUpdate: moment().format(config.DATETIME_FORMAT)
                        }));
                    } else this.setState({loadingData: false});
                },
                undefined,
                () => {
                    this.setState({loadingData: false});
                }
            );
        }

        loadTrace(event) {
            if (event && this.state.eventTraces[event._id] === undefined) {
                this.setState({loadingTrace: true});
                this.subscribe(
                    TimeseriesService.getEventTrace({
                        id: event._id,
                        target: this.props.match.params.target,
                        timeseries: this.state.timeseries.canonical_name,
                        inputs_only: true
                    }),
                    response => {
                        this.setState(state => ({
                            eventTraces: {...state.eventTraces, [event._id]: response}
                        }));
                    },
                    undefined,
                    () => {
                        this.setState({loadingTrace: false});
                    }
                );
            }
        }

        renderWaitingData(){
            const { classes } = this.props;
            return <div>
                <Card className={classes.card}>
                    <CardContent>
                        <CompareArrowsIcon style={{ fontSize: 40 }}/>
                        <Typography className={classes.textWaiting1}>Solicitando datos a la minera...</Typography>
                        <LinearProgress />
                        <Typography className={classes.textWaiting2}>
                Los datos pueden demorar en cargar,
                dependiendo de la velocidad de conexión
                con los servidores de la minera,
                entre otros factores
                        </Typography>
                    </CardContent>
                </Card>
            </div>
        };

        createTraceRequest = () => {
            const event = this.state.selectedData.event;
            this.traceSub.unsubscribe();
            this.traceSub = new Subscription();
            this.subscribe(
                TimeseriesService.createEventTraceRequest({
                    id: event._id,
                    target: this.props.match.params.target,
                    timeseries: this.state.timeseries.canonical_name
                }),
                response => {
                    this.setState(state => ({
                        eventTraces: {
                            ...state.eventTraces,
                            [event._id]: {
                                ...state.eventTraces[event._id],
                                requests: [
                                    response,
                                    ...state.eventTraces[event._id].requests
                                ]
                            }
                        }
                    }));
                    this.traceSub.add(this.subscribeInterval(
                        config.DEFAULT_REFRESH_TIME,
                        TimeseriesService.getEventTrace({
                            id: event._id,
                            target: this.props.match.params.target,
                            timeseries: this.state.timeseries.canonical_name,
                            inputs_only: true
                        }),
                        response => {
                            this.setState(state => ({
                                eventTraces: {...state.eventTraces, [event._id]: response}
                            }));
                            if (!response.requests.some(r=>r.state==='waiting_response')){
                                this.traceSub.unsubscribe();
                                this.traceSub = new Subscription();
                            }
                        },
                    ));
                },
            )
        };

        /**
         * Function triggered to parse timeseries data.
         *
         * @public
         */
        parseTimeseriesData(timeseries) {
            let indexStates = [];
            const data = timeseries.length > 0 ? timeseries[0] : [];
            const chartEvents = [];
            if (data.thresholds) {
                indexStates = data.events.map((event) => {
                    const indexValue = getIndexStatus(event.value, data.thresholds);
                    chartEvents.push({key: '' + indexValue, date: event.date});
                    return {
                        event,
                        date: event.date,
                        indexValue: indexValue,
                        description: this.getDescription(indexValue)
                    };
                });
            }
            
            const chartData = Object.entries(chartEvents
                .reduce(
                    (acc, event) => {
                        event.key = indexStateToAffectedState(+event.key);
                        return acc[event.key] ? {...acc, [event.key]: [...acc[event.key], event.date]} : acc;
                    },
                    {
                        [NOT_CONFIGURED]: [],
                        [WITHOUT_ALERT]: [],
                        [WITH_EVENTS]: [],
                    }
                ))
                .map(([key, value]) => ({
                    label: getIndexStateLabel(+key),
                    color: getIndexStateColor(+key),
                    data: value
                }));
            
            return {
                timeseries: data,
                indexStatesInfo: indexStates.sort((a, b) => this.getDateSortNumber(a, b)),
                chartData
            };
        }

        /**
         * Function triggered to get a sort number to sort an array with date info.
         *
         * @param {data1} the data for an index state.
         * @param {data2} the data for another index state.
         * @public
         */
        getDateSortNumber(data1, data2) {
            if (data1.date.isBefore(data2.date)) return 1;
            else if (data1.date.isAfter(data2.date)) return -1;
            return 0;
        }

        /**
         * Function triggered to set index detail with latest index state info.
         *
         * @param {data} the index states list data.
         * @public
         */
        getDefaultDescription(listData) {
            return listData.length > 0 ? listData[0] : {}; // Recent state description is visible by default
        }

        componentDidUpdate(prevProps, prevState) {
            if (prevState.selectedData !== this.state.selectedData) {
                this.loadTrace(this.state.selectedData.event);
            }
        }

        renderNodata(requests){
            const { classes } = this.props;
            if (requests.some(r=>r.state==='waiting_response')){
                return this.renderWaitingData();
            }
            return(<div className={classes.divNoData}>
                <Button
                    variant="contained"
                    color='primary'
                    size="large"
                    onClick={this.createTraceRequest}>
                    <Typography>Solicitar datos</Typography>
                </Button>
                <Card className={classes.card}>
                    <CardContent>
                        <Announcement />
                        <Typography>Sin datos disponibles</Typography>
                    </CardContent>
                </Card>
            </div>)
        };

        /**
         * Render this component.
         *
         * @public
         */
        render() {
            const {selectedData, indexStatesInfo, chartData, lastUpdate, loadingData, indexName, eventTraces} = this.state;
            const {classes, match: {params: {target, templateName}}} = this.props;
            const eventId = selectedData && selectedData.event ? selectedData.event._id : null;
            const eventData = (eventId && eventTraces[eventId]) || null;
            const trace = eventData ? eventData.trace : [];
            const requests = eventData ? eventData.requests : [];
            const errors = eventData && eventData.errors.dependencies;
            return (
                <>
                    <Grid container justify="space-between" alignItems='center' className={classes.titleRow}>
                        <Grid item xs={12}>
                            <Breadcrumbs separator="›" className={classes.breadCrumbs}>
                                <Link
                                    component={RouterLink}
                                    color="textPrimary"
                                    to={reverse('authorities.target.indexes', {target: target})}>
                                    <Typography variant="body2">Listado de índices</Typography>
                                </Link>
                                <Typography variant="body2">Índice</Typography>
                            </Breadcrumbs>
                        </Grid>
                        <Grid item xs={8}>
                            <Typography variant='h5'>
                                {indexName} {/*DESPUÉS SE AGREGA ÍCONO SI ES 'SIN ESTANDAR PLATAFORMA'*/}
                            </Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <LastUpdate date={lastUpdate} loading={loadingData}/>
                        </Grid>
                    </Grid>
                    <Grid container spacing={3} className={classes.list}>
                        <Grid item xs={12}>
                            <Paper>
                                <Typography className={classes.chartTitle} variant='subtitle2'>
                                    Línea de tiempo últimos 20 cálculos
                                </Typography>
                                <MarkSeriesChart data={chartData}/>
                            </Paper>
                        </Grid>
                        <Grid item xs={5}>
                            <StateDatesList
                                data={indexStatesInfo}
                                onSelect={this.handleDetailChange}
                                selected={selectedData}
                                loading={loadingData}
                                initialStartDate={indexStatesInfo.length > 0 ? indexStatesInfo[indexStatesInfo.length - 1].date : null}
                                initialEndDate={indexStatesInfo.length > 1 ? indexStatesInfo[1].date : null}
                            />
                        </Grid>
                        <Grid item xs={7}>
                            <IndexDateDetail
                                date={selectedData ? selectedData.date : ''}
                                stateDescription={selectedData ? selectedData.description : ''}/>
                            <Typography variant='h5' className={classes.getDataText}>Datos utilizados en el cálculo del índice</Typography>
                            {this.state.loadingTrace ? <IconTextGrid icon={<CircularProgress/>} text="Cargando datos..."/> :
                                errors ? (this.renderNodata(requests)) : (
                                    <GetIndexDetail
                                        templateName={templateName}
                                        trace={trace}
                                    />
                                )}
                        </Grid>
                    </Grid>
                </>
            );
        }
    }
);

export default IndexDetail;

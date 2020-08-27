import React from 'react';
import PropTypes from 'prop-types';
import {forkJoin, of} from 'rxjs';
import {mergeMap} from 'rxjs/operators';
import {Grid, Box, CircularProgress, Typography, ListItemText, Switch,
    MenuItem, FormControl, FormControlLabel, InputLabel, Select, Checkbox,
    CardContent, CardHeader, Card, Paper} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import * as moment from 'moment/moment';
import 'moment/locale/es';
import TimeseriesChart from '@app/components/charts/TimeseriesChart';
import {getEMACLabel, getEMACThresholdLabel, RISK_NORMS} from '@miners/containers/EMAC/EMAC.labels';
import * as TimeseriesService from '@app/services/backend/timeseries';
import {EMAC} from '@miners/containers/EMAC/dashboard/constants';
import SourcesService from '@app/services/backend/sources';
import ButtonExport from '@miners/components/utils/ButtonExport';
import {DatePicker} from '@app/components/utils';
import {COLORS} from '@miners/theme';
import NoDataMessage from '@app/components/utils/NoDataMessage';

const styles = theme => ({
    root: {
        width: '100%'
    },
    select: {
        color: 'white'
    },
    filter: {
        minWidth: theme.spacing(24),
        marginRight: theme.spacing(2),
        marginBottom: theme.spacing(2)
    },
    dateFilter: {
        marginRight: theme.spacing(2),
        marginBottom: theme.spacing(2)
    },
    chartContainer: {
        backgroundColor: theme.palette.secondary.dark,
        color: theme.palette.secondary.contrastText,
        marginBottom: theme.spacing(2)
    },
    chartSubheader: {
        color: COLORS.chart.variable.primary.main
    },
    chart: {
        borderRadius: '4px',
        paddingLeft: '0',
        marginTop: theme.spacing(2),
        paddingRight: theme.spacing(1)
    },
    chartsProgress: {
        padding: theme.spacing(2)
    },
    progress: {
        color: 'white',
        width: '100%'
    },
    pickerLabel: {
        color: 'white'
    }
});

const initialSourcesState = {
    sources: [],
    selectedSource: ''
};
const initialDataState = {
    selectedNorms: [],
    timeseries: []
};

class EMACRawBySource extends SubscribedComponent {

    state = {
        ...initialSourcesState,
        ...initialDataState,
        loadingSources: false,
        loadingData: false,
        requesting: false,
        showPredictions: false,
        chartData: {},
        startDate: this.props.startDate || moment().subtract(1, 'year').startOf('day'),
        endDate: this.props.endDate || moment().endOf('day'),
        noSources: false
    };


    loadSources() {
        this.unsubscribeAll();

        this.setState({
            ...initialSourcesState,
            loadingSources: true,
            requesting: true,
            noSources: false
        });

        const {target} = this.props.match.params;

        this.subscribe(
            SourcesService.list({target, dataSourceGroup: EMAC.dataSourceGroup}),
            (sources) => {
                this.setState({
                    sources: sources,
                    loadingSources: false,
                    requesting: false
                });
            },
            (e) => this.setState({loadingSources: false, requesting: false, noSources: true})
        );
    }

    getTimeseriesForSource(sourceCN, color, color_60, color_95) {
        const {target} = this.props.match.params;

        const tsAggregationOptions = {
            target,
            aggregation_type: 'last',
            color,
            color_60,
            color_95
        };
        if (this.state.endDate) {
            tsAggregationOptions.date_to = this.state.endDate.format();
        }
        if (this.state.startDate) {
            tsAggregationOptions.date_from = this.state.startDate.format();
        }

        const listOptions = {
            target,
            type: 'raw',
            data_source__in: sourceCN
        };

        return forkJoin({
            variables: TimeseriesService.list({
                ...listOptions,
                template_category: EMAC.templateVariables
            }),
            sgt: TimeseriesService.list({
                ...listOptions,
                template_category: EMAC.templateSgt
            })
        }).pipe(
            mergeMap(({variables, sgt}) => {
                const tsRequests = [];
                variables.forEach(variableTs => {
                    tsRequests.push(TimeseriesService.aggregationAndPredictionsForTimeseries({
                        ...tsAggregationOptions,
                        timeseries: variableTs,
                        interval: '1M'
                    }));
                });
                sgt.forEach(sgtTs => {
                    tsRequests.push(TimeseriesService.aggregationAndPredictionsForTimeseries({
                        ...tsAggregationOptions,
                        timeseries: sgtTs,
                        interval: '8h'
                    }));
                });
                if (tsRequests.length > 0) {
                    return forkJoin(...tsRequests);
                } else {
                    return of([]);
                }
            })
        );
    }

    loadSourceData(sourceChange, dateChange) {
        this.unsubscribeAll();
        const stateUpdate = {
            loadingData: true,
            requesting: true
        };

        if (sourceChange) {
            // source change => clean timeseries and norm select options
            stateUpdate.timeseries = [];
            stateUpdate.selectedNorms = [];
        }

        this.setState(stateUpdate);

        const {selectedSource} = this.state;

        let sourceReq;
        // if source or date change
        if (selectedSource && (sourceChange || dateChange)) {
            // get new data
            sourceReq = this.getTimeseriesForSource(
                selectedSource.canonical_name,
                COLORS.chart.variable.primary.main,
                COLORS.chart.variable.primary.area60,
                COLORS.chart.variable.primary.area95
            );
        } else {
            // else return existing data
            sourceReq = of(this.state.timeseries);
        }

        this.subscribe(sourceReq,
            timeseries => {
                this.setState({
                    timeseries,
                    loadingData: false,
                    requesting: false
                });
            }
        );
    }

    componentDidMount() {
        this.loadSources();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.match.params.target !== this.props.match.params.target) {
            this.loadSources();
        } else {
            const source = prevState.selectedSource !== this.state.selectedSource;
            const startDate = prevState.startDate !== this.state.startDate;
            const endDate = prevState.endDate !== this.state.endDate;
            const validDates = moment(this.state.endDate).isValid() && moment(this.state.startDate).isValid();
            if (validDates && (source || startDate || endDate)) {
                this.loadSourceData(source, startDate || endDate);
            }
        }
    }

    onSourceSelect = event => this.setState({selectedSource: event.target.value});

    onNormSelect = event => this.setState({selectedNorms: event.target.value});

    onStartDateSelect = date => this.setState({startDate: date});

    onEndDateSelect = date => this.setState({endDate: date});

    onShowPredictionsChange = event => {
        const changes = {showPredictions: event.target.checked};
        if (event.target.checked) {
            const newEndDate = moment().endOf('day');
            if (!newEndDate.isSame(this.state.endDate)) {
                changes.endDate = newEndDate;
            }
        }
        this.setState(changes);
    };

    normValueRender = (value) => {
        if (value.length === 1) {
            return getEMACLabel(value[0]);
        } else {
            return `${value.length} seleccionadas`;
        }
    };

    render() {
        const {classes} = this.props;
        const {
            requesting,
            sources,
            timeseries,
            selectedSource,
            selectedNorms,
            startDate,
            endDate,
            loadingData,
            loadingSources,
            noSources,
            showPredictions
        } = this.state;

        const sourceOptions = sources.map((s, index) => (
            <MenuItem key={index} value={s}>{s.name}</MenuItem>
        ));

        const charts = timeseries.sort(TimeseriesService.sortByDescription).map(
            (ts, index) => {
                const thresholds = [];
                selectedNorms.forEach(
                    norm => {
                        thresholds.push(
                            ...TimeseriesService.parseChartThresholds(
                                ts.thresholds.find(thr => thr.kind === norm),
                                getEMACThresholdLabel
                            )
                        );
                    }
                );

                let data = ts._extra.aggregation;
                let areas;

                if (showPredictions) {
                    data = [{
                        ...ts._extra.aggregation[0],
                        label: 'Medición'
                    }, {
                        data: [ts._extra.prediction.data],
                        color: COLORS.chart.variable.primary.prediction,
                        label: 'Tendencia'
                    }];
                    areas = ts._extra.prediction.areas;
                }

                let units;
                if (ts.unit) {
                    units = {y: ts.unit.abbreviation};
                }

                return (
                    <Card key={index} className={classes.chartContainer}>
                        <CardContent>
                            <Box display='flex' alignItems="center">
                                <Box flexGrow={1}>
                                    <Typography variant='h6'>
                                        {ts.description}
                                    </Typography>
                                </Box>
                                {!showPredictions && <Box flexShrink={0}>
                                    <ButtonExport
                                        target={this.props.match.params.target}
                                        canonical_name={ts.canonical_name}
                                        source_name={ts.data_source.name}
                                        description={ts.description}/>
                                </Box>}
                            </Box>
                            <Paper>
                                <TimeseriesChart
                                    classes={{root: classes.chart}}
                                    data={data}
                                    areas={areas}
                                    units={units}
                                    thresholds={thresholds}
                                    minX={moment(startDate)}
                                    maxX={moment(endDate)} />
                            </Paper>
                        </CardContent>
                    </Card>
                );
            }
        );
        const riskNormOptions = RISK_NORMS.map((norm, index) =>
            <MenuItem key={index} value={norm}>
                <Checkbox checked={selectedNorms.includes(norm)}/>
                <ListItemText primary={getEMACLabel(norm)}/>
            </MenuItem>
        );

        return (
            <Grid container className={classes.root}>
                <Grid container item xs={12} spacing={1}>
                    <Grid item xs={12}>
                        <Card className={classes.card}>
                            <CardHeader title="Datos por punto de monitoreo"/>
                            <CardContent>
                                <Box display="flex" alignItems="flex-end" flexWrap="wrap">
                                    <FormControl
                                        className={classes.filter}
                                        disabled={sourceOptions.length < 1 || requesting}>
                                        <InputLabel htmlFor="source">Punto de monitoreo</InputLabel>
                                        <Select
                                            value={selectedSource}
                                            onChange={this.onSourceSelect}
                                            inputProps={{
                                                id: 'source'
                                            }}>
                                            {sourceOptions}
                                        </Select>
                                    </FormControl>
                                    <FormControl
                                        className={classes.filter}
                                        disabled={riskNormOptions.length < 1 || requesting || sourceOptions.length < 1}>
                                        <InputLabel htmlFor="norm">Comparar con Uso</InputLabel>
                                        <Select
                                            value={selectedNorms}
                                            multiple={true}
                                            onChange={this.onNormSelect}
                                            renderValue={this.normValueRender}
                                            inputProps={{
                                                id: 'norm'
                                            }}>
                                            {riskNormOptions}
                                        </Select>
                                    </FormControl>
                                    <DatePicker
                                        className={classes.dateFilter}
                                        disabled={requesting || sourceOptions.length < 1}
                                        label="Desde"
                                        maxDate={endDate || moment().endOf('day')}
                                        value={startDate}
                                        onChange={this.onStartDateSelect}
                                        keyboard={true}
                                    />
                                    <DatePicker
                                        className={classes.dateFilter}
                                        disabled={requesting || showPredictions || sourceOptions.length < 1}
                                        label="Hasta"
                                        maxDate={moment().endOf('day')}
                                        minDate={startDate || undefined}
                                        value={endDate}
                                        onChange={this.onEndDateSelect}
                                        keyboard={true}
                                    />
                                    <FormControlLabel
                                        className={classes.filter}
                                        disabled={requesting || sourceOptions.length < 1}
                                        control={
                                            <Switch
                                                checked={showPredictions}
                                                onChange={this.onShowPredictionsChange}
                                                value="checkedB"
                                            />
                                        }
                                        label="Ver tendencias"
                                        labelPlacement="start"
                                    />
                                    {loadingSources && <CircularProgress className={classes.progress}/>}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {noSources ? <Grid item xs={12}><Card><CardContent><NoDataMessage/></CardContent></Card></Grid> :
                        <Grid item xs={12}>
                            <Card className={classes.card}>
                                <CardContent>
                                    {loadingData &&
                                    <Box display="flex" className={classes.chartsProgress} justifyContent="center">
                                        <CircularProgress className={classes.progress}/>
                                    </Box>}
                                    {!loadingData && charts}
                                </CardContent>
                            </Card>
                        </Grid>
                    }
                </Grid>
            </Grid>
        );
    }
}

EMACRawBySource.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(EMACRawBySource);

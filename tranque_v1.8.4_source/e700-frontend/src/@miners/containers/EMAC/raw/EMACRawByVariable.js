import React from 'react';
import PropTypes from 'prop-types';
import {forkJoin, of} from 'rxjs';

import {Grid, Box, CircularProgress, Typography, ListItemText, Switch,
    MenuItem, FormControl, FormControlLabel, InputLabel, Select, Checkbox,
    CardContent, CardHeader, Card, Paper} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import moment from 'moment/moment';
import 'moment/locale/es';
import TimeseriesChart from '@app/components/charts/TimeseriesChart';
import {getEMACLabel, getEMACThresholdLabel, getEMACGroups, RISK_NORMS} from '@miners/containers/EMAC/EMAC.labels';
import * as SourcesService from '@app/services/backend/sources';
import * as TemplatesService from '@app/services/backend/templates';
import * as TimeseriesService from '@app/services/backend/timeseries';
import {parseQueryParams} from '@app/urls';
import {DatePicker} from '@app/components/utils';
import ButtonExport from '@miners/components/utils/ButtonExport';
import {COLORS} from '@miners/theme';
import {EMAC} from '@miners/containers/EMAC/dashboard/constants';
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
    filterMargin: {
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
    chartCompareSubheader: {
        color: COLORS.chart.variable.secondary.main
    },
    chart: {
        borderRadius: '4px',
        paddingLeft: '0',
        paddingRight: theme.spacing(1)
    },
    chartsProgress: {
        padding: theme.spacing(2)
    },
    progress: {
        color: 'white',
        width: '100%'
    }
});

const initialTemplatesState = {
    sources: [],
    templates: [],
    selectedTemplate: '',
    selectedCompareTemplate: ''
};
const initialDataState = {
    selectedNorms: [],
    timeseries: [],
    compareTimeseries: []
};

class EMACRawByVariable extends SubscribedComponent {

    state = {
        ...initialTemplatesState,
        ...initialDataState,
        loadingTemplates: false,
        loadingData: false,
        requesting: false,
        showPredictions: false,
        chartData: {},
        startDate: this.props.startDate || moment().subtract(1, 'year').startOf('day'),
        endDate: this.props.endDate || moment().endOf('day'),
        noTemplates: false
    };


    loadTemplatesAndGroups(params = undefined) {
        this.unsubscribeAll();

        this.setState({
            ...initialTemplatesState,
            loadingTemplates: true,
            requesting: true
        });

        const {target} = this.props.match.params;

        const dataSourceGroup = EMAC.dataSourceGroup;
        this.subscribe(
            forkJoin({
                variables: TemplatesService.list({category: EMAC.templateVariables}),
                sgt: TemplatesService.list({category: EMAC.templateSgt}),
                sources: SourcesService.list({target, dataSourceGroup})
            }),
            ({variables, sgt, sources}) => {
                const stateChanges = {
                    templates: [...variables, ...sgt].sort(TimeseriesService.sortByDescription),
                    sources: sources,
                    loadingTemplates: false,
                    requesting: false,
                    noTemplates: false
                };
                if (params) {
                    if (params.template) {
                        const template = stateChanges.templates.find(t => t.canonical_name === params.template);
                        stateChanges.selectedTemplate = template || '';
                        if (template && template.thresholds && params.showNorms) {
                            stateChanges.selectedNorms = template.thresholds
                                .filter(t => RISK_NORMS.includes(t.kind))
                                .map(t => t.kind);
                        }
                    }
                    if (params.predictions) {
                        stateChanges.showPredictions = true;
                    }
                }
                this.setState(stateChanges);
            },
            (e) => this.setState({loadingTemplates: false, requesting: false, noTemplates: true})
        );
    }

    getChartsData(timeseries, compareTimeseries) {
        // chartData
        // keys are the source groups canonical names,
        // values are objects with the timeseries and compareTimeseries data
        const chartData = {};
        timeseries.forEach(t => {
            const source = chartData[t.data_source.canonical_name] || {};
            source.timeseries = t;
            chartData[t.data_source.canonical_name] = source;
        });
        compareTimeseries.forEach(t => {
            const source = chartData[t.data_source.canonical_name] || {};
            source.compareTimeseries = t;
            chartData[t.data_source.canonical_name] = source;
        });
        return chartData;
    }

    loadTemplateData(templateChange, dateChange, compareTemplateChange) {
        this.unsubscribeAll();
        const stateUpdate = {
            loadingData: true,
            requesting: true
        };

        const {selectedTemplate, selectedCompareTemplate} = this.state;

        if (templateChange) {
            // Template change => clean timeseries and remove selected options not in thresholds list
            stateUpdate.timeseries = [];
            if (selectedTemplate.thresholds) {
                stateUpdate.selectedNorms = selectedTemplate.thresholds
                    .filter(t => this.state.selectedNorms.includes(t.kind))
                    .map(t => t.kind);
            } else {
                stateUpdate.selectedNorms = [];
            }
        }
        if (compareTemplateChange) {
            // Compare template change => clean compare timeseries
            stateUpdate.compareTimeseries = [];
        }

        this.setState(stateUpdate);

        const requestOptions = {
            target: this.props.match.params.target,
            data_source__in: this.state.sources.map(ds => ds.canonical_name).join(','),
            aggregation_type: 'last',
            interval: '1M'
        };
        if (this.state.endDate) {
            requestOptions.date_to = this.state.endDate.format();
        }
        if (this.state.startDate) {
            requestOptions.date_from = this.state.startDate.format();
        }

        let templateReq;
        // if template or date change
        if (selectedTemplate && (templateChange || dateChange)) {
            // get new data
            templateReq = TimeseriesService.aggregationAndPredictionsForTemplate({
                ...requestOptions,
                template_name: selectedTemplate.canonical_name,
                color: COLORS.chart.variable.primary.main,
                color_60: COLORS.chart.variable.primary.area60,
                color_95: COLORS.chart.variable.primary.area95
            });
        } else {
            // else return existing data
            templateReq = of(this.state.timeseries);
        }

        let compareTemplateReq;
        if (selectedCompareTemplate && (compareTemplateChange || dateChange)) {
            compareTemplateReq = TimeseriesService.aggregationAndPredictionsForTemplate({
                ...requestOptions,
                template_name: selectedCompareTemplate.canonical_name,
                color: COLORS.chart.variable.secondary.main,
                color_60: COLORS.chart.variable.secondary.area60,
                color_95: COLORS.chart.variable.secondary.area95
            });
        } else if (selectedCompareTemplate === '') {
            compareTemplateReq = of([]);
        } else {
            compareTemplateReq = of(this.state.compareTimeseries);
        }

        this.subscribe(
            forkJoin({
                timeseries: templateReq,
                compareTimeseries: compareTemplateReq
            }),
            ({timeseries, compareTimeseries}) => {
                this.setState({
                    timeseries,
                    compareTimeseries,
                    chartData: this.getChartsData(timeseries, compareTimeseries),
                    loadingData: false,
                    requesting: false
                });
            }
        );
    }

    componentDidMount() {
        let params;
        if (this.props.location.search) {
            params = parseQueryParams(this.props.location.search);
        }
        this.loadTemplatesAndGroups(params);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.match.params.target !== this.props.match.params.target) {
            this.loadTemplatesAndGroups();
        } else {
            const template = prevState.selectedTemplate !== this.state.selectedTemplate;
            const startDate = prevState.startDate !== this.state.startDate;
            const endDate = prevState.endDate !== this.state.endDate;
            const compareTemplate = prevState.selectedCompareTemplate !== this.state.selectedCompareTemplate;
            const validDates = moment(this.state.endDate).isValid() && moment(this.state.startDate).isValid();
            if (validDates && (template || startDate || endDate || compareTemplate)) {
                this.loadTemplateData(template, startDate || endDate, compareTemplate);
            }
        }
    }

    onTemplateSelect = event => this.setState({selectedTemplate: event.target.value});

    onTemplateCompareSelect = event => this.setState({selectedCompareTemplate: event.target.value});

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

    renderGroupedChart(template, norms, timeseriesCollection) {
        const {classes} = this.props;
        const {startDate, endDate} = this.state;
        if (timeseriesCollection.length === 0) {
            return null;
        }
        const variableUnit = timeseriesCollection[0].unit;
        const unit = variableUnit ? {y: variableUnit.abbreviation} : undefined;
        const thresholds = norms
            .map((norm) => TimeseriesService.parseChartThresholds(
                (template.thresholds || []).find(thr => thr.kind === norm),
                getEMACThresholdLabel
            ))
            .reduce((flat, nested) => [...flat, ...nested], []);
        const data = timeseriesCollection
            .map(({data_source: {name}, _extra: {aggregation: [values]}}) => ({
                ...values,
                label: name,
                color: undefined
            }));
        return (<Paper>
            <TimeseriesChart
                classes={{root: classes.chart}}
                data={data}
                units={unit}
                thresholds={thresholds}
                minX={moment(startDate)}
                maxX={moment(endDate)} />
        </Paper>
        );
    }

    renderGroupedCharts() {
        const {classes} = this.props;
        const {chartData, selectedNorms, selectedTemplate, selectedCompareTemplate} = this.state;
        if (Object.keys(chartData).length === 0) {
            return null;
        }
        return (
            <Card className={classes.chartContainer}>
                <CardHeader title="Comparativo en los puntos de monitoreo" />
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={selectedCompareTemplate ? 6 : 12}>
                            {this.renderGroupedChart(
                                selectedTemplate,
                                selectedNorms,
                                Object.values(chartData).map(({timeseries}) => timeseries)
                            )}
                        </Grid>
                        {selectedCompareTemplate && <Grid item xs={6}>
                            {this.renderGroupedChart(
                                selectedCompareTemplate,
                                selectedNorms,
                                Object.values(chartData)
                                    .map(({compareTimeseries}) => compareTimeseries)
                                    .filter((t) => t)
                            )}
                        </Grid>}
                    </Grid>
                </CardContent>
            </Card>
        );
    }

    render() {
        const {classes} = this.props;
        const {
            requesting,
            templates,
            selectedTemplate,
            selectedCompareTemplate,
            selectedNorms,
            startDate,
            endDate,
            loadingData,
            loadingTemplates,
            noTemplates,
            showPredictions,
            chartData
        } = this.state;
        const templateOptions = templates.map((t, index) => (
            <MenuItem key={index} value={t}>{t.description}</MenuItem>
        ));

        const thresholds = [];
        const compareThresholds = [];
        selectedNorms.forEach(
            norm => {
                thresholds.push(
                    ...TimeseriesService.parseChartThresholds(
                        (selectedTemplate.thresholds || []).find(thr => thr.kind === norm),
                        getEMACThresholdLabel
                    )
                );
                if (selectedCompareTemplate) {
                    compareThresholds.push(
                        ...TimeseriesService.parseChartThresholds(
                            (selectedCompareTemplate.thresholds || []).find(thr => thr.kind === norm),
                            getEMACThresholdLabel
                        )
                    );
                }
            }
        );
        const charts = Object.values(chartData).map(
            (cd, index) => {
                const ts = cd.timeseries;
                let data = ts._extra.aggregation;
                let areas, unit;

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
                if (ts.unit) {
                    unit = {y: ts.unit.abbreviation};
                }

                const cts = cd.compareTimeseries;
                let compareData, compareAreas, compareUnit;

                if (cts) {
                    if (showPredictions) {
                        compareData = [{
                            ...cts._extra.aggregation[0],
                            label: 'Medición'
                        }, {
                            data: [cts._extra.prediction.data],
                            color: COLORS.chart.variable.secondary.prediction,
                            label: 'Tendencia'
                        }];
                        compareAreas = cts._extra.prediction.areas;
                    } else {
                        compareData = cts._extra.aggregation;
                    }
                    if (cts.unit) {
                        compareUnit = {y: cts.unit.abbreviation};
                    }
                }

                const key = `${index}${cts ? 'with-cts' : ''}`;

                return (
                    <Card key={key} className={classes.chartContainer}>
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Box display='flex' alignItems="center">
                                        <Box flexGrow={1}>
                                            <Typography variant='h6'>
                                                {ts.data_source.name}
                                            </Typography>
                                            <Typography variant='body2'>
                                                {getEMACGroups(ts.data_source).join(', ')}
                                            </Typography>
                                        </Box>
                                        {!cts && !showPredictions && <Box flexShrink={0}>
                                            <ButtonExport
                                                target={this.props.match.params.target}
                                                canonical_name={ts.canonical_name}
                                                source_name={ts.data_source.name}
                                                description={ts.description}/>
                                        </Box>}
                                    </Box>
                                </Grid>
                                <Grid item xs={cts ? 6 : 12}>
                                    <Paper>
                                        <TimeseriesChart
                                            classes={{root: classes.chart}}
                                            data={data}
                                            areas={areas}
                                            units={unit}
                                            thresholds={thresholds}
                                            minX={moment(startDate)}
                                            maxX={moment(endDate)}/>
                                    </Paper>
                                </Grid>
                                {cts &&
                                <Grid item xs={6}>
                                    <Paper>
                                        <TimeseriesChart
                                            classes={{root: classes.chart}}
                                            data={compareData}
                                            areas={compareAreas}
                                            units={compareUnit}
                                            thresholds={compareThresholds}
                                            minX={moment(startDate)}
                                            maxX={moment(endDate)}/>
                                    </Paper>
                                </Grid>}
                            </Grid>
                        </CardContent>
                    </Card>
                );
            }
        );
        let riskNormOptions = [];
        if (selectedTemplate && selectedTemplate.thresholds) {
            riskNormOptions = selectedTemplate.thresholds
                .filter(t => RISK_NORMS.includes(t.kind))
                .map((t, index) =>
                    <MenuItem key={index} value={t.kind}>
                        <Checkbox checked={selectedNorms.includes(t.kind)}/>
                        <ListItemText primary={getEMACLabel(t.kind)}/>
                    </MenuItem>
                );
        }

        return (
            <Grid container className={classes.root}>
                <Grid container item xs={12} spacing={1}>
                    <Grid item xs={12}>
                        <Card>
                            <CardHeader title="Datos por variable"/>
                            <CardContent>
                                <Box display="flex" alignItems="flex-end" flexWrap="wrap">
                                    <FormControl
                                        className={classes.filter}
                                        disabled={templateOptions.length < 1 || requesting}>
                                        <InputLabel htmlFor="Variable">Variable</InputLabel>
                                        <Select
                                            value={selectedTemplate}
                                            onChange={this.onTemplateSelect}
                                            inputProps={{
                                                id: 'Variable'
                                            }}>
                                            {templateOptions}
                                        </Select>
                                    </FormControl>
                                    <FormControl
                                        className={classes.filter}
                                        disabled={riskNormOptions.length < 1 || requesting || templateOptions.length < 1 }>
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
                                        className={classes.filterMargin}
                                        disabled={requesting || templateOptions.length < 1}
                                        label="Desde"
                                        maxDate={endDate || moment().endOf('day')}
                                        value={startDate}
                                        onChange={this.onStartDateSelect}
                                        keyboard={true}
                                    />
                                    <DatePicker
                                        className={classes.filterMargin}
                                        disabled={requesting || showPredictions || templateOptions.length < 1}
                                        label="Hasta"
                                        maxDate={moment().endOf('day')}
                                        minDate={startDate || undefined}
                                        value={endDate}
                                        onChange={this.onEndDateSelect}
                                        keyboard={true}
                                    />
                                    <FormControl
                                        className={classes.filter}
                                        disabled={templateOptions.length < 1 || !selectedTemplate || requesting}>
                                        <InputLabel htmlFor="compare-variable">Comparar con variable</InputLabel>
                                        <Select
                                            value={selectedCompareTemplate}
                                            onChange={this.onTemplateCompareSelect}
                                            inputProps={{
                                                id: 'compare-variable'
                                            }}>
                                            <MenuItem value="">Ninguna</MenuItem>
                                            {templateOptions}
                                        </Select>
                                    </FormControl>
                                    <FormControlLabel
                                        className={classes.filter}
                                        disabled={requesting || templateOptions.length < 1}
                                        control={
                                            <Switch
                                                checked={showPredictions}
                                                onChange={this.onShowPredictionsChange}
                                            />
                                        }
                                        label="Ver tendencias"
                                        labelPlacement="start"
                                    />
                                    {loadingTemplates && <CircularProgress className={classes.progress}/>}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {noTemplates ?  <Grid item xs={12}><Card><CardContent><NoDataMessage/></CardContent></Card></Grid> :
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Grid container>
                                        {selectedTemplate && <Grid item xs={6}>
                                            <Typography
                                                variant="h5"
                                                gutterBottom={true}
                                                className={classes.chartSubheader}>
                                                {selectedTemplate.description}
                                            </Typography>
                                        </Grid>}
                                        {selectedTemplate && selectedCompareTemplate && <Grid item xs={6}>
                                            <Typography
                                                variant="h5"
                                                gutterBottom={true}
                                                className={classes.chartCompareSubheader}>
                                                {selectedCompareTemplate.description}
                                            </Typography>
                                        </Grid>}
                                    </Grid>
                                    {loadingData &&
                                        <Box display="flex" className={classes.chartsProgress} justifyContent="center">
                                            <CircularProgress className={classes.progress}/>
                                        </Box>}
                                    {!loadingData && charts}
                                    {!loadingData && this.renderGroupedCharts()}
                                </CardContent>
                            </Card>
                        </Grid>
                    }

                </Grid>
            </Grid>
        );
    }
}

EMACRawByVariable.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(EMACRawByVariable);

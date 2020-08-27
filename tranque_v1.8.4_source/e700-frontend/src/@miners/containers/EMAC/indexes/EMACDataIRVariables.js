import React from 'react';
import PropTypes from 'prop-types';
import {forkJoin, of} from 'rxjs';
import moment from 'moment/moment';
import Grid from '@material-ui/core/Grid';
import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CircularProgress from '@material-ui/core/CircularProgress';

import TimeseriesChart from '@app/components/charts/TimeseriesChart';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import {getEMACLabel, getEMACThresholdLabel, getEMACGroups} from '@miners/containers/EMAC/EMAC.labels';
import Box from '@material-ui/core/Box';
import {ArrowBack} from '@material-ui/icons';
import Button from '@material-ui/core/Button';
import history from '@app/history';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import {DatePicker} from '@app/components/utils';
import SourcesService from '@app/services/backend/sources';
import TemplatesService from '@app/services/backend/templates';
import {mergeMap} from 'rxjs/operators';
import * as TimeseriesService from '@app/services/backend/timeseries';
import CardHeader from '@material-ui/core/CardHeader';
import ButtonExport from '@miners/components/utils/ButtonExport';
import {COLORS} from '@miners/theme';

const styles = theme => ({
    root: {
        width: '100%'
    },
    header: {
        padding: '16px',
        backgroundColor: theme.palette.secondary.main
    },
    variableName: {
        color: COLORS.chart.variable.primary.main
    },
    progress: {
        color: 'white',
        marginLeft: '1rem'
    },
    filter: {
        marginRight: theme.spacing(2),
        marginBottom: theme.spacing(2)
    },
    chartContainer: {
        backgroundColor: '#262629',
        marginBottom: theme.spacing(2)
    }
});

class EMACDataIRVariables extends SubscribedComponent {

    state = {
        sources: [],
        data: {},
        timeseries: [],
        template: {},
        loading: true,
        startDate: moment().subtract(1, 'year').startOf('day'),
        endDate: moment().endOf('day'),
        hideNorm: false,
        showPredictions: false
    };

    loadData() {
        this.unsubscribeAll();

        this.setState({template: {}, loading: true});

        const {target, templateCN, waterType, indexType} = this.props.match.params;
        const {startDate, endDate} = this.state;

        this.subscribe(
            forkJoin({
                template: TemplatesService.read({canonical_name: templateCN}),
                _sources: SourcesService.list({target, dataSourceGroup: 'aguas-abajo'})
            }).pipe(
                mergeMap(({template, _sources}) => {
                    const sources = _sources.filter(s => s.groups.includes(waterType));
                    this.setState({template, sources});
                    return forkJoin({
                        template: of(template),
                        timeseries: TimeseriesService.aggregationAndPredictionsForTemplate({
                            target,
                            template_name: templateCN,
                            data_source__in: sources.map(ds => ds.canonical_name).join(','),
                            aggregation_type: 'last',
                            date_to: endDate.format(),
                            date_from: startDate.format(),
                            interval: '1M',
                            color: COLORS.chart.variable.primary.main,
                            color_60: COLORS.chart.variable.primary.area60,
                            color_95: COLORS.chart.variable.primary.area95
                        })
                    });
                })
            ),
            ({template, timeseries}) => {
                const chartData = [];
                timeseries.forEach((ts) => {
                    chartData.push(...ts._extra.aggregation.map(cd => ({
                        ...cd,
                        label: ts.data_source.name,
                        color: undefined
                    })));
                });
                this.setState({
                    data: {
                        events: chartData,
                        thresholds: TimeseriesService.parseChartThresholds(
                            template.thresholds.find(thr => thr.kind === indexType),
                            getEMACThresholdLabel
                        )
                    },
                    timeseries,
                    loading: false
                });
            }
        );
    }

    onShowPredictionsChange = event => {
        const changes = {showPredictions: event.target.checked};
        if (event.target.checked) {
            changes.end_date = moment().endOf('day');
        }
        this.setState(changes);
    };

    onHideNormChange = event => this.setState({hideNorm: event.target.checked});

    onStartDateSelect = date => this.setState({startDate: date});

    onEndDateSelect = date => this.setState({endDate: date});

    componentDidMount() {
        this.loadData();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.match.params.target !== this.props.match.params.target
            || prevProps.match.params.template !== this.props.match.params.template
            || prevProps.match.params.waterType !== this.props.match.params.waterType
            || prevProps.match.params.indexType !== this.props.match.params.indexType) {
            this.loadData();
        } else {
            const startDate = prevState.startDate !== this.state.startDate;
            const endDate = prevState.endDate !== this.state.endDate;
            const validDates = moment(this.state.endDate).isValid() && moment(this.state.startDate).isValid();
            if (validDates && (startDate || endDate)) {
                this.loadData();
            }
        }
    }

    render() {
        const {classes} = this.props;
        const {data, template, loading, startDate, endDate, showPredictions, hideNorm, timeseries} = this.state;
        const waterType = getEMACLabel(this.props.match.params.waterType);
        const indexType = getEMACLabel(this.props.match.params.indexType);

        const thresholds = hideNorm ? undefined : data.thresholds;

        const unit = template.unit ? {y: template.unit.abbreviation} : undefined;

        const charts = Object.values(timeseries).map(
            (ts, index) => {
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
                return (
                    <Card key={index} className={classes.chartContainer}>
                        <CardContent>
                            <Box display='flex' alignItems="center">
                                <Box flexGrow={1}>
                                    <Typography variant='h6'>
                                        {ts.data_source.name}
                                    </Typography>
                                    <Typography variant='body2' color='textSecondary'>
                                        {getEMACGroups(ts.data_source).join(', ')}
                                    </Typography>
                                </Box>
                                <Box flexShrink={0}>
                                    <ButtonExport
                                        target={this.props.match.params.target}
                                        canonical_name={ts.canonical_name}
                                        source_name={ts.data_source.name}
                                        description={ts.description}/>
                                </Box>
                            </Box>
                            <TimeseriesChart
                                classes={{root: classes.chart}}
                                data={data}
                                areas={areas}
                                units={unit}
                                thresholds={thresholds}
                                minX={moment(startDate)}
                                maxX={moment(endDate)} />
                        </CardContent>
                    </Card>
                );
            }
        );

        return (
            <Grid container className={classes.root}>
                <Grid container item xs={12} spacing={1}>
                    <Grid item xs={12}>
                        <Box display='flex' className={classes.header}>
                            <Box flexGrow={1}>
                                <Typography variant='h6'>
                                    Detalle de variable de Índice de Riesgo en {waterType}, Uso {indexType}
                                </Typography>
                            </Box>
                            <Box flexShrink={0} alignSelf="center">
                                <Button
                                    variant="outlined"
                                    onClick={() => history.goBack()}>
                                    <ArrowBack/> Volver
                                </Button>
                            </Box>
                        </Box>
                        <Box display='flex' className={classes.header}>
                            <Box flexGrow={1}>
                                <Typography variant='h6' className={classes.variableName}>
                                    {(template.description || '').toUpperCase()}
                                </Typography>
                            </Box>
                            <Box flexShrink={0} alignSelf="center">
                                {loading && <CircularProgress className={classes.progress}/>}
                            </Box>
                        </Box>
                        <Box display="flex" alignItems="flex-end" flexWrap="wrap" className={classes.header}>
                            <DatePicker
                                className={classes.filter}
                                disabled={loading}
                                label="Desde"
                                maxDate={endDate || moment().endOf('day')}
                                value={startDate}
                                onChange={this.onStartDateSelect}
                            />
                            <DatePicker
                                className={classes.filter}
                                disabled={loading || showPredictions}
                                label="Hasta"
                                maxDate={moment().endOf('day')}
                                minDate={startDate || undefined}
                                value={endDate}
                                onChange={this.onEndDateSelect}
                            />
                            <FormControlLabel
                                className={classes.filter}
                                disabled={loading}
                                control={
                                    <Switch
                                        disabled={loading}
                                        checked={showPredictions}
                                        onChange={this.onShowPredictionsChange}
                                    />
                                }
                                label="Ver tendencias"
                                labelPlacement="start"
                            />
                            <FormControlLabel
                                className={classes.filter}
                                disabled={loading}
                                control={
                                    <Switch
                                        disabled={loading}
                                        checked={hideNorm}
                                        onChange={this.onHideNormChange}
                                    />
                                }
                                label="Ocultar valor de referencia"
                                labelPlacement="start"
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        {!loading && charts}
                        {!loading &&
                        <Card className={classes.chartContainer}>
                            <CardHeader
                                title="Comparativo en los puntos de monitoreo aguas abajo"
                            />
                            <CardContent>
                                <TimeseriesChart
                                    data={data.events}
                                    units={unit}
                                    thresholds={thresholds}
                                    minX={moment(startDate)}
                                    maxX={moment(endDate)}
                                />
                            </CardContent>
                        </Card>}
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}

EMACDataIRVariables.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(EMACDataIRVariables);

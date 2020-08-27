import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import classNames from 'classnames';
import TimeseriesChart from '@app/components/charts/TimeseriesChart';
import PropTypes from 'prop-types';
import React from 'react';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import EMACIRVariablesChips from '@miners/containers/EMAC/indexes/EMACIRVariablesChips';
import {route} from '@app/urls';
import {Route, Switch} from 'react-router';
import EMACDataIRVariables from '@miners/containers/EMAC/indexes/EMACDataIRVariables';
import {getEMACLabel} from '@miners/containers/EMAC/EMAC.labels';
import * as TimeseriesService from '@app/services/backend/timeseries';


const styles = theme => ({
    root: {
        width: '100%'
    },
    header: {
        padding: '16px',
        backgroundColor: theme.palette.secondary.main
    },
    card: {
        height: '100%',
        backgroundColor: '#161719'
    },
    statusIcon: {
        fontSize: '16px'
    },
    statusOk: {
        color: '#38E47B'
    },
    statusWarning: {
        color: '#FDFF3F'
    },
    statusDisabled: {
        color: '#8E8E8E'
    },
    disabled: {
        filter: 'grayscale(0.5)',
        color: '#8E8E8E'
    },
    impactIndexText: {
        color: 'inherit',
        marginLeft: '10px'
    },
    gridContainer: {
        gridGap: `${theme.spacing(1)}px`
    },
    noBorder: {
        border: 'none'
    },
    innerCard: {
        backgroundColor: '#464646',
        height: '100%',
        padding: '0.75rem'
    },
    indexLastValue: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '2rem'
    }
});

const DEFAULT_RISK_THRESHOLD = 0;

class EMACDataIR extends SubscribedComponent {

    state = {
        timeseriesData: []
    };

    loadData() {
        // unsubscribe from any previous request
        this.unsubscribeAll();
        const {classes, template, target, waterType, indexType} = this.props;
        const waterTypeLabel = getEMACLabel(waterType);
        const indexLabel = getEMACLabel(indexType);

        let status = classes.statusDisabled;
        let statusMessage = <Typography variant='body1' className={classes.statusDisabled}>Sin informacion</Typography>;

        this.subscribe(
            TimeseriesService.list({
                target,
                template_name: template,
                max_events: 1
            }),
            results => {
                let threshold, value, date, valueMeta;
                if (results.length > 0) {
                    const serie = results[0];
                    threshold = serie.thresholds && serie.thresholds[0] ? serie.thresholds[0].upper : DEFAULT_RISK_THRESHOLD;
                    if (serie.events.length > 0) {
                        value = serie.events[0].roundedValue;
                        valueMeta = serie.events[0].meta;
                        date = serie.events[0].date;
                        if (serie.events[0].value > threshold) {
                            status = classes.statusWarning;
                            statusMessage =
                                <Typography variant='body1' className={status}>Existen variables que exceden los
                                    valores de referencia para el Uso {indexLabel}</Typography>;
                        } else {
                            status = classes.statusOk;
                            statusMessage =
                                <Typography variant='body1' className={status}>Ninguna variable excede los valores de
                                    referencia para el Uso {indexLabel}</Typography>;
                        }
                    }
                    this.subscribe(
                        TimeseriesService.aggregation({
                            target,
                            timeseries: serie.canonical_name,
                            aggregation_type: 'max',
                            interval: '1M'
                        }),
                        events => {
                            this.setState({
                                timeseriesData: [{label: waterTypeLabel, data: events}]
                            });
                        }
                    );
                    this.setState({threshold, value, valueMeta, date, status, statusMessage});
                }
            }
        );
        this.setState({
            status,
            statusMessage,
            threshold: undefined,
            value: undefined,
            valueMeta: undefined,
            date: undefined,
            timeseriesData: undefined
        });
    }

    componentDidMount() {
        this.loadData();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.template !== this.props.template) {
            this.loadData();
        }
    }

    renderMainContent(match) {

        const {classes, waterType, indexType} = this.props;
        const waterTypeLabel = getEMACLabel(waterType);
        const indexLabel = getEMACLabel(indexType);

        return (
            <Grid container className={classes.root}>
                <Grid container item xs={12}>
                    <Grid item xs={12}>
                        <div className={classes.header}>
                            <Typography variant='h6'>
                                Índice de Riesgo en {waterTypeLabel}, Uso {indexLabel}
                            </Typography>
                            <Typography variant='subtitle2' style={{color: '#8E8E8E'}}>
                                Permite identificar aquellas variables que exceden los valores de referencia para un
                                determinado uso
                            </Typography>
                        </div>
                    </Grid>
                    <Grid item xs={12}>
                        <Card className={classes.card}>
                            <CardContent>
                                <Grid container spacing={1}>
                                    <Grid item xs={12}>
                                        {this.state.statusMessage}
                                        <Typography variant='caption'>
                                            Índice de riesgo mayor a cero, indica que existen variables que exceden
                                            valores de referencia para un determinado uso
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={8}>
                                        <div className={classes.innerCard} style={{paddingBottom: '2rem'}}>
                                            <TimeseriesChart
                                                minY={0}
                                                units={{y: 'Indice de Riesgo'}}
                                                data={this.state.timeseriesData}/>
                                        </div>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <div className={classNames(classes.innerCard, classes.indexLastValue)}>
                                            <Typography
                                                variant='h6'
                                                align='center'>Indice de Riesgo {waterTypeLabel}</Typography>
                                            <Typography
                                                variant='h5'
                                                align='center'>Uso {indexLabel}</Typography>
                                            <Typography
                                                variant='h1' className={this.state.status}
                                                align='center'>{this.state.value === undefined ? '--' : this.state.value}</Typography>
                                            <Typography variant='h6' align='center'>Actualizado
                                                el {this.state.date ? this.state.date.format('ll') : '--'}</Typography>
                                        </div>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12}>
                        <Card className={classes.card}>
                            <CardContent>
                                <EMACIRVariablesChips
                                    target={this.props.target}
                                    indexMeta={this.state.valueMeta}
                                    waterType={waterType}
                                    indexType={indexType}
                                    match={match}/>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Grid>
        );
    }

    render() {
        return (
            <Switch>
                {/* Variable Detail */}
                <Route path={route('miners.target.emac.data.ir.detail')} component={EMACDataIRVariables}/>
                {/* Main Content */}
                <Route
                    path={route('miners.target.emac.data.ir')}
                    render={(props) => this.renderMainContent(props.match)}/>
            </Switch>
        );
    }
}

EMACDataIR.propTypes = {
    classes: PropTypes.object.isRequired,
    target: PropTypes.string.isRequired,
    template: PropTypes.string.isRequired,
    indexType: PropTypes.string.isRequired,
    waterType: PropTypes.string.isRequired
};

export default withStyles(styles)(EMACDataIR);

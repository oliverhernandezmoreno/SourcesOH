import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Grid from '@material-ui/core/Grid';
import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card/Card';
import CardContent from '@material-ui/core/CardContent';

import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import TimeseriesChart from '@app/components/charts/TimeseriesChart';
import * as TimeseriesService from '@app/services/backend/timeseries';


const styles = (theme) => ({
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

const DEFAULT_IMPACT_THRESHOLD = 1;

class EMACDataII extends SubscribedComponent {

    status = {
        PENDING: 'PENDING',
        OK: 'OK',
        WARNING: 'WARNING'
    };

    state = {
        threshold: null,
        value: null,
        date: null,
        status: 'PENDING',
        timeseriesData: [],
        timeseriesThresholds: []
    };

    componentDidMount() {
        this.loadData();
    }

    componentDidUpdate({template}) {
        if (template !== this.props.template) {
            this.unsubscribeAll();
            this.loadData();
        }
    }

    errorToast(err) {
        // TODO add error toast
    }

    loadData() {
        this.subscribe(
            TimeseriesService.list({
                cache: 60 * 1000,  // one minute
                target: this.props.target,
                template_name: this.props.template,
                max_events: 1
            }),
            (data) => {
                const [serie] = data;
                const threshold = (serie.thresholds.find(t => t.kind === 'ii') || {upper: DEFAULT_IMPACT_THRESHOLD}).upper;
                const [event] = serie.events;
                if (!event) {
                    this.errorToast();
                    return;
                }
                this.setState({
                    status: event.value <= threshold ?
                        this.status.OK : this.status.WARNING,
                    threshold,
                    value: event.roundedValue,
                    date: event.date,
                    timeseriesData: undefined  // trigger a redraw
                });
                this.subscribe(
                    TimeseriesService.aggregation({
                        cache: 60 * 1000,  // one minute
                        target: this.props.target,
                        timeseries: serie.canonical_name,
                        aggregation_type: 'max',
                        interval: '1M'
                    }),
                    (data) => {
                        this.setState({
                            timeseriesData: [{label: this.props.label, data}],
                            timeseriesThresholds: [{value: threshold, label: 'Umbral potencial afectación'}]
                        });
                    },
                    this.errorToast.bind(this)
                );
            },
            this.errorToast.bind(this)
        );
    }

    statusClass() {
        const {classes} = this.props;
        return {
            [this.status.PENDING]: classes.statusDisabled,
            [this.status.OK]: classes.statusOk,
            [this.status.WARNING]: classes.statusWarning
        }[this.state.status];
    }

    renderStatusMessage() {
        if (this.state.status === this.status.PENDING) {
            return (
                <Typography variant='body1' className={this.statusClass()}>
                    Sin informacion
                </Typography>
            );
        } else if (this.state.status === this.status.OK) {
            return (
                <Typography variant='body1' className={this.statusClass()}>
                    No existe potencial afectación en {this.props.label}
                </Typography>
            );
        } else {
            return (
                <Typography variant='body1' className={this.statusClass()}>
                    Existe potencial afectación en {this.props.label}
                </Typography>
            );
        }
    }

    render() {
        const {classes} = this.props;
        return (
            <Grid container className={classes.root}>
                <Grid container item xs={12} spacing={1}>
                    <Grid item xs={12}>
                        <div className={classes.header}>
                            <Typography variant='h6'>
                                Índice de impacto de {this.props.label}
                            </Typography>
                            <Typography variant='subtitle2' style={{color: '#8E8E8E'}}>
                                Permite identificar afectaciones de las {this.props.label}, circundantes a un depósito
                                de relaves. Compara las concentraciones representativas aguas abajo con aquellas aguas
                                arriba.
                            </Typography>
                        </div>
                    </Grid>
                    <Grid item xs={12}>
                        <Card className={classes.card}>
                            <CardContent>
                                <Grid container spacing={4}>
                                    <Grid item xs={12}>
                                        {this.renderStatusMessage()}
                                        <Typography variant='caption'>Índice mayor
                                            a {this.state.threshold === null ? '--' : this.state.threshold} equivale
                                            a potencial afectación de las aguas abajo, debido a la influencia
                                            del depósito
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <div className={classNames(classes.innerCard, classes.indexLastValue)}>
                                            <Typography variant='h6' align='center'>Indice de
                                                Impacto {this.props.label}</Typography>
                                            <Typography variant='h1' className={this.statusClass()}
                                                align='center'>{this.state.value || '--'}</Typography>
                                            <Typography variant='h6' align='center'>Actualizado
                                                el {this.state.date ? this.state.date.format('ll') : '--'}</Typography>
                                        </div>
                                    </Grid>
                                    <Grid item xs={8}>
                                        <div className={classes.innerCard} style={{paddingBottom: '2rem'}}>
                                            <Typography variant='body1'>Indice de Impacto
                                                (mensual) {this.props.label}</Typography>
                                            <TimeseriesChart
                                                minY={0}
                                                units={{y: 'Indice de Impacto'}}
                                                data={this.state.timeseriesData}
                                                thresholds={this.state.timeseriesThresholds}/>
                                        </div>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}

EMACDataII.propTypes = {
    classes: PropTypes.object.isRequired,
    target: PropTypes.string.isRequired,
    template: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
};

export default withStyles(styles)(EMACDataII);

import React from 'react';
import Card from '@material-ui/core/Card';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import * as TimeseriesService from '@app/services/backend/timeseries';
import * as EtlService from '@app/services/backend/etl';
import Typography from '@material-ui/core/Typography';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import SwitchBox from '../SwitchBox'
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import Link from '@material-ui/core/Link';
import DatePicker from '@app/components/utils/DatePicker.js';

import Button from '@material-ui/core/Button';

const styles = theme => ({
    root: {
        margin: '30px',
        backgroundColor: '#262629',
    },
    container: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        backgroundColor: '#262629',
    },
    header: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: '100%',
        margin: '30px',
        marginBottom: '0px'
    },
    title: {
        width: '50%',
        height: '100%',
        display: 'inline-block',
        position: 'relative'
    },
    content: {
        width: '100%',
        position: 'relative'
    },
    content__timeseries: {
        backgroundColor: '#262629',
        margin: '30px',
    },
    forecastCalculationContainer: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gridColumnGap: theme.spacing(3),
        gridRowGap: theme.spacing(2),
        backgroundColor: '#262629',
        padding: theme.spacing(3),
        alignItems: 'center',
        border: '1px solid #6d6d6d',
        borderRadius: '3px',
    },
    forecastCalculationTitle: {
        gridColumn: 'span 3',
    },
    forecastInfoBox: {
        gridColumn: 'span 3',
        padding: theme.spacing(2),
        border: '1px solid #A2A2A2',
        borderRadius: '4px',
    },
    button: {
        '&:disabled': {
            backgroundColor: '#424242',
        }
    },
    buttonText: {
        visibility: 'hidden',
    },
    buttonLink: {
        color: '#24aff4',
        textDecoration: 'underline',
    },
    disabledLink: {
        color: 'rgba(255, 255, 255, 0.7)',
        cursor: 'initial',
    }
});


class RainInput extends SubscribedComponent {

    constructor(props){
        super(props);
        this.state = {
            isRaining: false,
            isCalculating: false,
            isRainForecastAvailable: false,
            isRainingStatusReady: true,
            isCorrectingData: false,
            startOfRainDate: undefined,
            startOfRainTime: undefined,
            rainStartCanonical: undefined,
            forecastRainAmount: undefined,
            forecastRainTime: undefined,
            overflowPotential: undefined,
            overflowTime: undefined,
            precalcOverflowPotential: undefined,
            precalcOverflowTime: undefined,
        }
    }

    requestPrecalculatedVariables = () => {
        const variableNames = ['precalculo', 'precalculo.tiempo-rebalse'];
        variableNames.forEach(variableName => {
            this.subscribe(
                TimeseriesService.list({
                    cache: 10,  // one minute
                    target: this.props.target,
                    template_name: `ef-mvp.m2.parameters.potencial-rebalse.${variableName}`,
                    max_events: 1,
                }),
                (data) => {
                    if(variableName === 'precalculo')
                        this.setState({overflowPotential: data?.[0]?.events?.[0]?.value});
                    if(variableName === 'precalculo.tiempo-rebalse')
                        this.setState({overflowTime: data?.[0]?.events?.[0]?.value});
                    this.setState({isCalculating: false});
                    this.props.reloadPlots();
                }
            );
        })
    }

    sendForecast = () => {
        if(!this.state.forecastRainAmount || !this.state.forecastRainTime)
            return;
        this.setState({
            isCalculating: true,
        })
        this.subscribe(
            EtlService.createImmediately({
                target: this.props.target,
                executor: "direct",
                context:{
                    events: [
                        {
                            "name": `${this.props.target}.none.ef-mvp.m2.parameters.variables.pronostico-tiempo-lluvia`,
                            "value": this.state.forecastRainTime,
                        },
                        {
                            "name": `${this.props.target}.none.ef-mvp.m2.parameters.variables.pronostico-cantidad-lluvia`,
                            "value": this.state.forecastRainAmount,
                        },
                    ]
                }
            }),
            (op) => {
                this.requestPrecalculatedVariables();
            },
            () => this.setState({
                isCalculating: false,
            })
        );
    }

    requestRainingStatus = () => {
        this.subscribe(
            TimeseriesService.list({
                cache: 10,  // one minute
                target: this.props.target,
                template_name: `ef-mvp.m2.parameters.variables.estado-lluvia`,
                max_events: 1,
            }),
            (data) => {
                this.setState({
                    isRaining: data?.[0]?.events?.[0]?.value === 1,
                    isRainingStatusReady: true,
                });
                if(true){
                    //if raining
                    this.subscribe(
                        TimeseriesService.list({
                            cache: 10,  // one minute
                            target: this.props.target,
                            template_name: `ef-mvp.m2.parameters.variables.tiempo-lloviendo`,
                            max_events: 1,
                        }),
                        (data) => {
                            this.setState({
                                startOfRainDate: data?.[0]?.events?.[0]?.meta?.startOfRain,
                                startOfRainTime: data?.[0]?.events?.[0]?.meta?.startOfRain,
                            });
                            this.props.reloadPlots();
                        }
                    );
                }

                // const canonicalName = data[0].canonical_name;
                // this.subscribe(
                //     TimeseriesService.aggregation({
                //         cache: 10,  // one minute
                //         target: this.props.target,
                //         timeseries: canonicalName,
                //     }),
                //     (data) => {
                //     }
                // );

                // if(data.count > 0){
                //     this.setState({isRaining: data.results[0].value === 1});
                // }
            }
        );
    }

    setRainingStatus = (value) => {
        this.setState({
            isRainingStatusReady: false,
            isRaining: value,
        })
        this.subscribe(
            EtlService.createImmediately({
                target: this.props.target,
                executor: "direct",
                context:{
                    events: [
                        {
                            "name": `${this.props.target}.none.ef-mvp.m1.triggers.important.lluvia`,
                            "value": value ? 1 : 0,
                        }
                    ]
                }
            }),
            (op) => {
                setTimeout(this.requestRainingStatus, 1000)
            },
            () => this.setState({
                isRainingStatusReady: true,
                isRaining: !value,
            })
        );
    }

    componentDidMount() {
        this.requestRainingStatus();
    }

    render() {
        const { classes } = this.props;

        return (
            <Paper className={classes.root}>
                <Card className={classes.container}>
                    <SwitchBox
                        header='Existe un pronostico de lluvia'
                        bodyContent='Si marcas esta opción, debes ingresar datos del pronostico de lluvia: milímetros y duración (horas)'
                        switchProps={{
                            disabled: false,
                            checked: this.state.isRainForecastAvailable,
                            onChange: (e) => this.setState({isRainForecastAvailable: e.target.checked}),
                        }}
                    />
                    <SwitchBox
                        header='Lluvia en desarrollo'
                        bodyContent='La cantidad de milímetros caídos es monitoreada por sensores. Junto a la fecha y hora de inicio de lluvia, aportan al cálculo del Potencial de rebalse.'
                        switchProps={{
                            checked: this.state.isRaining,
                            disabled: !this.state.isRainingStatusReady,
                            onChange: (e) => this.setRainingStatus(e.target.checked),
                        }}
                    />
                    <div className={classes.forecastCalculationContainer}>
                        <div className={classes.forecastCalculationTitle}>
                            <Typography variant='subtitle1' color="textSecondary">
                                PRONÓSTICO
                            </Typography>
                        </div>
                        <div>
                            <Typography variant='body2'>
                                Milímetros caídos
                            </Typography>
                            <FormControl>
                                <TextField
                                    id="standard-number"
                                    label="mm"
                                    type="number"
                                    disabled={!this.state.isRainForecastAvailable}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    value={this.state.forecastRainAmount || ''}
                                    onChange={(e) => this.setState({forecastRainAmount: parseInt(e.target.value, 10)})}
                                />
                            </FormControl>
                        </div>
                        <div>
                            <Typography variant='body2'>
                                Horas de lluvia
                            </Typography>
                            <FormControl>
                                <TextField
                                    id="standard-number"
                                    label="horas"
                                    type="number"
                                    disabled={!this.state.isRainForecastAvailable}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    value={this.state.forecastRainTime || ''}
                                    onChange={(e) => this.setState({forecastRainTime: parseInt(e.target.value, 10)})}
                                />
                            </FormControl>
                        </div>
                        <div>
                            <Button
                                className={classes.button}
                                onClick={this.sendForecast}
                                type="submit"
                                size="large"
                                variant="contained"
                                color="primary"
                                disabled={!this.state.isRainForecastAvailable}>
                                {this.state.isCalculating && <CircularProgress size={24} style={{position: 'absolute'}}/>}
                                <span className={this.state.isCalculating ? classes.buttonText : ''}>Calcular</span>
                            </Button>
                        </div>
                        <div className={classes.forecastCalculationTitle}>
                            <Typography variant='subtitle1' color="textSecondary">
                                RESULTADO EN BASE A PRONÓSTICO
                            </Typography>
                        </div>
                        <div>
                            <Typography variant='body2'>
                                Potencial de rebalse
                            </Typography>
                            <FormControl>
                                <TextField
                                    id="standard-number"
                                    label="&nbsp;"
                                    type="number"
                                    disabled={true}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    value={this.state.overflowPotential}
                                />
                            </FormControl>
                        </div>
                        <div>
                            <Typography variant='body2'>
                                Tiempo de rebalse
                            </Typography>
                            <FormControl>
                                <TextField
                                    id="standard-number"
                                    label="horas"
                                    type="number"
                                    disabled={true}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    value={this.state.overflowTime}
                                />
                            </FormControl>
                        </div>
                        <div>
                        </div>
                    </div>
                    <div className={classes.forecastCalculationContainer}>
                        <div className={classes.forecastCalculationTitle}>
                            <Typography variant='subtitle1' color="textSecondary">
                                INSTANTE DE INICIO DE LLUVIA
                            </Typography>
                            <Typography variant='body2' color="textSecondary">
                                Activación manual o automática
                            </Typography>
                        </div>
                        <div className={classes.forecastInfoBox}>
                            <Typography variant='body2' color="textSecondary">
                                Cuando el sensor detecte inicio de lluvia, se combinarán estos
                                datos reales con los de Pronóstico. En caso de que exista superación
                                de algún umbral, se creará un ticket para la gestión de incidentes.
                            </Typography>
                        </div>
                        <div className={classes.forecastCalculationTitle}>
                            <Typography variant='body2' color="textSecondary" display="inline">
                                ¿Fecha y hora no son correctos? {' '}
                            </Typography>
                            {/* <Typography variant='body2' color="textSecondary" display="inline">
                                Corrige datos y actualiza los gráficos
                            </Typography> */}
                            <Link className={[classes.buttonLink,
                                !this.state.isRaining || !this.state.isRainingStatusReady ?
                                    classes.disabledLink : ''].join(' ')}
                            component="button" variant="body2"
                            onClick={event => {
                                event.preventDefault();
                                if(!this.state.isRaining || !this.state.isRainingStatusReady)
                                    return;
                                this.setState({
                                    isCorrectingData: true,
                                });
                            }} >
                                Corrige datos y actualiza los gráficos
                            </Link>

                        </div>
                        <div>
                            <Typography variant='body2'>
                                Fecha
                            </Typography>
                            <FormControl>
                                <DatePicker
                                    label=""
                                    value={this.state.startOfRainDate || null}
                                    keyboard
                                    format='DD.MM.YYYY'
                                    disabled={!this.state.isCorrectingData || !this.state.isRainingStatusReady}
                                    onChange={(date) => this.setState({startOfRainDate: date})}
                                />
                            </FormControl>
                        </div>
                        <div>
                            <Typography variant='body2'>
                                Hora
                            </Typography>
                            <FormControl>
                                <DatePicker
                                    label=""
                                    value={this.state.startOfRainTime || null}
                                    format='HH:mm:ss'
                                    timeOnly
                                    disabled={!this.state.isCorrectingData || !this.state.isRainingStatusReady}
                                    onChange={(date) => this.setState({startOfRainTime: date})}
                                />
                            </FormControl>
                        </div>
                        <div>
                            <Button
                                className={classes.button}
                                type="submit"
                                size="large"
                                variant="contained"
                                color="primary"
                                disabled={!this.state.isCorrectingData || !this.state.isRainingStatusReady}>
                                Actualizar
                            </Button>
                        </div>
                    </div>
                </Card>
            </Paper>
        );
    }
}

const MapStateToProps = state => {
    return {
        serieCanonicalName: state.miners.timeSeries.serie_canonical_name
    };
};

RainInput.propTypes = {
    classes: PropTypes.object.isRequired
};

export default connect(MapStateToProps, null)(withStyles(styles)(RainInput));

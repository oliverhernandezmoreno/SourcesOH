import React from 'react';
import PropTypes from 'prop-types';
import {Grid, Typography, Tooltip, withStyles} from '@material-ui/core';
import {Info} from '@material-ui/icons';
import {connect} from 'react-redux';
import {radioActions} from '@miners/actions/dashboard.actionCreators';
import {bindActionCreators} from 'redux';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import InspectionsSchedule from '@miners/containers/EF/dashboard/InspectionsSchedule';
import ParametersSchedule from '@miners/containers/EF/dashboard/ParametersSchedule';
import CardSensingPointContainer from '@miners/containers/EF/dashboard/CardSensingPointContainer';
import moment from 'moment';
import ParamStatusContainer from './dashboard/ParamStatusContainer';
import IconTextGrid from '@app/components/utils/IconTextGrid';


const revanchaOperacionalMinima = 'ef-mvp.m2.parameters.revancha-operacional.minimo';
const revanchaOperacionalMinimaPromedio = 'ef-mvp.m2.parameters.revancha-operacional.dashboard';

const styles = (theme) => ({
    root: {
        width: '100%',
        padding: theme.spacing(3)
    },
    leadingText: {
        fontSize: 15,
        color: '#cacaca',
        textAlign: 'center',
        paddingBottom: '10px'
    },
    sensingPoint: {
        paddingTop: 15,
        paddingBottom: 15
    },
    infoTooltip: {
        backgroundColor: '#ffffff',
        color: '#000000',
        fontSize: 12,
    }
});


class Dashboard extends SubscribedComponent {

    state = {
        // the 'tick' of the dashboard refresh cycle
        currentTime: new Date().toJSON()
    };

    componentDidMount() {
        this.interval = setInterval(() =>
            this.setState({currentTime: new Date().toJSON()}), 60 * 1000);
    }

    onRadioChange(value) {
        this.props.actions.saveRevanchaOperacionalRadioValue(value);
    }

    getRevanchaOperacionalTitle() {
        switch(this.props.revancha_operacional_radio_value) {
            case revanchaOperacionalMinima:
                return 'Revancha operacional mínima';
            case revanchaOperacionalMinimaPromedio:
                return 'Revancha operacional mínima promedio';
            default: return 'Revancha operacional';
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        clearInterval(this.interval);
    }

    render() {
        const {classes, target, revancha_operacional_radio_value} = this.props;
        const updateTime = moment(this.state.currentTime).format('MMMM D YYYY, h:mm:ss a');
        const statusProps = {target, currentTime: this.state.currentTime};
        return (
            <div>
                <Grid container spacing={2} className={classes.root}>
                    <Grid item xs={3}>
                        <Typography className={classes.leadingText}>Estatus de actualización de ingreso de datos</Typography>
                        <InspectionsSchedule target={this.props.target} currentTime={this.state.currentTime} />
                        <ParametersSchedule target={this.props.target} currentTime={this.state.currentTime} />
                    </Grid>

                    <Grid item xs={9}>
                        <Grid container justify='space-between' alignItems='center'>
                            <Grid item>
                                <Typography className={classes.leadingText}>
                                    Principales parámetros de monitoreo de Estabilidad Física
                                </Typography>
                            </Grid>
                            <Grid item style={{paddingBottom: 10, color:"#CACACA"}}>
                                <IconTextGrid iconRight
                                    text={
                                        <Typography style={{fontSize:11}}>
                                            Última actualización: {updateTime}
                                        </Typography>
                                    }
                                    icon={
                                        <Tooltip
                                            classes={{tooltip: classes.infoTooltip}}
                                            title={'Los datos se actualizan cada 1 minuto.'}
                                        >
                                            <Info style={{fontSize:15}}/>
                                        </Tooltip>
                                    }
                                />
                            </Grid>
                        </Grid>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                                <ParamStatusContainer
                                    template={revancha_operacional_radio_value}
                                    routeTemplate='revancha-operacional'
                                    title={this.getRevanchaOperacionalTitle()}
                                    radioOptions={[
                                        {
                                            label: 'REVANCHA OPERACIONAL MÍNIMA',
                                            value: revanchaOperacionalMinima, description: ''
                                        },
                                        {
                                            label: 'REVANCHA OPERACIONAL MÍNIMA PROMEDIO',
                                            value: revanchaOperacionalMinimaPromedio, description: ''
                                        }
                                    ]}
                                    onRadioChange={(v) => this.onRadioChange(v)}
                                    {...statusProps}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <ParamStatusContainer
                                    template='ef-mvp.m2.parameters.revancha-hidraulica'
                                    routeTemplate='revancha-hidraulica'
                                    title='Revancha hidráulica'
                                    {...statusProps}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <ParamStatusContainer
                                    template='ef-mvp.m2.parameters.distancia-laguna.minimo'
                                    routeTemplate='distancia-minima'
                                    title='Distancia mínima Laguna-Muro'
                                    {...statusProps}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <ParamStatusContainer
                                    template='ef-mvp.m2.parameters.tonelaje'
                                    routeTemplate='tonelaje'
                                    title='Tonelaje de relaves acumulados en depósito'
                                    {...statusProps}
                                />
                            </Grid>
                        </Grid>

                        <Grid container>
                            <Grid item xs={12} className={classes.sensingPoint}>
                                <CardSensingPointContainer {...statusProps}/>
                            </Grid>
                        </Grid>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                                <ParamStatusContainer
                                    template='ef-mvp.m2.parameters.pendiente-muro.global-aguas-abajo.maximo'
                                    routeTemplate='pendiente-talud'
                                    title='Pendiente máxima de talud, aguas abajo'
                                    {...statusProps}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <ParamStatusContainer
                                    template='ef-mvp.m2.parameters.pendiente-muro.global-aguas-arriba.maximo'
                                    routeTemplate='pendiente-talud'
                                    title='Pendiente máxima de talud, aguas arriba'
                                    {...statusProps}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <ParamStatusContainer
                                    template='ef-mvp.m2.parameters.altura-muro.minimo'
                                    routeTemplate='altura-muro'
                                    title='Altura mínima coronamiento'
                                    {...statusProps}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <ParamStatusContainer
                                    template='ef-mvp.m2.parameters.altura-muro.maximo'
                                    routeTemplate='altura-muro'
                                    title='Altura máxima de coronamiento'
                                    {...statusProps}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        revancha_operacional_radio_value: state.miners.dashboard.revancha_operacional_radio_value,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(radioActions, dispatch)
    };
}

Dashboard.propTypes = {
    classes: PropTypes.object.isRequired,
    target: PropTypes.string.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Dashboard));

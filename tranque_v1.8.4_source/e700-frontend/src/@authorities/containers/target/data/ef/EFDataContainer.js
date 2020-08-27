import React from 'react';
import PropTypes from 'prop-types';
import * as config from '@app/config';
import * as DumpRequestService from '@app/services/backend/dumpRequest';
import {Grid, Typography, withStyles} from '@material-ui/core';
import {Redirect} from 'react-router-dom';
import {Route, Switch} from 'react-router';
import {reverse, route} from '@app/urls';
import * as moment from 'moment/moment';
import SubMenu from '@authorities/containers/layout/SubMenu';
import CardGraphicFilter from '@authorities/containers/target/data/ef/CardGraphicFilter';
import InspectionOperation from '@authorities/components/target/data/InspectionOperation';
import InspectionVoucher from '@authorities/components/target/data/InspectionVoucher';
/* import RequestsRecord from '@authorities/components/target/RequestsRecord';
import RequestTargetDataButton from '@authorities/components/target/RequestTargetDataButton'; */
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import {Subscription} from 'rxjs';
import {getDateSortNumber} from '@app/services/sorting';
import {getTranslatedState} from '@app/services/backend/dumpRequest';


const styles = theme => ({
    container: {
        marginTop: 10
    },
    requestContainer: {
        marginBottom: 5,
        border: '1px solid',
        borderRadius: 3,
        borderColor: theme.palette.primary.main,
    },
    requestButton: {
        padding: 10,
        width: 200
    },
    subMenu: {
        marginBottom: 20
    },
    lastRequest: {
        paddingRight: 10,
        paddingLeft: 10
    },
    dialog: {
        paddingBottom: 6,
        paddingRight: 10,
        paddingLeft: 10
    }
});

/**
 * A component for rendering a target detailed data.
 *
 * @version 1.0.0
 * @author [Natalia Vidal](https://gitlab.com/nattoV)
 */
export const EFDataContainer = withStyles(styles)(class extends SubscribedComponent  {

    state= {
        startDate: moment().subtract(1, 'year').startOf('day'),
        endDate: moment().endOf('day'),
        dumpRequests: []
    }

    profile =  "ef-mvp";
    traceSub = new Subscription();

    componentDidMount() {
        this.subscribe(
            this.listDumpRequests(),
            (requests) => this.setState({
                dumpRequests: requests.results.slice()
                    .sort((a, b) => getDateSortNumber(a.created_at, b.created_at))
            })
        );
    }

    listDumpRequests() {
        return DumpRequestService.listDumpRequests({
            cache: config.DEFAULT_CACHE_TIME,
            target_canonical_name: this.props.target,
            profile: this.profile
        });
    }

    handleRequest = (selectedStartDate, selectedEndDate) => {
        this.subscribe(
            DumpRequestService.createDumpRequest({
                target_canonical_name: this.props.target,
                profile: this.profile,
                date_from:  moment(selectedStartDate).toISOString(),
                date_to: moment(selectedEndDate).toISOString()
            }),
            (res) => {
                const requestStructure = {...res, state: 'waiting_response', created_at: moment().toISOString()};
                this.setState((state) => ({
                    dumpRequests: [requestStructure, ...state.dumpRequests],
                    startDate: selectedStartDate,
                    endDate: selectedEndDate
                }));
                this.traceSub.add(this.subscribeInterval(
                    config.DEFAULT_REFRESH_TIME,
                    this.listDumpRequests(),
                    (requests) => {
                        if (requests.results.length >= this.state.dumpRequests.length) {
                            this.setState({
                                dumpRequests: requests.results.slice()
                                    .sort((a, b) => getDateSortNumber(a.created_at, b.created_at))
                            });
                        }
                        if (!requests.results.some(req => req.state === 'waiting_response')) {
                            this.traceSub.unsubscribe();
                            this.traceSub = new Subscription();
                        }
                    }
                ));
            }
        );
    }

    getTimeseriesNavPath(target, template) {
        return reverse('authorities.target.data.ef.template', {target, template});
    }

    timeSeriesNav(target) {
        return [
            {
                title: 'Topografía',
                children: [
                    {
                        title: 'Revancha Operacional',
                        path: this.getTimeseriesNavPath(target, 'revancha-operacional')
                    },
                    {
                        title: 'Revancha hidráulica',
                        path: this.getTimeseriesNavPath(target, 'revancha-hidraulica')
                    },
                    {
                        title: 'Distancia mínima laguna-muro',
                        path: this.getTimeseriesNavPath(target, 'distancia-minima')
                    },
                    {
                        title: 'Pendiente de talud',
                        path: this.getTimeseriesNavPath(target, 'pendiente-talud')
                    },
                    {
                        title: 'Pendiente de playa',
                        path: this.getTimeseriesNavPath(target, 'pendiente-playa')
                    },
                    {
                        title: 'Altura de coronamiento',
                        path: this.getTimeseriesNavPath(target, 'altura-muro')
                    },
                    {
                        title: 'Ancho de coronamiento',
                        path: this.getTimeseriesNavPath(target, 'ancho-coronamiento')
                    },
                    {
                        title: 'Perfiles topográficos',
                        path: this.getTimeseriesNavPath(target, 'perfiles-topograficos')
                    },
                ]
            },
            {
                title: 'Piezometría',
                children: [
                    {
                        title: 'Cotas piezométricas en el tiempo',
                        path: this.getTimeseriesNavPath(target, 'cotas-piezometricas-en-el-tiempo')
                    },
                    {
                        title: 'Perfil topográfico y cotas piezométricas',
                        path: this.getTimeseriesNavPath(target, 'perfil-topografico-y-cotas-piezometricas')
                    },
                    {
                        title: 'Nivel freático de cubeta',
                        path: this.getTimeseriesNavPath(target, 'nivel-freatico-de-cubeta')
                    },
                    {
                        title: 'Detalle de piezómetro',
                        path: this.getTimeseriesNavPath(target, 'detalle-de-piezometro')
                    }
                ]
            },
            {
                title: "Granulometría y densidad",
                children: [
                    {
                        title: 'Porcentaje de finos',
                        path: this.getTimeseriesNavPath(target, 'porcentaje-de-finos')
                    },
                    {
                        title: 'Curva granulométrica',
                        path: this.getTimeseriesNavPath(target, 'curva-granulometrica')
                    },
                    {
                        title: 'Densidad del muro',
                        path: this.getTimeseriesNavPath(target, 'densidad-del-muro')
                    },
                ]
            },
            {
                title: 'Sistemas de drenaje',
                children: [
                    {
                        title: 'Caudal',
                        path: this.getTimeseriesNavPath(target, 'caudal')
                    },
                    {
                        title: 'Turbiedad',
                        path: this.getTimeseriesNavPath(target, 'turbiedad')
                    },
                    {
                        title: 'Detalle de caudalímetro',
                        path: this.getTimeseriesNavPath(target, 'detalle-de-caudalimetro')
                    },
                    {
                        title: 'Detalle de turbidímetro',
                        path: this.getTimeseriesNavPath(target, 'detalle-de-turbidimetro')
                    }
                ]
            },
            {
                title: 'Intensidad de lluvia',
                path: this.getTimeseriesNavPath(target, 'intensidad-de-lluvia')
            },
            {
                title: 'Tonelaje',
                path: this.getTimeseriesNavPath(target, 'tonelaje')
            },
            {
                title: 'Potencial de rebalse',
                path: this.getTimeseriesNavPath(target, 'potencial-de-rebalse')
            },
            {
                title: "Integridad externa",
                children: [
                    {
                        title: 'Grietas en el muro',
                        path: this.getTimeseriesNavPath(target, 'grietas-en-el-muro')
                    },
                    {
                        title: 'Humedad o filtraciones en talud',
                        path: this.getTimeseriesNavPath(target, 'humedad-o-filtraciones-en-talud')
                    },
                    {
                        title: 'Subsidencia o socavación cerca del muro',
                        path: this.getTimeseriesNavPath(target, 'subsidencia-o-socavacion-cerca-del-muro')
                    },
                    {
                        title: 'Integridad de los estribos',
                        path: this.getTimeseriesNavPath(target, 'integridad-de-los-estribos')
                    }
                ]
            }, 
            {
                title: 'Vertedero de emergencia',
                path: this.getTimeseriesNavPath(target, 'vertedero')
            },
            {
                title: 'Acelerógrafos',
                path: this.getTimeseriesNavPath(target, 'acelerografos')
            },
            {
                title: "Documentos",
                children: [
                    {
                        title: "Módulos de deformación y resistencia",
                        path: this.getTimeseriesNavPath(target, 'deformacion-y-resistencia')
                    },
                    {
                        title: "Resistencia del material de relaves",
                        path: this.getTimeseriesNavPath(target, 'resistencia-de-relaves')
                    },
                    {
                        title: "Diseño del sistema de drenaje",
                        path: this.getTimeseriesNavPath(target, 'diseño-de-drenaje')
                    },
                    {
                        title: "Caracterización geotécnica del suelo",
                        path: this.getTimeseriesNavPath(target, 'caracterizacion-geotecnica')
                    },
                    {
                        title: "Estudio de revancha mínima",
                        path: this.getTimeseriesNavPath(target, 'estudio-de-revancha')
                    }
                ]
            },
        ];
    }

    InspectAndEvaluation(target) {
        return [
            {   title: 'Registros de inspección',
                path: reverse('authorities.target.data.ef.inspections.registry', {target})
            }
        ];
    }


    getMenuItems(target) {
        return [
            {  subtitle: 'Inspecciones y Evaluaciones' },
            ...this.InspectAndEvaluation(target),
            {  subtitle: 'Parámetros de estabilidad física' },
            ...this.timeSeriesNav(target)
        ];
    }

    renderLastRequest() {
        const lastRequest = this.state.dumpRequests[0];
        return lastRequest &&
            <Typography variant='body2' className={this.props.classes.lastRequest}>
                Ultima solicitud hecha el día
                <b>{' ' + moment(lastRequest.created_at).format(config.DATE_FORMAT) + ' '}</b>
                en estado <b>{' ' + getTranslatedState(lastRequest.state)}</b>
            </Typography>
    }


    render() {
        const {target, classes} = this.props;
        const {/* startDate, endDate, */ dumpRequests} = this.state;
        return <Grid container spacing={1} className={classes.container}>
            {/* <Grid item container justify='space-between' alignItems='center' className={classes.requestContainer}>

                <Grid item className={classes.requestButton}>
                    <RequestTargetDataButton handleRequest={this.handleRequest}
                        initialStartDate={startDate}
                        initialEndDate={endDate}/>
                </Grid>

                <Grid item>{this.renderLastRequest()}</Grid>

                <Grid item className={classes.dialog}>
                    <RequestsRecord data={dumpRequests}/>
                </Grid>
            </Grid> */}

            <Grid item xs={12} sm={3} className={classes.subMenu}>
                <SubMenu title="Datos" items={this.getMenuItems(target)}/>
            </Grid>
            <Grid item xs={12} sm={9}>
                <Switch>
                    <Route path={route('authorities.target.data.ef.inspections.registry')}
                        render={(props) => <InspectionOperation {...props} />}/>

                    <Route path={route('authorities.target.data.ef.inspections.voucher')}
                        render={(props) => <InspectionVoucher target={props.match.params.target}
                            operation={props.match.params.operation} />} />

                    <Route path={route('authorities.target.data.ef.template')}
                        render={(props) => <CardGraphicFilter {...props}
                            dataDumps={dumpRequests} handleRequest={this.handleRequest} />}/>

                    <Route path={route('authorities.target.data.ef')}
                        render={(props) => <Redirect to={reverse('authorities.target.data.ef.template',
                            {target: target, template: 'revancha-operacional'})}/>}
                    />
                </Switch>
            </Grid>
        </Grid>
    }
})

EFDataContainer.propTypes = {
    target: PropTypes.string
};

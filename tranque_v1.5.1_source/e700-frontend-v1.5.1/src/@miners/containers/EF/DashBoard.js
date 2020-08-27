import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import {withStyles} from '@material-ui/core/styles';

import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import FrequencyCard from '@miners/containers/EF/FrequencyCard';
import FrequencyCardData from '@miners/containers/EF/FrequencyCardData';
import {regularFrequencyTable, inspectionsTable} from '@miners/components/EF/frequencyTable';
import CardSensingPoint from '@miners/components/EF/CardSensingPoint';
import CardIndexNum from '@miners/components/EF/CardIndexNum';

import * as TimeseriesService from '@app/services/backend/timeseries';

import Typography from '@material-ui/core/Typography';
import IconStatus from '@miners/components/EF/IconStatus';
import InfoIcon from '@material-ui/icons/Info';

import moment from 'moment';

const styles = (theme) => ({
    root: {
        width: '100%',
        padding: theme.spacing(3)
    },

    paper: {
        textAlign: 'center',
        color: theme.palette.text.secondary,
        whiteSpace: 'nowrap',
        marginBottom: theme.spacing(1)
    },

    section: {
        height: '100%',
        paddingTop: 5,
        backgroundColor: '#fff',
        textAlign: 'center',
        spacing: 10
    },

    index: {
        width: '250px',
        height: '250px',
        backgroundColor: '#000000',
        color: '#ffffff'
    },

    index1: {
        color: '#ffffff',
        margin: '50px',
        fontSize: '70px',
        fontWeight: 'bold'
    },

    status: {
        margin:"10px"
    },
});

const selectEvent = (arr, fn, type) => {
    if (type === 'MIN') {
        return arr.slice(1)
            .reduce((min, e) => fn(min) > fn(e) ? e : min, arr[0]);
    } else if (type === 'MAX') {
        return arr.slice(1)
            .reduce((max, e) => fn(max) < fn(e) ? e : max, arr[0]);
    }
};

class Dashboard extends SubscribedComponent {

    state = {
        user: '',

        indice: {
            title: 'Estado general del depósito',
            data: []
        },
        parameter01: {
            template: 'ef-mvp.m2.parameters.revancha-operacional',//TODO config
            data: undefined,
            name: 'Revancha operacional mínima',
            date: undefined,
            source: undefined,
            unit: undefined,
            selectEvent: 'MIN',
            serie: undefined,
            threshold: undefined
        },

        parameter02: {
            template: 'ef-mvp.m2.parameters.revancha-hidraulica',//TODO config
            data: undefined,
            name: 'Revancha hidráulica',
            date: undefined,
            source: undefined,
            unit: undefined,
            threshold: undefined
        },

        parameter03: {
            template: 'ef-mvp.m2.parameters.distancia-laguna',//TODO config
            data: undefined,
            name: 'Distancia mínima Laguna-Muro',
            date: undefined,
            source: undefined,
            selectEvent: 'MIN',
            unit: undefined,
            threshold: undefined
        },

        parameter04: {
            template: 'ef-mvp.m2.parameters.volumen-relave',//TODO config
            data: undefined,
            name: 'Tonelaje de relaves acumulados en depósito',
            date: undefined,
            source: undefined,
            unit: undefined,
            threshold: undefined
        },

        sensorList: {
            title: 'Piezómetros',//TODO config
            data: [],
            template: 'ef-mvp.m2.parameters.presion-poros'//TODO config
        },

        parameter05: {
            template: 'ef-mvp.m2.parameters.pendiente-global-aguas-abajo',//TODO config
            data: undefined,
            name: 'Pendiente máxima de talud, aguas abajo',//TODO config
            date: undefined,
            source: undefined,
            unit: undefined,
            selectEvent: 'MAX',
            serie: undefined,
            threshold: undefined
        },

        parameter06: {
            template: 'ef-mvp.m2.parameters.pendiente-global-aguas-arriba',//TODO config
            data: undefined,
            name: 'Pendiente máxima de talud, aguas arriba',//TODO config
            date: undefined,
            source: undefined,
            unit: undefined,
            selectEvent: 'MAX',
            serie: undefined,
            threshold: undefined
        },

        parameter07: {
            template: 'ef-mvp.m2.parameters.altura-muro',//TODO config
            data: undefined,
            name: 'Altura mínima coronamiento',//TODO config
            date: undefined,
            source: undefined,
            unit: undefined,
            selectEvent: 'MIN',
            serie: undefined,
            threshold: undefined
        },

        parameter08: {
            template: 'ef-mvp.m2.parameters.altura-muro',//TODO config
            data: undefined,
            name: 'Altura máxima de coronamiento',//TODO config
            date: undefined,
            source: undefined,
            unit: undefined,
            selectEvent: 'MAX',
            serie: undefined,
            threshold: undefined
        },
    };


    componentDidMount() {
        const timeFormat = 'HH:mm DD.MM.YY'; //TODO config

        // Get Last event Revancha operacional
        this.subscribe(
            TimeseriesService.list({
                cache: 60 * 1000,  // one minute
                target: this.props.target,
                template_name: this.state.parameter01.template,
                max_events: 1
            }),
            (tss) => {
                const withEvents = tss.filter((ts) => ts.events.length > 0);
                if (withEvents.length === 0) {
                    return;

                }
                const Result = selectEvent(withEvents, (result) => result.events[0].value,
                    this.state.parameter01.selectEvent);

                this.setState({
                    parameter01: {
                        ...this.state.parameter01,
                        source: Result.data_source.group_names[1],
                        date: Result.events[0].date.format(timeFormat),
                        data: Result.events[0].roundedValue.toString(),
                        unit: `[${Result.unit.abbreviation}]`,
                        serie: Result.canonical_name,
                    }
                });
                if (Result.thresholds[0] !== undefined){
                    this.setState({
                        parameter01:{
                            ...this.state.parameter01,
                            threshold: Result.thresholds[0].upper
                        }
                    })}
            }
        );

        // Get last event Revancha hidráulica

        this.subscribe(
            TimeseriesService.list({
                cache: 60 * 1000,  // one minute
                target: this.props.target,
                template_name: this.state.parameter02.template,
                max_events: 1
            }),

            (tss) => {
                const withEvents = tss.filter((ts) => ts.events.length > 0);
                if (withEvents.length === 0) {
                    return;
                }
                this.setState({
                    parameter02: {
                        ...this.state.parameter02,
                        source: withEvents[0].data_source,
                        date: withEvents[0].events[0].date.format(timeFormat),
                        data: withEvents[0].events[0].roundedValue.toString(),
                        unit: `[${withEvents[0].unit.abbreviation}]`,
                        serie: withEvents[0].events[0].name
                    }
                });
                if (withEvents[0].thresholds[0] !== undefined){
                    this.setState({threshold: withEvents[0].thresholds[0].upper})
                }
            }
        );

        // Get last event Distancia Laguna-muro
        this.subscribe(
            TimeseriesService.list({
                cache: 60 * 1000,  // one minute
                target: this.props.target,
                template_name: this.state.parameter03.template,
                max_events: 1
            }),
            (tss) => {
                const withEvents = tss.filter((ts) => ts.events.length > 0);
                if (withEvents.length === 0) {
                    return;
                }

                const Result = selectEvent(withEvents, (result) => result.events[0].value,
                    this.state.parameter03.selectEvent);

                this.setState({
                    parameter03: {
                        ...this.state.parameter03,
                        source: Result.data_source_group.name,
                        date: Result.events[0].date.format(timeFormat),
                        data: Result.events[0].roundedValue.toString(),
                        unit: `[${Result.unit.abbreviation}]`,
                        serie: Result.canonical_name,

                    }
                });
                if (Result.thresholds[0] !== undefined){
                    this.setState({
                        parameter03:{
                            ...this.state.parameter03,
                            threshold: Result.thresholds[0].upper
                        }
                    })}
            }
        );

        // Get last event Volumen-acumulado
        this.subscribe(
            TimeseriesService.list({
                cache: 60 * 1000,  // one minute
                target: this.props.target,
                template_name: this.state.parameter04.template,
                max_events: 1
            }),
            (tss) => {
                const withEvents = tss.filter((ts) => ts.events.length > 0);
                if (withEvents.length === 0) {
                    return;
                }

                this.setState({
                    parameter04: {
                        ...this.state.parameter04,
                        date: withEvents[0].events[0].date.format(timeFormat),
                        data: withEvents[0].events[0].roundedValue.toString(),
                        unit: `[${withEvents[0].unit.abbreviation}]`,
                        serie: withEvents[0].events[0].name
                    }
                });
                if (withEvents.thresholds !== undefined){
                    this.setState({
                        parameter04:{
                            ...this.state.parameter04,
                            threshold: withEvents.thresholds[0].upper
                        }
                    })}
            }
        );

        // Get last event piezometers
        this.subscribe(
            TimeseriesService.list({
                cache: 60 * 1000,  // one minute
                target: this.props.target,
                template_name: this.state.sensorList.template
            }),
            (tss) => {
                this.subscribe(
                    TimeseriesService.list({
                        cache: 60 * 1000,  // one minute
                        target: this.props.target,
                        canonical_name__in: tss.map(ts => ts.canonical_name).join(","),
                        max_events: 1,
                        page_size: 500
                    }),
                    (objs) => { objs.forEach( obj => {
                        const thresholds = obj.thresholds
                            .filter((t) => t.upper !== null)
                            .map((t) => parseFloat(t.upper));
                        const data = {
                            name: obj.data_source.name.replace('Piezómetro', 'PZ'),
                            values: (obj.events[0] || {}).value,
                            threshold: thresholds[0] || null,
                            units: obj.unit_abbreviation
                        };
                        this.setState({
                            sensorList: {
                                ...this.state.sensorList,
                                data: [...this.state.sensorList.data, data]
                            }
                        });
                    });
                    }
                );
            }
        );

        // Get Last event Pendiente máxima aguas abajo
        this.subscribe(
            TimeseriesService.list({
                cache: 60 * 1000,  // one minute
                target: this.props.target,
                template_name: this.state.parameter05.template,
                max_events: 1
            }),

            (tss) => {
                const withEvents = tss.filter((ts) => ts.events.length > 0);
                if (withEvents.length === 0) {
                    return;
                }

                const Result = selectEvent(withEvents, (result) => result.events[0].value,
                    this.state.parameter05.selectEvent);

                this.setState({
                    parameter05: {
                        ...this.state.parameter05,
                        source: Result.data_source.group_names[1],
                        date: Result.events[0].date.format(timeFormat),
                        data: Result.events[0].roundedValue.toString(),
                        unit: `[${Result.unit.abbreviation}]`,
                        serie: Result.canonical_name
                    }
                });

                if (Result.thresholds[0] !== undefined){
                    this.setState({
                        parameter05:{
                            ...this.state.parameter05,
                            threshold: Result.thresholds[0].upper
                        }
                    })}
            }
        );

        // Get Last event Pendiente máxima aguas arriba
        this.subscribe(
            TimeseriesService.list({
                cache: 60 * 1000,  // one minute
                target: this.props.target,
                template_name: this.state.parameter06.template,
                max_events: 1
            }),

            (tss) => {
                const withEvents = tss.filter((ts) => ts.events.length > 0);
                if (withEvents.length === 0) {
                    return;
                }

                const Result = selectEvent(withEvents, (result) => result.events[0].value,
                    this.state.parameter06.selectEvent);

                this.setState({
                    parameter06: {
                        ...this.state.parameter06,
                        source: Result.data_source.group_names[1],
                        date: Result.events[0].date.format(timeFormat),
                        data: Result.events[0].roundedValue.toString(),
                        unit: `[${Result.unit.abbreviation}]`,
                        serie: Result.canonical_name
                    }
                });
                if (Result.thresholds[0] !== undefined){
                    this.setState({
                        parameter06:{
                            ...this.state.parameter06,
                            threshold: Result.thresholds[0].upper
                        }
                    })}
            }
        );

        // Get Last event altura mínima de coronamiento
        this.subscribe(
            TimeseriesService.list({
                cache: 60 * 1000,  // one minute
                target: this.props.target,
                template_name: this.state.parameter07.template,
                max_events: 1
            }),

            (tss) => {
                const withEvents = tss.filter((ts) => ts.events.length > 0);
                if (withEvents.length === 0) {
                    return;
                }

                const Result = selectEvent(withEvents, (result) => result.events[0].value,
                    this.state.parameter07.selectEvent);

                this.setState({
                    parameter07: {
                        ...this.state.parameter07,
                        source: Result.data_source.group_names[1],
                        date: Result.events[0].date.format(timeFormat),
                        data: Result.events[0].roundedValue.toString(),
                        unit: `[${Result.unit.abbreviation}]`,
                        serie: Result.canonical_name
                    }
                });
                if (Result.thresholds[0] !== undefined){
                    this.setState({
                        parameter07:{
                            ...this.state.parameter07,
                            threshold: Result.thresholds[0].upper
                        }
                    })}
            }
        );

        // Get Last event altura máxima de coronamiento
        this.subscribe(
            TimeseriesService.list({
                cache: 60 * 1000,  // one minute
                target: this.props.target,
                template_name: this.state.parameter08.template,
                max_events: 1
            }),

            (tss) => {
                const withEvents = tss.filter((ts) => ts.events.length > 0);
                if (withEvents.length === 0) {
                    return;
                }

                const Result = selectEvent(withEvents, (result) => result.events[0].value,
                    this.state.parameter08.selectEvent);

                this.setState({
                    parameter08: {
                        ...this.state.parameter08,
                        source: Result.data_source.group_names[1],
                        date: Result.events[0].date.format(timeFormat),
                        data: Result.events[0].roundedValue.toString(),
                        unit: `[${Result.unit.abbreviation}]`,
                        serie: Result.canonical_name
                    }
                });
                if (Result.thresholds[0] !== undefined){
                    this.setState({
                        parameter08:{
                            ...this.state.parameter08,
                            threshold: Result.thresholds[0].upper
                        }
                    })}
            }
        );
    }

    render() {
        const {classes} = this.props;
        const updateTime = moment().format('MMMM D YYYY, h:mm:ss a');
        return (
            <div>
                <Grid container spacing={2} className={classes.root}>
                    <Grid item xs={3}>
                        <FrequencyCardData target={this.props.target}
                            title="Datos de ingreso manual"
                            dataGroups={[
                                regularFrequencyTable
                            ]}/>
                        <FrequencyCard target={this.props.target}
                            title="Inspecciones"
                            dataGroups={[inspectionsTable]}/>
                    </Grid>

                    <Grid item xs={9}>
                        <div style={{display:"flex",marginLeft:"850px"}}>
                            <Typography style={{fontSize:15,color:"#CACACA",display:"inline"}}>
                              Última actualización:{updateTime}
                            </Typography>
                            <InfoIcon style={{fontSize:15,marginLeft:5,color:"#CACACA"}}/>
                        </div>
                        <div style={{display:"flex", alignItems:"center"}}>
                            <Typography>Índice de estabilidad Física</Typography>
                            <div className={classes.status}>
                                <IconStatus
                                    value={undefined}
                                    threshold={undefined}/>
                            </div>
                            <Typography style={{marginLeft:'20px',color: '#fdff3f'}}>
                              En fase de calibración
                            </Typography>
                        </div>
                        <Grid container spacing={2}>
                            <Grid item xs={12} style={{display: 'flex'}} /*key={ts.id}*/>
                                <CardIndexNum
                                    target={this.props.target}
                                    data={this.state.parameter01.data}
                                    name={this.state.parameter01.name}
                                    date={this.state.parameter01.date}
                                    source={this.state.parameter01.source}
                                    units={this.state.parameter01.unit}
                                    template={this.state.parameter01.template}
                                    serie={this.state.parameter01.serie}
                                    threshold={this.state.parameter01.threshold}/>

                                <CardIndexNum
                                    target={this.props.target}
                                    data={this.state.parameter02.data}
                                    name={this.state.parameter02.name}
                                    date={this.state.parameter02.date}
                                    source={this.state.parameter02.source}
                                    units={this.state.parameter02.unit}
                                    template={this.state.parameter02.template}
                                    serie={this.state.parameter02.serie}
                                    threshold={this.state.parameter02.threshold}/>

                                <CardIndexNum
                                    target={this.props.target}
                                    data={this.state.parameter03.data}
                                    name={this.state.parameter03.name}
                                    date={this.state.parameter03.date}
                                    source={this.state.parameter03.source}
                                    units={this.state.parameter03.unit}
                                    template={this.state.parameter03.template}
                                    threshold={this.state.parameter03.threshold}/>

                                <CardIndexNum
                                    target={this.props.target}
                                    data={this.state.parameter04.data}
                                    name={this.state.parameter04.name}
                                    date={this.state.parameter04.date}
                                    source={this.state.parameter04.source}
                                    units={this.state.parameter04.unit}
                                    template={this.state.parameter04.template}
                                    serie={this.state.parameter04.serie}
                                    threshold={this.state.parameter04.threshold}/>
                            </Grid>
                        </Grid>

                        <Grid container>
                            <CardSensingPoint
                                target={this.props.target}
                                title={this.state.sensorList.title}
                                values={this.state.sensorList.data}
                                template={this.state.sensorList.template}/>

                        </Grid>

                        <Grid container spacing={2}>

                            <Grid item xs={12} style={{display: 'flex'}}>
                                <CardIndexNum
                                    target={this.props.target}
                                    data={this.state.parameter05.data}
                                    name={this.state.parameter05.name}
                                    date={this.state.parameter05.date}
                                    source={this.state.parameter05.source}
                                    units={this.state.parameter05.unit}
                                    template={this.state.parameter05.template}
                                    serie={this.state.parameter05.serie}
                                    threshold={this.state.parameter05.threshold}/>

                                <CardIndexNum
                                    target={this.props.target}
                                    data={this.state.parameter06.data}
                                    name={this.state.parameter06.name}
                                    date={this.state.parameter06.date}
                                    source={this.state.parameter06.source}
                                    units={this.state.parameter06.unit}
                                    template={this.state.parameter06.template}
                                    serie={this.state.parameter06.serie}
                                    threshold={this.state.parameter06.threshold}/>

                                <CardIndexNum
                                    target={this.props.target}
                                    data={this.state.parameter07.data}
                                    name={this.state.parameter07.name}
                                    date={this.state.parameter07.date}
                                    source={this.state.parameter07.source}
                                    units={this.state.parameter07.unit}
                                    template={this.state.parameter07.template}
                                    serie={this.state.parameter07.serie}
                                    threshold={this.state.parameter07.threshold}/>

                                <CardIndexNum
                                    target={this.props.target}
                                    data={this.state.parameter08.data}
                                    name={this.state.parameter08.name}
                                    date={this.state.parameter08.date}
                                    source={this.state.parameter08.source}
                                    units={this.state.parameter08.unit}
                                    template={this.state.parameter08.template}
                                    serie={this.state.parameter08.serie}
                                    threshold={this.state.parameter08.threshold}/>

                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

Dashboard.propTypes = {
    classes: PropTypes.object.isRequired,
    target: PropTypes.string.isRequired
};

export default withStyles(styles)(Dashboard);

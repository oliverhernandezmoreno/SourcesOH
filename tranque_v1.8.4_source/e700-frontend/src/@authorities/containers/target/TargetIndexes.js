import React from 'react';
import {Grid} from '@material-ui/core';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import * as config from '@app/config';
import moment from 'moment';
import * as TimeseriesService from '@app/services/backend/timeseries';
import {EMAC} from '@miners/containers/EMAC/dashboard/constants';
import {TargetIndexTable} from '@authorities/components/target/TargetIndexTable';
import {LastUpdate} from '@authorities/components/LastUpdate';
import TSymbology from '@authorities/components/TSymbology';


export class TargetIndexes extends SubscribedComponent {

    state = {
        indexes: [],
        timeseries: [],
        loadingData: false,
        lastUpdate: '--'
    };

    loadData() {
        this.unsubscribeAll();
        const {target} = this.props.match.params;
        this.subscribeInterval(
            config.DEFAULT_REFRESH_TIME,
            TimeseriesService.list({
                target,
                template_category: EMAC.templateCategoryIndexes,
                max_events: 6
            }),
            (timeseries) => {
                this.setState({loadingData: false, timeseries, lastUpdate: moment().format(config.DATETIME_FORMAT)});
            },
            undefined,
            undefined,
            () => {
                this.setState({loadingData: true});
            }
        );
    }

    componentDidMount() {
        this.loadData();
    }

    indexes = [
        {
            title: 'RIESGO AGUAS SUPERFICIALES',
            subtitle: 'AGUAS CIRCUNDANTES',
            groups: [
                {
                    header: 'Valores de referencia según estándar plataforma',
                    templates: [
                        {
                            template_name: 'emac-mvp.riego.superficial.ir',
                            label: 'Uso Riego'
                        },
                        {
                            template_name: 'emac-mvp.agua-potable.superficial.ir',
                            label: 'Uso Consumo humano/bebida animal'
                        },
                        {
                            template_name: 'emac-mvp.recreacion.superficial.ir',
                            label: 'Uso Recreacional'
                        },
                        {
                            template_name: 'emac-mvp.vida-acuatica.superficial.ir',
                            label: 'Uso Vida acuática'
                        }
                    ]
                }
            ]
        },
        {
            title: 'RIESGO AGUAS SUPERFICIALES RCA',
            subtitle: 'AGUAS CIRCUNDANTES',
            groups: [
                /* {
                    header: 'Valores de referencia según RCA u otros compromisos',
                    templates: [
                        {
                            visible: true,
                            template_name: 'unknown',
                            label: 'Uso Riego'
                        },
                        {
                            visible: true,
                            template_name: 'unknown',
                            label: 'Uso Consumo humano/bebida animal'
                        },
                        {
                            visible: true,
                            template_name: 'unknown',
                            label: 'Uso Recreacional'
                        },
                        {
                            visible: true,
                            template_name: 'unknown',
                            label: 'Uso Vida acuática'
                        }
                    ]
                } */
            ]
        },
        {
            title: 'RIESGO AGUAS SUBTERRÁNEAS',
            subtitle: 'AGUAS CIRCUNDANTES',
            groups: [
                /*  {
                    header: 'Valores de referencia según estándar plataforma',
                    templates: [
                        {
                            visible: false,
                            template_name: 'emac-mvp.riego.subterraneo.ir',
                            label: 'Uso Riego'
                        },
                        {
                            visible: false,
                            template_name: 'emac-mvp.agua-potable.subterraneo.ir',
                            label: 'Uso Consumo humano/bebida animal'
                        },
                        {
                            visible: false,
                            template_name: 'emac-mvp.recreacion.subterraneo.ir',
                            label: 'Uso Recreacional'
                        },
                        {
                            visible: false,
                            template_name: 'emac-mvp.vida-acuatica.subterraneo.ir',
                            label: 'Uso Vida acuática'
                        }
                    ]
                } */
            ]
        },
        {
            title: 'RIESGO AGUAS SUBTERRÁNEAS RCA',
            subtitle: 'AGUAS CIRCUNDANTES',
            groups: [
                /* {
                    header: 'Valores de referencia según RCA u otros compromisos',
                    templates: [
                        {
                            visible: true,
                            template_name: 'unknown',
                            label: 'Uso Riego'
                        },
                        {
                            visible: true,
                            template_name: 'unknown',
                            label: 'Uso Consumo humano/bebida animal'
                        },
                        {
                            visible: true,
                            template_name: 'unknown',
                            label: 'Uso Recreacional'
                        },
                        {
                            visible: true,
                            template_name: 'unknown',
                            label: 'Uso Vida acuática'
                        }
                    ]
                } */
            ]
        },
        {
            title: 'IMPACTO',
            subtitle: 'AGUAS CIRCUNDANTES',
            groups: [/* 
                {
                    templates: [
                        {
                            visible: false,
                            template_name: 'unknown',
                            label: 'Aguas superficiales'
                        },
                        {
                            visible: false,
                            template_name: 'unknown',
                            label: 'Aguas subterráneas'
                        }
                    ]
                } */
            ]
        }
    ];

    render() {
        const {match: {params: {target}}} = this.props;
        const {timeseries, lastUpdate, loadingData} = this.state;
        return (
            <Grid container spacing={3} style={{paddingTop: 23}}>
                <Grid item xs={3}>
                    <Grid container direction='row' justify='space-between'>
                        <Grid item><TSymbology/></Grid>
                    </Grid>
                </Grid>
                <Grid item xs={9}>
                    <LastUpdate date={lastUpdate} loading={loadingData}/>
                </Grid>
                {this.indexes.map((i, j) => (
                    <Grid item key={j} xs={12}>
                        <TargetIndexTable {...i} timeseries={timeseries} fullHeight={true} target={target}/>
                    </Grid>
                ))}
            </Grid>
        );
    }
}

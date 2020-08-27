import React from 'react';
import {Grid, withStyles} from '@material-ui/core';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import * as config from '@app/config';
import moment from 'moment';
import * as StatusService from '@communities/services/status';
import {EMAC} from '@miners/containers/EMAC/dashboard/constants';
import {TargetIndexTable} from '@communities/components/target/TargetIndexTable';
import {LastUpdate} from '@authorities/components/LastUpdate';
import AlertSymbology from '@communities/components/target/AlertSymbology';


const styles = theme => ({
    container: {
        paddingTop: 23,
        margin: 0,
        width: '100%'
    },
});

class TargetIndexes extends SubscribedComponent {

    constructor(props) {
        super(props);
        this.state = {
            indexes: [],
            status: {status: []},
            loadingData: false,
            lastUpdate: '--'
        };
    }

    loadData() {
        this.unsubscribeAll();
        const {target} = this.props.match.params;

        this.subscribeInterval(
            config.DEFAULT_REFRESH_TIME,
            StatusService.listStatus({
                target,
                group: [EMAC.templateCategoryIndexes, EMAC.templateCategoryRiskIndexes]
            }),
            (status) => {
                this.setState({loadingData: false, status, lastUpdate: moment().format(config.DATETIME_FORMAT)});
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
            title: 'ESTABILIDAD FÍSICA',
            subtitle: 'ESTABILIDAD FÍSICA',
            groups: [
                {
                    templates: [
                        {
                            visible: true,
                            template_name: 'unknown',
                            label: 'Estatus público (informa alertas)'
                        }
                    ]
                }
            ]
        },
        {
            title: 'RIESGO AGUAS SUPERFICIALES',
            subtitle: 'AGUAS CIRCUNDANTES',
            groups: [
                {
                    header: 'Valores de referencia según RCA u otros compromisos',
                    templates: [
                        {
                            visible: true,
                            template_name: 'emac-mvp.riego.superficial.ir',
                            label: 'Uso Riego'
                        },
                        {
                            visible: true,
                            template_name: 'emac-mvp.agua-potable.superficial.ir',
                            label: 'Uso Consumo humano/bebida animal'
                        },
                        {
                            visible: true,
                            template_name: 'emac-mvp.recreacion.superficial.ir',
                            label: 'Uso Recreacional'
                        },
                        {
                            visible: true,
                            template_name: 'emac-mvp.vida-acuatica.superficial.ir',
                            label: 'Uso Vida acuática'
                        }
                    ]
                }
            ]
        },
        {
            title: 'RIESGO AGUAS SUBTERRÁNEAS',
            subtitle: 'AGUAS CIRCUNDANTES',
            groups: [
                {
                    header: 'Valores de referencia según RCA u otros compromisos',
                    templates: [
                        {
                            visible: true,
                            template_name: 'emac-mvp.riego.subterraneo.ir',
                            label: 'Uso Riego'
                        },
                        {
                            visible: true,
                            template_name: 'emac-mvp.agua-potable.subterraneo.ir',
                            label: 'Uso Consumo humano/bebida animal'
                        },
                        {
                            visible: true,
                            template_name: 'emac-mvp.recreacion.subterraneo.ir',
                            label: 'Uso Recreacional'
                        },
                        {
                            visible: true,
                            template_name: 'emac-mvp.vida-acuatica.subterraneo.ir',
                            label: 'Uso Vida acuática'
                        }
                    ]
                }
            ]
        }
    ];

    render() {
        const target = this.props.match.params.target;
        const {status, lastUpdate, loadingData} = this.state;

        return (
            <Grid container spacing={3} justify='flex-start' className={this.props.classes.container}>
                <Grid item xs={12} >
                    <LastUpdate date={lastUpdate} loading={loadingData}/>
                </Grid>
                <Grid item xs={12}>
                    <AlertSymbology/>
                </Grid>
                {this.indexes.map((i, j) => (
                    <Grid item key={j} xs={12} sm={9} md={6}>
                        <TargetIndexTable
                            {...i} status={status.status}
                            fullHeight={true} target={target}/>
                    </Grid>
                ))}
            </Grid>
        );
    }
}

export default withStyles(styles)(TargetIndexes);

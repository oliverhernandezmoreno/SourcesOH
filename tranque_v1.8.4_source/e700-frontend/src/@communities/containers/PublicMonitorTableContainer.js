import React from 'react';

import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import moment from 'moment';
import * as ZoneService from '@app/services/backend/zone';
import * as TargetService from '@app/services/backend/target';
import * as config from '@app/config';
import * as Sorting from '@communities/services/home/sorting';
import * as StatusService from '@communities/services/status';
import {CircularProgress, Typography, Box, withStyles} from '@material-ui/core';
import PublicMonitorTable from '@communities/components/list/PublicMonitorTable';
import IconTextGrid from '@app/components/utils/IconTextGrid';
import {generateTableData} from '@communities/services/home/dataFieldsGenerator';
import {LastUpdate} from '@authorities/components/LastUpdate';
import {EMAC} from '@miners/containers/EMAC/dashboard/constants';
import {forkJoin} from 'rxjs';
import {mergeMap, map} from 'rxjs/operators';


const styles = theme => ({
    container: {
        padding: theme.spacing(2)
    }
});



/**
 * A container for preparing data for MonitoringTable component.
 *
 * @version 1.0.0
 * @author [Natalia Vidal](https://gitlab.com/nattoV)
 */
export const PublicMonitorTableContainer = withStyles(styles)(class extends SubscribedComponent {

    state = {
        targets: [],
        tableData: [],
        initialLoading: false,
        initialLoadText: '...',
        loading: false,
        lastUpdate: '--',
        communeName: '',
        regionName: ''
    };

    componentDidMount() {
        this.getZoneNames();
        this.getInitialTargetList();
    }

    getZoneNames() {
        this.subscribe(
            ZoneService.listAllPublic(),
            zones => {
                const hierarchy = ZoneService.parseZoneOptions(zones);
                const communeInfo = zones.find(commune => commune.natural_name === this.props.match.params.commune);
                const regionInfo = hierarchy.find(
                    region => region.regionCommunes.some(
                        c => c.natural_name === communeInfo.natural_name
                    )
                );
                this.setState({
                    communeName: communeInfo.name,
                    regionName: regionInfo.label
                });
            }
        );
    }


    /**
     * Function triggered to get the deposits data from end-point.
     *
     * @public
     */
    getInitialTargetList() {
        this.setState({
            initialLoading: true,
            initialLoadText: 'depósitos...'
        });
        this.subscribe(
            TargetService.listAllPublic({cache: config.DEFAULT_CACHE_TIME,
                streamPageResults: true,
                zone_nk: this.props.match.params.commune}),
            ({total, page, data}) => {
                this.setState(state => {
                    const targets = data.reduce((acc, t) => ({...acc, [t.canonical_name]: t}), {...state.targets});
                    const targetArray = Object.values(targets);
                    const ret = {
                        targets,
                        initialLoadText: `depósitos... ${targetArray.length} de ${total}`
                    };
                    if (page === 1) {
                        ret.tableData = generateTableData(targetArray, [], null)
                            .sort((a, b) => Sorting.getStateSortNumber(a, b));
                    }
                    return ret;
                });
            },
            undefined,
            () => {
                this.getInitialIndexes();
            }
        );
    }


    /**
     * Function triggered to get index values from timeseries end-point.
     *
     * @public
     */
    getInitialIndexes() {
        this.setState({
            initialLoading: true,
            initialLoadText: 'Índices...'
        });
        
        this.subscribe(
            forkJoin(Object.values(this.state.targets).map(target => StatusService.listStatus({
                target: target.canonical_name,
                group: [EMAC.templateCategoryIndexes, EMAC.templateCategoryRiskIndexes]
            }).pipe(map(status => ({target, status}))))),
            data => {                
                this.setState(state => ({
                    tableData: generateTableData(Object.values(state.targets), data, null)
                        .sort((a, b) => Sorting.getStateSortNumber(a, b)),
                    initialLoading: false,
                    lastUpdate: moment().format(config.DATETIME_FORMAT)
                }));                
                this.setDataUpdate();
            },
            undefined,
            () => this.setState({initialLoading: false})         
        );
    }

    setDataUpdate() {
        this.subscribeInterval(
            config.DEFAULT_REFRESH_TIME,
            TargetService.listAllPublic({with_remote: true, zone_nk: this.props.match.params.commune})
                .pipe(mergeMap(targets => {
                    return forkJoin(targets.map(target => StatusService.listStatus({
                        target: target.canonical_name,
                        group: [EMAC.templateCategoryIndexes, EMAC.templateCategoryRiskIndexes]
                    }).pipe(map(status => ({status, target}))))).pipe(map(data => ({targets, data})));
                })),
            ({targets, data}) => {
                this.setState(state => {
                    const _targets = targets.reduce((acc, t) => ({...acc, [t.canonical_name]: t}), {...state.targets});
                    return {
                        loading: false,
                        lastUpdate: moment().format(config.DATETIME_FORMAT),
                        tableData: generateTableData(Object.values(_targets), data, null)
                            .sort((a, b) => Sorting.getStateSortNumber(a, b)),
                        targets: _targets
                    };
                });
            },
            undefined,
            undefined,
            () => {
                this.setState({loading: true});
            }
        );
    }

    render() {
        const {initialLoading, loading, lastUpdate, tableData, initialLoadText} = this.state;
        const {classes} = this.props;
        return (
            <div className={classes.container}>
                <Box display="flex" justifyContent="flex-end" alignItems="center">
                    {initialLoading ? <Box display="flex" flexGrow="1" justifyContent="center">
                        <IconTextGrid
                            icon={<CircularProgress size={20}/>}
                            text={<Typography variant="h6">Cargando {initialLoadText}</Typography>}/>
                    </Box> :
                        <div>
                            <LastUpdate date={lastUpdate} loading={loading}/>
                        </div>}
                </Box>
                <PublicMonitorTable
                    data={tableData}
                    title="Depósitos de relaves"
                    disabled={initialLoading}
                    commune={this.props.match.params.commune}
                    communeName={this.state.communeName}
                    regionName={this.state.regionName}
                />
            </div>
        );
    }
});

export default PublicMonitorTableContainer;

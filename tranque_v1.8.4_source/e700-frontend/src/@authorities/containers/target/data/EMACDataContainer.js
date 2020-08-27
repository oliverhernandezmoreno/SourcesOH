import React from 'react';
import PropTypes from 'prop-types';
import * as config from '@app/config';
import RequestTargetDataButton from '@authorities/components/target/RequestTargetDataButton';
import * as DumpRequestService from '@app/services/backend/dumpRequest';
import * as DataSourceService from '@app/services/backend/dataSources';
import * as SiteParameterService from '@app/services/backend/siteParameter';
import {Grid, Typography, withStyles} from '@material-ui/core';
import {Redirect} from 'react-router-dom';
import {Route, Switch} from 'react-router';
import {reverse, route} from '@app/urls';
import * as moment from 'moment/moment';
import SubMenu from '@authorities/containers/layout/SubMenu';
import EMACRawByVariable from '@miners/containers/EMAC/raw/EMACRawByVariable';
import EMACRawBySource from '@miners/containers/EMAC/raw/EMACRawBySource';
import RequestsRecord from '@authorities/components/target/RequestsRecord';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import {Subscription, forkJoin} from 'rxjs';
import {getDateSortNumber} from '@app/services/sorting';
import {getTranslatedState} from '@app/services/backend/dumpRequest';
import DetailedTargetMap from '@authorities/components/target/data/DetailedTargetMap';
import {getEMACtypes} from '@miners/containers/EMAC/EMAC.labels';


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
export const EMACDataContainer = withStyles(styles)(class extends SubscribedComponent  {

    state= {
        startDate: moment().subtract(1, 'year').startOf('day'),
        endDate: moment().endOf('day'),
        dumpRequests: [],
        dataSources: [],
        mapProps: []
    }

    profile =  "emac-mvp";
    traceSub = new Subscription();

    componentDidMount() {
        this.subscribe(
            forkJoin({
                requests: this.listDumpRequests(),
                dataSources: this.listDataSource(),
                mapProps: this.getMapParameters()
            })
            ,
            ({requests, dataSources, mapProps}) => this.setState({
                dumpRequests: requests.results.slice()
                    .sort((a, b) => getDateSortNumber(a.created_at, b.created_at)),
                dataSources: this.getFilteredDataSources(dataSources),
                mapProps
            })
        );
    }

    getMapParameters() {
        return SiteParameterService.getMapParameters({
            cache: config.DEFAULT_CACHE_TIME * 3
        });
    }

    listDumpRequests() {
        return DumpRequestService.listDumpRequests({
            cache: config.DEFAULT_CACHE_TIME,
            target_canonical_name: this.props.target.canonical_name,
            profile: this.profile
        });
    }

    listDataSource() {
        return DataSourceService.listAll({
            target: this.props.target.canonical_name,
        });
    }

    getMapTableColumns() {
        return [
            {
                title: 'Punto de Monitoreo',
                field: 'name',
                headerStyle: {textAlign: 'center'}
            },
            { render: data => getEMACtypes(data).water },
            { render: data => getEMACtypes(data).surface },
            {
                title: 'UTM este',
                render: data => data.coords.x
            },
            {
                title: 'UTM norte',
                render: data => data.coords.y
            }
        ]
    }

    getFilteredDataSources(dataSources) {
        return dataSources && dataSources.filter(src => src.groups.includes('monitoreo-aguas'));
    }

    handleRequest = (selectedStartDate, selectedEndDate) => {
        this.subscribe(
            DumpRequestService.createDumpRequest({
                target_canonical_name: this.props.target.canonical_name,
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


    getMenuItems() {
        const {target} = this.props;
        return [
            {  subtitle: 'Datos en bruto' },
            {
                title: 'Por variable',
                path: reverse('authorities.target.data.emac.rawByVariable', {target: target.canonical_name})
            },
            {
                title: 'Por punto de monitoreo',
                path: reverse('authorities.target.data.emac.rawBySource', {target: target.canonical_name})
            },
            {
                title: 'Mapa de puntos de monitoreo',
                path: reverse('authorities.target.data.emac.map', {target: target.canonical_name})
            }
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
        const {startDate, endDate, dumpRequests, dataSources, mapProps} = this.state;
        return <Grid container spacing={1} className={classes.container}>
            <Grid item container justify='space-between' alignItems='center' className={classes.requestContainer}>

                <Grid item className={classes.requestButton}>
                    <RequestTargetDataButton handleRequest={this.handleRequest}
                        initialStartDate={startDate}
                        initialEndDate={endDate}/>
                </Grid>

                <Grid item>{this.renderLastRequest()}</Grid>

                <Grid item className={classes.dialog}>
                    <RequestsRecord data={dumpRequests}/>
                </Grid>
            </Grid>

            <Grid item xs={12} sm={3} className={classes.subMenu}>
                <SubMenu items={this.getMenuItems()}/>
            </Grid>
            <Grid item xs={12} sm={9}>
                <Switch>
                    <Route path={route('authorities.target.data.emac.rawByVariable')}
                        component={(props) => <EMACRawByVariable {...props}
                            startDate={startDate}
                            endDate={endDate}/>}/>
                    <Route path={route('authorities.target.data.emac.rawBySource')}
                        component={(props) => <EMACRawBySource {...props}
                            startDate={startDate}
                            endDate={endDate}/>}/>
                    <Route path={route('authorities.target.data.emac.map')}
                        component={(props) =>
                            <DetailedTargetMap
                                mapProps={mapProps}
                                dataSources={dataSources}
                                tableColumns={this.getMapTableColumns()}
                                name='Punto de monitoreo de aguas'
                            />}
                    />
                    <Route path={route('authorities.target.data.emac')}
                        render={(props) => <Redirect
                            to={reverse('authorities.target.data.emac.rawByVariable',
                                {target: target.canonical_name})}/>}
                    />
                </Switch>
            </Grid>
        </Grid>
    }
})

EMACDataContainer.propTypes = {
    target: PropTypes.object
};

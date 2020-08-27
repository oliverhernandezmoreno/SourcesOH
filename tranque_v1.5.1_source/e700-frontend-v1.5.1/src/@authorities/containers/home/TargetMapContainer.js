import React from 'react';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import * as TargetService from '@app/services/backend/target';
import {withStyles} from '@material-ui/core/styles';
import {TargetMap} from '@authorities/components/map/TargetMap';
import {LastUpdate} from '@authorities/components/LastUpdate';
import * as config from '@app/config';
import * as TicketsService from '@app/services/backend/tickets';
import * as SiteParameterService from '@app/services/backend/siteParameter';
import MapSymbology from '@authorities/components/map/MapSymbology';
import {CircularProgress, Box, Grid, Typography, Tabs, Tab} from '@material-ui/core';
import {forkJoin} from 'rxjs';
import moment from 'moment';
import IconTextGrid from '@app/components/utils/IconTextGrid';

const EF_CANONICAL_NAME = 'ef';
const EMAC_CANONICAL_NAME = 'emac';

const styles = theme => ({
    root: {
        width: '100%',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column'
    },
    header: {
        padding: theme.spacing(2)
    },
    map: {
        flexGrow: 1
    },
    profileNavigator: {
        marginBottom: theme.spacing(2)
    },
    profileNavigatorFlexContainer: {
        borderBottomWidth: '4px',
        borderBottomStyle: 'solid',
        borderBottomColor: theme.palette.secondary.dark
    },
    profileNavigatorIndicator: {
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        '& > div': {
            width: 'calc(100% - 4px)',
            height: '2px'
        }
    },
    profileNavigatorTabSelected: {
        backgroundColor: theme.palette.secondary.dark
    },
});

export const TargetMapContainer = withStyles(styles)(
    class extends SubscribedComponent {
        state = {
            targets: [],
            targetsMap: {},
            tickets: [],
            selectedProfile: "ef",
            mapProps: {},
            loadingData: false,
            initialLoading: false,
            initialLoadText: '...',
            lastUpdate: '--'
        };

        setDataUpdate() {
            this.subscribeInterval(
                config.DEFAULT_REFRESH_TIME,
                forkJoin({
                    targets: TargetService.listAll({with_remote: true}),
                    tickets: TicketsService.listAll()
                }),
                ({targets, tickets}) => {
                    this.setState(state => {
                        const targetsMap = targets.reduce((acc, t) => ({
                            ...acc,
                            [t.canonical_name]: t
                        }), {...state.targetsMap});
                        return {
                            loading: false,
                            lastUpdate: moment().format(config.DATETIME_FORMAT),
                            tickets,
                            targetsMap,
                            targets: Object.values(targetsMap)
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

        getInitialTickets() {
            this.setState({
                initialLoadText: 'Tickets...'
            });
            this.subscribe(
                TicketsService.listAll(),
                tickets => {
                    this.setState({
                        tickets,
                        initialLoading: false,
                        lastUpdate: moment().format(config.DATETIME_FORMAT)
                    });
                    this.setDataUpdate();
                }
            );
        }

        getInitialTargetList() {
            this.setState({
                initialLoadText: 'depósitos...'
            });
            this.subscribe(
                TargetService.listAll({cache: config.DEFAULT_CACHE_TIME, streamPageResults: true}),
                ({total, data}) => {
                    this.setState(state => {
                        const targetsMap = data.reduce((acc, t) => ({
                            ...acc,
                            [t.canonical_name]: t
                        }), {...state.targetsMap});
                        const targets = Object.values(targetsMap);
                        return {
                            targetsMap,
                            initialLoadText: `depósitos... ${targets.length} de ${total}`
                        };
                    });
                },
                undefined,
                () => {
                    this.setState(state => ({
                        targets: Object.values(state.targetsMap)
                    }));
                    this.getInitialTickets();
                }
            );
        }

        getMapParams() {
            this.setState({
                initialLoading: true,
                initialLoadText: 'mapa...'
            });
            this.subscribe(
                SiteParameterService.getMapParameters({cache: config.DEFAULT_CACHE_TIME * 3}),
                (mapProps) => {
                    this.setState({mapProps});
                    this.getInitialTargetList();
                }
            );
        }

        renderProfileTabs(){
            const {classes} = this.props;
            const handleChange = (e,v) => this.setState({
                selectedProfile: v
            });

            return (
                <Tabs style={{paddingLeft: 16}}
                    classes={{
                        root: classes.profileNavigator,
                        flexContainer: classes.profileNavigatorFlexContainer,
                        indicator: classes.profileNavigatorIndicator
                    }}
                    indicatorColor="primary"
                    value={this.state.selectedProfile}
                    onChange={handleChange}>
                    <Tab classes={{
                        selected: classes.profileNavigatorTabSelected
                    }} value={EF_CANONICAL_NAME} label="EF"/>
                    <Tab classes={{
                        selected: classes.profileNavigatorTabSelected
                    }} value={EMAC_CANONICAL_NAME} label="EMAC"/>
                </Tabs>
            );
        }

        componentDidMount() {
            this.getMapParams();
        }

        render() {
            const {classes} = this.props;
            const {targets, tickets, selectedProfile, loadingData, initialLoading, initialLoadText, lastUpdate, mapProps} = this.state;
            return (
                <div className={classes.root}>
                    <Box mt={2}>
                        <Grid container justify='center'>
                            {initialLoading && <Grid item>
                                <IconTextGrid
                                    icon={<CircularProgress size={20}/>}
                                    text={<Typography variant="h6">Cargando {initialLoadText}</Typography>}/>
                            </Grid>}
                        </Grid>
                    </Box>
                    <Grid container>
                        <Grid item>
                            <Typography variant='h5' style={{margin: 16}}>Mapa de depósitos</Typography>
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid item>
                            {this.renderProfileTabs()}
                        </Grid>
                    </Grid>
                    <Grid container className={classes.header} alignItems='center' justify='space-between'>
                        <Grid item> <MapSymbology/> </Grid>
                        <Grid item> <LastUpdate loading={loadingData} date={lastUpdate}/> </Grid>
                    </Grid>
                    <div className={classes.map}>
                        <TargetMap satellite={false} targets={targets} tickets={tickets} profile={selectedProfile} {...mapProps}/>
                    </div>
                </div>
            );
        }
    }
);

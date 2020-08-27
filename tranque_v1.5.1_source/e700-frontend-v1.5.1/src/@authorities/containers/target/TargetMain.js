import React from 'react';

import {CircularProgress, Container, Tab, Tabs, Typography} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import * as TargetService from '@app/services/backend/target';
import {reverse, route} from '@app/urls';
import C40X from '@app/components/utils/C40X';
import {Route, Switch} from 'react-router';
import {Link, Redirect} from 'react-router-dom';
import {TargetIndexes} from '@authorities/containers/target/TargetIndexes';
import {TargetSemaphores} from '@authorities/containers/target/TargetSemaphores';
import {getRemoteStatus} from '@authorities/services/remote';
import {RemoteStatusIcon} from '@authorities/components/RemoteStatusIcon';
import IconTextGrid from '@app/components/utils/IconTextGrid';
import IndexDetail from '@authorities/containers/target/index/IndexDetail';
import {EMACDataContainer} from '@authorities/containers/target/data/EMACDataContainer';
import {EFDataContainer} from '@authorities/containers/target/data/ef/EFDataContainer';
import {BasicInfoContainer} from '@authorities/containers/target/BasicInfoContainer';
import TicketRoot from '@alerts_events/containers/TicketRoot';

const styles = theme => ({
    header: {
        display: 'flex',
        alignItems: 'flex-end',
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2)
    },
    separator: {
        margin: `${theme.spacing(0.5)}px ${theme.spacing(1)}px`
    },
    remote: {
        marginLeft: theme.spacing(1),
        fontSize: "1.25rem"
    },

    mainNav: {
        marginBottom: theme.spacing(2),
        display: "inline-flex",
        border: `2px solid ${theme.palette.primary.main}`,
        borderRadius: "8px"
    },
    flexContainer: {
    },
    indicator: {
    },
    mainNavTab: {
        borderRight: `2px solid ${theme.palette.primary.main}`,
        "&:last-child": {
            borderRight: 'none'
        }
    },
    selected: {
        backgroundColor: theme.palette.secondary.dark
    },

    normalNav: {
    },
    normalNavFlexContainer: {
        borderBottomWidth: '4px',
        borderBottomStyle: 'solid',
        borderBottomColor: theme.palette.secondary.dark
    },
    normalNavIndicator: {
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        '& > div': {
            width: 'calc(100% - 4px)',
            height: '2px'
        }
    },
    normalNavSelected: {
        backgroundColor: theme.palette.secondary.dark
    },

    loading: {
        paddingTop: theme.spacing(2),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
    }
});

function TicketsList(scope, target) {
    const subtitle = (
        scope === 'ef' ?
            'Estabilidad física del depósito' :
            'Aguas circundantes al depósito'
    );
    return (props) => (
        <TicketRoot {...props}
            target={target}
            group={scope}
            subtitle={subtitle}
            basePath={'authorities.target.tickets.' + scope}
            openPath={'authorities.target.tickets.' + scope + '.open.detail'}
            archivedPath={'authorities.target.tickets.' + scope + '.archived.detail'}
            unevaluablePath={'authorities.target.tickets.' + scope + '.unevaluable.detail'}
            closedPath={'authorities.target.tickets.' + scope + '.closed.detail'}
            newPath={'authorities.target.tickets.' + scope + '.new'}
        />
    );
}

class TargetMainClass extends SubscribedComponent {

    state = {
        target: {},
        loadingData: false
    };

    loadData() {
        this.unsubscribeAll();
        const {target} = this.props.match.params;
        this.setState({loadingData: true});
        this.subscribe(
            TargetService.get({canonical_name: target}),
            target => {
                this.setState({loadingData: false, target});
            }
        );
    }

    componentDidMount() {
        this.loadData();
    }

    renderNav(tabs, mainNav) {
        const {classes, location: {pathname}} = this.props;
        const activeTab = (tabs.find(t => pathname.startsWith(t.to)) || {}).to || false;
        let tabsProps = {};
        let tabProps = {};
        if (mainNav) {
            tabsProps = {
                classes: {
                    root: classes.mainNav,
                    indicator: classes.indicator,
                    flexContainer: classes.flexContainer
                },
                TabIndicatorProps: {children: <div/>},
                indicatorColor: "primary"
            };
            tabProps = {
                classes: {
                    root: classes.mainNavTab,
                    selected: classes.selected
                }
            };
        } else {
            tabsProps = {
                classes: {
                    root: classes.normalNav,
                    indicator: classes.normalNavIndicator,
                    flexContainer: classes.normalNavFlexContainer
                },
                TabIndicatorProps: {children: <div/>},
                indicatorColor: "primary"
            };
            tabProps = {
                classes: {
                    root: classes.normalNavTab,
                    selected: classes.normalNavSelected
                }
            };
        }
        return (
            <Tabs value={activeTab} {...tabsProps}>
                {tabs.map((t, i) => (
                    <Tab
                        {...tabProps}
                        key={i}
                        component={Link}
                        to={t.to}
                        value={t.to}
                        label={t.label}
                    />
                ))}
            </Tabs>
        );
    }

    renderMainNav() {
        const {target} = this.props.match.params;
        return this.renderNav([
            {
                label: 'SEMÁFOROS',
                to: reverse('authorities.target.semaphores', {target: target})
            },
            {
                label: 'DATOS',
                to: reverse('authorities.target.data', {target: target})
            },
            {
                label: 'INFORMACION BÁSICA',
                to: reverse('authorities.target.info', {target: target})
            },
            {
                label: 'ALERTAS Y EVENTOS',
                to: reverse('authorities.target.tickets', {target: target})
            }
        ], true);
    }

    renderSemaphoresNav() {
        const {target} = this.props.match.params;
        return this.renderNav([
            {
                label: 'Ver historial',
                to: reverse('authorities.target.semaphores.history', {target: target})
            },
            /*    {
                label: 'Crear alerta manual',
                to: reverse('authorities.target.semaphores.create', {target: target})
            },
            {
                label: 'Conexión a sitio público',
                to: reverse('authorities.target.semaphores.connection', {target: target})
            } */
        ]);
    }

    renderDataNav() {
        const {target} = this.props.match.params;
        return this.renderNav([
            {
                label: 'ESTABILIDAD FÍSICA',
                to: reverse('authorities.target.data.ef', {target: target})
            },
            {
                label: 'AGUAS CIRCUNDANTES',
                to: reverse('authorities.target.data.emac', {target: target})
            }
        ]);
    }

    renderTicketsNav() {
        const {target} = this.props.match.params;
        return this.renderNav([
            {
                label: 'EF',
                to: reverse('authorities.target.tickets.ef', {target: target})
            },
            {
                label: 'EMAC',
                to: reverse('authorities.target.tickets.emac', {target: target})
            }
        ]);

    }

    render() {
        const {classes} = this.props;
        const {target} = this.state;
        const targetName = target.name || '--';
        const entityName = target.work_sites && target.work_sites.length > 0 ?
            target.work_sites[0].entity.name : "--";
        const regionName = target.zone && target.zone.zone_hierarchy.length > 0 ?
            target.zone.zone_hierarchy[1].name : "--";
        const comunaName = target.zone ? target.zone.name : "--";
        const workSiteName = target.work_sites && target.work_sites.length > 0 ?
            target.work_sites[0].name : '--';

        if (this.state.loadingData) {
            return (
                <Container maxWidth="lg">
                    <div className={classes.loading}>
                        <IconTextGrid icon={<CircularProgress/>} text="Cargando datos..."/>
                    </div>
                </Container>
            );
        }

        return (
            <Container id="scrolled-content" maxWidth="lg">
                <div className={classes.header}>
                    <Typography style={{fontWeight: 'bold'}} display="inline" variant="h5">{targetName}</Typography>
                    <span className={classes.separator}>●</span>
                    <Typography display="inline" variant="h5">{workSiteName}</Typography>
                    <span className={classes.remote}>
                        <RemoteStatusIcon status={getRemoteStatus(target.remote)}/>
                    </span>
                </div>
                {this.renderMainNav()}
                <Switch>

                    <Route path={route('authorities.target.tickets')}
                        render={() => (
                            <>
                                {this.renderTicketsNav()}
                                <Switch>
                                    <Route path={route('authorities.target.tickets.ef')}
                                        render={TicketsList('ef', target.canonical_name)}/>
                                    <Route path={route('authorities.target.tickets.emac')}
                                        render={TicketsList('emac', target.canonical_name)}/>
                                    <Route exact path={route('authorities.target.tickets')}
                                        render={() =>
                                            <Redirect to={{
                                                pathname: reverse('authorities.target.tickets.ef.open',
                                                    {target: target.canonical_name})}}/>
                                        }
                                    />
                                    <Route component={C40X}/>
                                </Switch>
                            </>
                        )}
                    />

                    <Route path={route('authorities.target.info')}
                        render={() => (<BasicInfoContainer
                            target={target}
                            entityName={entityName}
                            regionName={regionName}
                            comunaName={comunaName}
                            workSiteName={workSiteName}/>)}
                    />

                    <Route path={route('authorities.target.data')}
                        render={() => (
                            <>
                                {this.renderDataNav()}
                                <Switch>
                                    <Route path={route('authorities.target.data.ef')}
                                        render={() => <EFDataContainer target={target.canonical_name}/>}
                                    />
                                    <Route path={route('authorities.target.data.emac')}
                                        render={() => <EMACDataContainer target={target}/>}
                                    />
                                    <Route exact path={route('authorities.target.data')}
                                        render={() =>
                                            <Redirect to={{pathname: reverse('authorities.target.data.ef',
                                                {target: target.canonical_name})}}/>
                                        }
                                    />
                                    <Route component={C40X}/>
                                </Switch>
                            </>
                        )} />
                   
                    <Route path={route('authorities.target.semaphores')} render={props => (
                        <>
                            <Switch>
                                <Route path={route('authorities.target.semaphores')} 
                                    render={() => <TargetSemaphores {...props} menuNav={this.renderSemaphoresNav()}/>}/>
                                <Route component={C40X}/>
                            </Switch>
                        </>
                    )}/>

                    <Route path={route('authorities.target.indexes')} render={() => (
                        <>
                            <Switch>
                                <Route path={route('authorities.target.indexes.detail')} component={IndexDetail}/>
                                <Route path={route('authorities.target.indexes')} component={TargetIndexes}/>
                                <Route component={C40X}/>
                            </Switch>
                        </>
                    )}/>
                    <Route component={C40X}/>
                </Switch>
            </Container>
        );
    }
}

export const TargetMain = withStyles(styles)(TargetMainClass);

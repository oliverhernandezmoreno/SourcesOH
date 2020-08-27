import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import {FlashOn, InvertColors, Lock, Opacity, TrendingUp, Visibility} from '@material-ui/icons';

import {Card, CardContent, Grid, Typography} from '@material-ui/core';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import EMACDataFrequency from '@miners/containers/EMAC/dashboard/EMACDataFrequency';
import EMACDataSources from '@miners/containers/EMAC/dashboard/EMACDataSources';
import EMACTendencies from '@miners/containers/EMAC/dashboard/EMACTendencies';
import EMACRI from '@miners/containers/EMAC/dashboard/EMACRI';
import {map, mergeMap} from 'rxjs/operators';
import {forkJoin, of} from 'rxjs';
import * as TimeseriesService from '@app/services/backend/timeseries';
import SourcesService from '@app/services/backend/sources';
import {EMAC} from '@miners/containers/EMAC/dashboard/constants';

const styles = theme => ({
    rootWrapper: {
        height: '100%',
        width: '100%',
        overflowX: 'auto'
    },
    root: {
        minWidth: '1800px',
        height: '100%'
    },
    padding: {
        padding: theme.spacing(1)
    },
    card: {
        height: '100%',
        backgroundColor: '#262629'
    },
    cardContent: {
        padding: theme.spacing(1)
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: theme.spacing(3)
    },
    headerIcon: {
        padding: theme.spacing(1),
        flexGrow: 0,
        flexShrink: 0
    },
    headerTitle: {
        padding: theme.spacing(1),
        flexGrow: 1,
        flexShrink: 1
    },
    headerInfo: {
        padding: theme.spacing(1),
        flexGrow: 0,
        flexShrink: 2
    },
    headerGrey: {
        color: '#8E8E8E'
    }
});

class EMACMonitoringDashboard extends SubscribedComponent {
    state = {
        sources: [],
        templates: {variables: [], sgt: []},
        loading: true
    };

    componentDidMount() {
        const {target} = this.props;
        this.subscribe(
            SourcesService.list({target, dataSourceGroup: EMAC.dataSourceGroup}).pipe(
                mergeMap(sources => {
                    if (sources.length > 0) {
                        return forkJoin({
                            variables: TimeseriesService.list({
                                target,
                                data_source__in: sources
                                    .map(({canonical_name}) => canonical_name)
                                    .join(','),
                                type: 'raw',
                                template_category: EMAC.templateVariables,
                                max_events: 1,
                                page_size: 500
                            }),
                            sgt: TimeseriesService.list({
                                target,
                                data_source__in: sources
                                    .map(({canonical_name}) => canonical_name)
                                    .join(','),
                                type: 'raw',
                                template_category: EMAC.templateSgt,
                                max_events: 1,
                                page_size: 500
                            })
                        }).pipe(map(({variables, sgt}) => {
                            sources.map(source => {
                                source._timeseries = {
                                    variables: variables.filter((variable) => ((variable.data_source || {}).id === source.id)),
                                    sgt: sgt.filter((sgte) => (( sgte.data_source || {}).id === source.id))
                                };
                                return source;
                            });

                            return sources
                        })
                        );
                    }
                    else {
                        return of([]);
                    }
                })
            ),
            sources => {
                this.setState({sources, loading: false});
            }
        );
    }

    renderContent(icon, title, info, infoIcon, content) {
        const {classes} = this.props;
        return <Grid item xs={6}>
            <Card className={classes.card}>
                <CardContent classes={{root: classes.cardContent}}>
                    <div className={classes.header}>
                        <div className={classes.headerIcon}>
                            {icon}
                        </div>
                        <Typography
                            className={classes.headerTitle} variant='h5' display='inline'>
                            {title}
                        </Typography>
                        <Typography
                            className={`${classes.headerInfo} ${classes.headerGrey}`}
                            variant='caption' display='inline'>
                            {info}
                        </Typography>
                        <div className={`${classes.headerIcon} ${classes.headerGrey}`}>
                            {infoIcon}
                        </div>
                    </div>
                    {content}
                </CardContent>
            </Card>
        </Grid>;
    }

    render2() {
        const {classes, target} = this.props;
        const {sources, loading} = this.state;
        return (
            <Grid container className={classes.root}>
                <Grid container>
                    <Grid item xs={3}>
                        <EMACDataFrequency loading={loading} sources={sources}/>
                    </Grid>
                    <Grid item xs={9} className={classes.padding}>
                        <Grid container spacing={1}>
                            {/*Indice de riesgo*/}
                            {this.renderContent(
                                <Opacity/>,
                                'Índices de Riesgo',
                                'Visible para autoridades y comunidades',
                                <Visibility/>,
                                <EMACRI target={target}/>
                            )}
                            {/*Indice de impacto*/}
                            {this.renderContent(
                                <InvertColors/>,
                                'Índices de Impacto',
                                'Visible para autoridades',
                                <Visibility/>,
                                <></>
                            )}
                            {/*Sensores en línea*/}
                            {this.renderContent(
                                <FlashOn/>,
                                'Sensores en línea',
                                'Sólo visible para la compañía minera',
                                <Lock/>,
                                <EMACDataSources target={target} loading={loading} sources={sources}/>
                            )}
                            {/*Tendencias*/}
                            {this.renderContent(
                                <TrendingUp/>,
                                'Tendencias',
                                'Sólo visible para la compañía minera',
                                <Lock/>,
                                <EMACTendencies target={target} loading={loading} sources={sources}/>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }

    render() {
        return (
            <div className={this.props.classes.rootWrapper}>
                {this.render2()}
            </div>
        );
    }
}

EMACMonitoringDashboard.propTypes = {
    classes: PropTypes.object.isRequired,
    target: PropTypes.string.isRequired
};

export default withStyles(styles)(EMACMonitoringDashboard);

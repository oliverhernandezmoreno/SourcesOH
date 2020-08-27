import React from 'react';
import PropTypes from 'prop-types';
import {forkJoin} from 'rxjs';
import {withStyles} from '@material-ui/core/styles';
import {CircularProgress, Typography} from '@material-ui/core';

import * as TemplateService from '@app/services/backend/templates';
import * as TimeseriesService from '@app/services/backend/timeseries';
import * as SourceService from '@app/services/backend/sources';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import history from '@app/history';
import {reverse} from '@app/urls';
import {ChipStatus} from '@miners/components/utils/ChipStatus';
import {ChipStatusLegend} from '@miners/components/utils/ChipStatusLegend';
import {HelpTooltip} from '@miners/components/utils/HelpTooltip';

const styles = theme => ({
    variablesList: {
        padding: '1rem 1rem 0 1rem',
        display: 'flex',
        flexWrap: 'wrap'
    },
    cardHeader: {
        display: 'flex',
        width: '100%'
    },
    progress: {
        color: 'white',
        marginLeft: '1rem'
    },
    legend: {
        marginLeft: theme.spacing(2),
        alignSelf: 'flex-start'
    }
});

class EMACIRVariablesChips extends SubscribedComponent {

    state = {
        templates: [],
        dataSources: [],
        chipData: {},
        timeseries: {},
        activeTemplate: undefined,
        loadingStatusData: false
    };

    buildChipData = (timeseriesList, indexType) => Object.entries(timeseriesList.reduce(
        (chips, t) => ({
            ...chips,
            [t.template_name]: [...(chips[t.template_name] || []), t],
        }), {}))
        .map(([template, timeseries]) => [
            template,
            {
                timeseries,
                status: timeseries
                    .map((t) => ({
                        value: (t.events[0] || {}).value,
                        upper: (t.thresholds.filter(({kind}) => kind === indexType)[0] || {}).upper,
                        lower: (t.thresholds.filter(({kind}) => kind === indexType)[0] || {}).lower,
                    }))
                    .map(({value, upper, lower}) => {
                        if (typeof upper === 'undefined' && typeof lower === 'undefined') {
                            return 0;
                        }
                        if (typeof value === 'undefined') {
                            return 1;
                        }
                        if (typeof upper !== 'undefined' && value > +upper) {
                            return 3;
                        }
                        if (typeof lower !== 'undefined' && value < +lower) {
                            return 3;
                        }
                        return 2;
                    })
                    .reduce((status, s) => Math.max(status, s), 0)
            },
        ])
        .reduce((chips, [template, {timeseries, status}]) => ({
            ...chips,
            [template]: {
                timeseries,
                status: ['na', 'nodata', 'ok', 'warning'][status] || 'na',
            }
        }), {});

    loadData() {
        this.unsubscribeAll();
        this.setState({templates: [], timeseries: [], chipData: {}, loadingStatusData: true});
        const {target, waterType, indexType} = this.props;
        this.subscribe(
            forkJoin([
                SourceService.list({target, dataSourceGroup: 'aguas-abajo'}),
                TemplateService.list({category: 'emac-variable'})
            ]),
            ([downstreamSources, templates]) => {
                const dataSources = downstreamSources.filter(ds => ds.groups.includes(waterType));
                if (dataSources.length > 0) {
                    this.subscribe(
                        TimeseriesService.list({
                            target,
                            template_category: 'emac-variable',
                            type: 'raw',
                            data_source__in: dataSources.map(({canonical_name}) => canonical_name).join(','),
                            max_events: 1
                        }),
                        (timeseries) => this.setState({
                            timeseries,
                            chipData: this.buildChipData(timeseries, indexType),
                            loadingStatusData: false
                        }),
                    );
                } else {
                    this.setState({loadingStatusData: false});
                }
                this.setState({templates, dataSources});
            }
        );
    }

    componentDidMount() {
        this.loadData();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.waterType !== this.props.waterType
            || prevProps.indexType !== this.props.indexType
            || prevProps.target !== this.props.target) {
            this.loadData();
        }
    }

    onVariableSelect(template) {
        return () => {
            history.push(reverse('miners.target.emac.data.ir.detail', {
                ...this.props.match.params,
                templateCN: template.canonical_name
            }));
        };
    }

    getVariableChip(template, chipData, link) {
        const {status} = chipData;
        const chipProps = {
            key: template.canonical_name,
            status,
            text: template.description,
            ...(link ? {link, linkExternal: true} : {onClick: this.onVariableSelect(template)})
        };

        if (!status || status === 'na') {
            return null;
        } else {
            return <ChipStatus {...chipProps}/>;
        }
    }

    matchSuffixes = (tA) => (tB) => tA.split(".").reverse()[0] === tB.split(".").reverse()[0];

    render() {
        const {target, indexMeta, classes} = this.props;
        const {templates, chipData} = this.state;
        const includedChips = templates
            .filter(
                ({canonical_name}) => typeof indexMeta === "undefined" ||
                !indexMeta.excludedTemplates.some(this.matchSuffixes(canonical_name))
            )
            .map((t) => this.getVariableChip(t, chipData[t.canonical_name] || {}))
            .filter((chip) => chip !== null);
        const excludedChips = templates
            .filter(
                ({canonical_name}) => typeof indexMeta !== "undefined" &&
                indexMeta.excludedTemplates.some(this.matchSuffixes(canonical_name))
            )
            .map((t) => this.getVariableChip(
                t,
                chipData[t.canonical_name] || {},
                [
                    reverse('miners.target.emac.data.raw.byVariable', {target}),
                    `template=${t.canonical_name}`
                ].join('?'),
            ))
            .filter((chip) => chip !== null);
        return (
            <>
                <div className={classes.cardHeader}>
                    <div>
                        <Typography variant='body1'>
                            Variables incluidas en el cálculo del índice ({includedChips.length})
                        </Typography>
                        <Typography variant='caption'>
                            Haz click en la variable para ver el detalle.
                        </Typography>
                    </div>
                    <ChipStatusLegend
                        className={classes.legend}
                        options={[
                            {status: 'warning', text: 'La variable excede el valor de referencia'},
                            {status: 'ok', text: 'La variable no excede el valor de referencia'}
                        ]}
                    />
                    {this.state.loadingStatusData && <CircularProgress className={classes.progress}/>}
                </div>
                <div className={classes.variablesList}>
                    {includedChips}
                </div>
                {
                    excludedChips.length > 0 &&
                    <>
                        <div className={classes.cardHeader}>
                            <div>
                                <Typography variant='body1'>
                                  Variables{' '}<strong>no incluidas</strong>
                                    {' '}en el cálculo del índice, por afectación aguas arriba ({excludedChips.length})
                                </Typography>
                                <Typography variant='caption'>
                                      Haz click en la variable para ver el detalle.
                                </Typography>
                            </div>
                            <HelpTooltip className={classes.legend}>
                                <Typography><small>
                                    Una variable puede ser excluida del cálculo si la misma
                                    variable supera un valor de referencia en un punto aguas arriba.
                                </small></Typography>
                                <Typography><small>
                                    Haz click en cada variable para ver los valores comparativos de
                                    puntos de monitoreo.
                                </small></Typography>
                            </HelpTooltip>
                            {this.state.loadingStatusData && <CircularProgress className={classes.progress}/>}
                        </div>
                        <div className={classes.variablesList}>
                            {excludedChips}
                        </div>
                    </>
                }
            </>
        );
    }
}

EMACIRVariablesChips.propTypes = {
    classes: PropTypes.object.isRequired,
    target: PropTypes.string.isRequired,
    waterType: PropTypes.string.isRequired,
    indexType: PropTypes.string.isRequired
};

export default withStyles(styles)(EMACIRVariablesChips);

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import classNames from 'classnames';
import moment from 'moment/moment';
import 'moment/locale/es';
import {CircularProgress, Grid, Typography} from '@material-ui/core';
import {Event} from '@material-ui/icons';
import VariableDialog from '@miners/containers/EMAC/dashboard/VariableDialog';
import SGTFrecuencyTooltip from '@miners/containers/EMAC/dashboard/SGTFrecuencyTooltip';
import {DEFAULT_VARIABLE_FREQUENCY} from '@miners/containers/EMAC/dashboard/constants';

const styles = theme => ({
    root: {
        height: '100%',
        backgroundColor: theme.palette.primary.main,
        padding: theme.spacing(1.5)
    },
    title: {
        padding: theme.spacing(1.5),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    titleIcon: {
        display: 'flex',
        alignItems: 'center',
        marginRight: theme.spacing(1.5)
    },
    progress: {
        color: 'white'
    },
    group: {
        backgroundColor: '#323232',
        padding: theme.spacing(2),
        '&:not(:last-child)': {
            marginBottom: theme.spacing(1)
        }
    },
    groupTitle: {
        fontSize: '14px',
        fontWeight: '700',
        lineHeight: '17px',
        marginBottom: theme.spacing(1.5)
    },
    typeTitle: {
        fontSize: '11px',
        fontWeight: '400',
        lineHeight: '13px',
        marginTop: theme.spacing(1.5),
        marginBottom: theme.spacing(1.5)
    },
    tableHeader: {
        color: '#8E8E8E',
        fontSize: '11px',
        fontWeight: '400',
        lineHeight: '13px',
        marginBottom: theme.spacing(0.5)
    },
    tableRow: {
        backgroundColor: '#464646',
        borderRadius: '3px',
        padding: theme.spacing(1),
        '&:not(:last-child)': {
            marginBottom: theme.spacing(1)
        }
    },
    sourceName: {
        padding: '4px',
        fontSize: '12px',
        fontWeight: '700',
        lineHeight: '14px'
    },
    statusChip: {
        backgroundColor: '#222232',
        border: '1px solid #46465F',
        borderRadius: '13px',
        fontSize: '12px',
        fontWeight: '400',
        lineHeight: '14px',
        padding: '6px 10px',
        cursor: 'default',
        '&:hover': {
            backgroundColor: '#5a5a7d'
        }
    },
    pointer: {
        cursor: 'pointer'
    },
    statusOk: {
        color: '#38E47B'
    },
    statusNotOk: {
        color: '#FDFF3F'
    }
});

const UP_TO_DATE = 0;
const PARTIALLY_UP = 1;
const OUT_OF_DATE = 2;

const LABELS = {
    0: 'Actualizado',
    1: 'Parcial',
    2: 'No actualizado'
};

function getUpToDateCounter(defaultFromDate) {
    return (accumulator, timeseries) => {
        let upToDate = 0;
        if (timeseries.events.length > 0) {
            let fromDate;
            if (timeseries.frequencies.length > 0) {
                fromDate = moment().subtract(+timeseries.frequencies[0].minutes, 'minutes');
            } else {
                fromDate = defaultFromDate;
            }
            // if event date is after fromDate, add 1 to accumulator
            upToDate = fromDate.isSameOrBefore(timeseries.events[0].date) ? 1 : 0;
        }
        return accumulator + upToDate;
    };
}

function getStatus(tsLength, upToDateCount) {
    if (tsLength === upToDateCount) {
        return UP_TO_DATE;
    } else if (upToDateCount > 0) {
        return PARTIALLY_UP;
    } else {
        return OUT_OF_DATE;
    }
}

const initialData = [
    {
        title: 'Aguas arriba',
        types: [
            {
                subtitle: 'Aguas superficiales',
                sources: []
            },
            {
                subtitle: 'Aguas subterráneas',
                sources: []
            }
        ]
    },
    {
        title: 'Aguas abajo',
        types: [
            {
                subtitle: 'Aguas superficiales',
                sources: []
            },
            {
                subtitle: 'Aguas subterráneas',
                sources: []
            }
        ]
    }
];

class EMACDataFrequency extends Component {

    state = {
        data: initialData,
        showVariableDialog: false,
        selectedSource: undefined
    };

    loadData() {
        const {sources} = this.props;

        const countReducer = getUpToDateCounter(moment().subtract(DEFAULT_VARIABLE_FREQUENCY, 'minutes'));

        const _sources = sources.map(source => {
            // _timeseries added in dashboard component
            const {variables, sgt} = source._timeseries;
            const tsU2d = variables.reduce(countReducer, 0);
            const sgtU2d = sgt.reduce(countReducer, 0);

            return {
                ...source, _extra: {
                    tsStatus: getStatus(variables.length, tsU2d),
                    tsU2d,
                    sgtU2d
                }
            };
        });

        const topSup = [];
        const topSub = [];
        const botSup = [];
        const botSub = [];

        _sources.forEach(source => {
            if (source.groups.includes('superficial-aguas-abajo')) {
                botSup.push(source);
            }
            if (source.groups.includes('subterraneo-aguas-abajo')) {
                botSub.push(source);
            }
            if (source.groups.includes('superficial-aguas-arriba')) {
                topSup.push(source);
            }
            if (source.groups.includes('subterraneo-aguas-arriba')) {
                topSub.push(source);
            }
        });

        const data = [
            {
                title: 'Aguas arriba',
                types: [
                    {
                        subtitle: 'Aguas superficiales',
                        sources: topSup
                    },
                    {
                        subtitle: 'Aguas subterráneas',
                        sources: topSub
                    }
                ]
            },
            {
                title: 'Aguas abajo',
                types: [
                    {
                        subtitle: 'Aguas superficiales',
                        sources: botSup
                    },
                    {
                        subtitle: 'Aguas subterráneas',
                        sources: botSub
                    }
                ]
            }
        ];

        this.setState({data});
    }

    componentDidMount() {
        this.loadData();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.sources !== this.props.sources) {
            this.loadData();
        }
    }

    showVariables(source) {
        return () => {
            this.setState({
                showVariableDialog: true,
                selectedSource: source
            });
        };
    }

    closeDialog = () => {
        this.setState({showVariableDialog: false});
    };

    renderSources(sources) {
        const {classes} = this.props;

        if (sources.length === 0) {
            return <Grid item xs={12} className={classes.tableRow}>No hay puntos de monitoreo</Grid>;
        } else {
            return (
                <>
                    <Grid item container className={classes.tableHeader}>
                        <Grid item xs={4}>Punto de monitoreo</Grid>
                        <Grid item xs={4}>Datos laboratorio</Grid>
                        <Grid item xs={4}>Datos sensores</Grid>
                    </Grid>
                    {sources.map((s, si) => (
                        <Grid
                            key={si} container item xs={12}
                            className={classes.tableRow}
                            alignItems="flex-start"
                            alignContent="center">
                            <Grid item xs={4}>
                                <div className={classes.sourceName}>{s.name}</div>
                            </Grid>
                            <Grid item xs={4}>
                                <span
                                    className={classNames(
                                        classes.statusChip,
                                        classes.pointer,
                                        {
                                            [classes.statusOk]: s._extra.tsStatus === UP_TO_DATE,
                                            [classes.statusNotOk]: s._extra.tsStatus !== UP_TO_DATE
                                        }
                                    )}
                                    onClick={this.showVariables(s)}>
                                    {LABELS[s._extra.tsStatus]}
                                </span>
                            </Grid>
                            <Grid item xs={4}>
                                <SGTFrecuencyTooltip source={s} timeseries={s._timeseries.sgt}>
                                    <span className={classNames(
                                        classes.statusChip,
                                        {
                                            [classes.statusOk]: s._extra.sgtU2d >= s._timeseries.sgt.length,
                                            [classes.statusNotOk]: s._extra.sgtU2d < s._timeseries.sgt.length
                                        }
                                    )}>{s._extra.sgtU2d} de {s._timeseries.sgt.length}</span>
                                </SGTFrecuencyTooltip>
                            </Grid>
                        </Grid>
                    ))}
                </>
            );
        }
    }

    render() {
        const {classes, loading} = this.props;
        const {data, selectedSource, showVariableDialog} = this.state;

        return (
            <div className={classes.root}>
                <div className={classes.title}>
                    <div className={classes.titleIcon}>
                        {loading ? <CircularProgress size='1.75em' className={classes.progress}/> : <Event/>}
                    </div>
                    <Typography display="inline">
                        Actualización de datos por punto de monitoreo
                    </Typography>
                </div>
                {data.map((wg, wgi) => (
                    <div key={wgi} className={classes.group}>
                        <div className={classes.groupTitle}>{wg.title}</div>
                        {wg.types.map((wt, wti) => (
                            <Grid container key={wti}>
                                <Grid item xs={12} className={classes.typeTitle}>{wt.subtitle}</Grid>
                                {this.renderSources(wt.sources)}
                            </Grid>
                        ))}
                    </div>
                ))}
                {selectedSource && <VariableDialog
                    open={showVariableDialog}
                    source={selectedSource}
                    timeseries={selectedSource._timeseries.variables}
                    onClose={this.closeDialog}/>}
            </div>
        );
    }
}

EMACDataFrequency.propTypes = {
    classes: PropTypes.object.isRequired,
    sources: PropTypes.array.isRequired,
    loading: PropTypes.bool
};

export default withStyles(styles)(EMACDataFrequency);

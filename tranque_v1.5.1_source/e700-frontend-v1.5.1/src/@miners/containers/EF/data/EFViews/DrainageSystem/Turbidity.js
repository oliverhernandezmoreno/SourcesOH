import React from 'react';
import moment from 'moment/moment';
import Card from '@material-ui/core/Card';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
// import SelectableTimeseries from 'DefaultTemporalView/SelectableTimeseries';
import { connect } from 'react-redux';
import * as TimeseriesService from '@app/services/backend/timeseries';
import Typography from '@material-ui/core/Typography';
import { getEFLabel } from '@miners/components/EF/EF.labels';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import EFFilter from '../../EFFilters/EFFilter';
import { Link } from '@material-ui/core';

import RequestsBox from '@authorities/components/target/RequestsBox';
import {getGaps} from '@app/services/backend/dumpRequest';
import CircularProgress from '@material-ui/core/CircularProgress';
import VegaTimeseriesChart from '@app/components/charts/VegaTimeseriesChart';
import CardGraphicSelector from '../DefaultTemporalView/CardGraphicSelector';
import { SHAPES, COLORS, DASHES } from '@app/components/charts/VegaLegendMiniPlot.js';
import SwitchBox from '../SwitchBox';
import ButtonExport from '@miners/components/utils/ButtonExport';


const styles = theme => ({
    root: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        backgroundColor: '#303030'
    },
    header: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: '100%',
        padding: '30px',
        paddingBottom: '0px'
    },
    title: {
        width: '50%',
        height: '100%',
        display: 'inline-block',
        position: 'relative'
    },
    content: {
        width: '100%',
        position: 'relative'
    },
    content__timeseries: {
        backgroundColor: '#262629',
        margin: '30px',
    },
    content__details: {
        margin: '30px',
        // display: 'flex',
        // flexDirection: 'row'
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridColumnGap: '1em'

    },
    details__section: {
        // width: '50%'
    },
    details__disclaimer: {
        marginBottom: '1.5rem'
    },
    SelectableTimeseriesRoot: {
        width: '100%',
        height: '70%',
        position: 'relative',
        padding: '2em',
    },
    SelectableTimeseriesCard__div: {
        display: 'inline-block',
        verticalAlign: 'top',
        width: '100%',
    },
    SelectableTimeseriesGraphic__timeseries: {
        width: '100%',
        height: '100%',
        display: 'inline-block',
        verticalAlign: 'top',
        padding: '1em'
    },
    SelectableTimeseriesGraphic__selector: {
        width: '100%',
        height: '100%',
        display: 'inline-block',
        verticalAlign: 'top',
        padding: '1em'
    },
    SelectableTimeseriesContent__subtitle: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: '1em'
    },
    SelectableTimeseriesInnerCard: {
        maxWidth: '100%',
        maxHeight: '100%',
        minHeight: "432px",
    },
    SelectableTimeseriesPlot_innerCard: {
        maxWidth: '100%',
        maxHeight: '100%'
    },
    SelectableTimeseriesSpinnerContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '432px',
        background: '#303030',
    }
});


class Turbidity extends SubscribedComponent {

    state = {
        dataLists: {},
        startDate: moment().subtract(1, 'year').startOf('day'),
        endDate: moment().endOf('day'),
        timeseriesData: {},
        metaDataDict: {},
        filters: {
            startDate: moment().subtract(1, 'year').startOf('day'),
            endDate: moment().endOf('day'),
        },
        isLoading: true,
        hiddenLinesDict: {},
        particlesAtOutletSwitchData: []
    };

    loadListSeries() {
        const { target } = this.props;
        this.setState({
            dataLists: [],
            isLoading: true,
        });
        const plotTemplates = this.props.sections;
        const metadataPromises = plotTemplates.flatMap(plotTemplate => {
            return plotTemplate.sources.flatMap((templateSourceName) => {
                return new Promise((resolve, reject) => {
                    this.subscribe(
                        TimeseriesService.list({
                            cache: 60 * 1000,  // one minute
                            target: target,
                            template_name: `ef-mvp.m2.parameters.${templateSourceName}`,
                            max_events: 1
                        }),

                        (ts) => {
                            // ts is a list, then is converted to a dict
                            // TODO is this justified?
                            const templateData = ts.map(ts => ({
                                name: ts.name.split('--')[1] || ts.name,
                                canonical_name: ts.canonical_name,
                                data_source: ts.data_source,
                                thresholds: ts.thresholds,
                                unit: ts.unit,
                            }));


                            // this.setState({
                            //     dataLists: {
                            //         ...this.state.dataLists,
                            //         [templateSourceName]: templateData
                            //     },
                            // });
                            resolve({
                                [templateSourceName]: templateData
                            });

                        }
                    );
                });

            })
        });

        Promise.all(metadataPromises).then(values => {
            this.setState({
                dataLists: values.reduce((acc, cur) => { return { ...acc, ...cur } }),
                isLoading: true,
            });
            this.reloadSeries();
        })

        this.loadSwitchData('turbiedad.B1').then(particlesAtOutletSwitchData => {
            this.setState({
                particlesAtOutletSwitchData
            })
        });
    }

    loadSwitchData = (parameterName) => {
        return new Promise((resolve, reject) => {
            this.subscribe(
                TimeseriesService.list({
                    cache: 60 * 1000,  // one minute
                    target: this.props.target,
                    template_name: `ef-mvp.m2.parameters.${parameterName}`,
                    max_events: 1
                }),

                (response) => {
                    // const validationSwitchData = response.reduce((prevDict, switchData)=>{
                    //     prevDict[switchData.canonical_name] = switchData.events?.[0]?.value
                    //     return prevDict;
                    // }, {});

                    resolve(response);
                }
            );
        });
    }

    reloadSeries = () => {
        const { sections } = this.props;

        const plotTemplates = sections;
        const promises = plotTemplates.flatMap(plotTemplate => {
            return plotTemplate.sources.flatMap((templateSourceName) => {
                const templateData = this.state.dataLists[templateSourceName];
                return this.loadSingleSeries(templateData, templateSourceName);
            });
        });
        Promise.all(promises).then(values => {
            const dict = {};
            values.forEach(templateSourceNameDict => {
                const keys = Object.keys(templateSourceNameDict);
                const dictKeys = Object.keys(dict);
                keys.forEach(templateSourceName => {
                    if (dictKeys.includes(templateSourceName)) {
                        dict[templateSourceName] = {
                            ...dict[templateSourceName],
                            ...templateSourceNameDict[templateSourceName]
                        }
                    }
                    else {
                        dict[templateSourceName] = { ...templateSourceNameDict[templateSourceName] }
                    }
                })
            })
            this.setState({
                timeseriesData: dict,
                isLoading: false,
            });
        })
    }

    loadSingleSeries = (dataList, templateSourceName) => {
        const promises = dataList.flatMap((data) => {
            return this.loadTimeSeries(data.canonical_name, templateSourceName)
        })
        return promises;
    }

    loadTimeSeries = (serie_canonical_name, templateSourceName) => {
        if (!serie_canonical_name || serie_canonical_name === '' || !templateSourceName || templateSourceName === '') {
            return;
        }

        const decomposition_name = serie_canonical_name.split('.').pop();
        const var_name = getEFLabel(decomposition_name);

        // clear only current ts
        // this.setState({
        //     timeseriesData: {
        //         ...this.state.timeseriesData,
        //         [templateSourceName]: {
        //             ...this.state.timeseriesData[templateSourceName],
        //             [serie_canonical_name]: {}
        //         }
        //     },
        // });

        // Load data with aggregation endpoint
        return new Promise((resolve, reject) => {
            this.subscribe(
                TimeseriesService.aggregation({
                    cache: 60 * 1000,  // one minute
                    target: this.props.target,
                    timeseries: serie_canonical_name,
                    aggregation_type: 'max',
                    interval: '1D',
                    date_from: this.state.filters.startDate.format(),
                    date_to: this.state.filters.endDate.format(),
                }),
                (ts) => {
                    resolve({
                        [templateSourceName]: {
                            [serie_canonical_name]: [{ label: `${var_name}`, data: ts?.[0] ?? [] }]
                        }
                    })
                }
            );
        });
    }

    setFilters = (filters) => {
        this.setState({
            filters
        })
    }

    generateExportProps = (title, getRowGroupLabel, getRowLabels, getColumnLabels, getCellTimeSeriesName, metaData) => {
        const canonical_name = metaData.flatMap(
            (row) => getColumnLabels(metaData)
                .map((colLabel, colIndex) => getCellTimeSeriesName(colLabel, colIndex, row))
                .filter((n) => !this.state.hiddenLinesDict[n])
        );
        return {
            canonical_name,
            dateFrom: moment(this.state.filters.startDate).isValid() ? this.state.filters.startDate : null,
            dateTo: moment(this.state.filters.endDate).isValid() ? this.state.filters.endDate : null
        };
    }


    componentDidMount() {
        this.loadListSeries();
    }

    componentDidUpdate(prevProps, prevState) {
        const templateChange = JSON.stringify(prevProps.template) !== JSON.stringify(this.props.template);
        if (templateChange) {
            this.loadListSeries();
        }

        if (prevState.filters !== this.state.filters) {
            const validTempDates = moment(this.props.endDate).isValid() && moment(this.props.startDate).isValid();
            const validCompDates = moment(this.props.dateOne).isValid() && moment(this.props.dateOne).isValid();
            if (validTempDates || validCompDates) {
                this.reloadSeries()
            }
        }
    }

    componentWillUnmount = () => {
        this.unsubscribeAll();
    }

    toggleSeries = (canonical_name) => {
        const hiddenLinesDict = { ...this.state.hiddenLinesDict };
        if (hiddenLinesDict[canonical_name] === undefined)
            hiddenLinesDict[canonical_name] = false;
        hiddenLinesDict[canonical_name] = !hiddenLinesDict[canonical_name];
        this.setState({
            hiddenLinesDict
        });
    }

    /**
     * Converts timeseriesdata from dict to array
     * without those whose name is in the hiddenlinesdict
     *
     * Also calculates how many elements to skip to not to cluttter the plot too much with point marks.
     * Proof.
     *
     * L_i = length of Array i
     * need largest n   nmin <= L_i/n <= nmax, for all i
     * n <= L_i/nmin for all i
     * n >= L_i/nmax for all i
     * is a non empty interval?
     *          max(L_i)/ nmax <= n <= min(L_i)/nmin
     * if n = min(L_i)/nmin
     * needs
     * min(L_i) >= ceil(nmin/nmax * max(L_i))
     * suppose nmin/nmax = 1/5? seems right
     * min(L_i) >= ceil(1/5 * max(L_i))?
     */
    hideLineData = (data, names) => {
        // let minLength = 1e4;
        let maxLength = 2;
        const hiddenLineData = names
            .filter(name => !this.state.hiddenLinesDict?.[name])
            .flatMap((canonical_name) => {

                const series = data?.[canonical_name];
                if (series?.[0]) {
                    maxLength = Math.max(series[0].data.length > 0 ? series[0].data.length : 2, maxLength);
                    // minLength = Math.min(series[0].data.length  > 0 ? series[0].data.length: Infinity, minLength );
                    return series[0].data.map((v, index) => (
                        {
                            ...v,
                            name: canonical_name,
                            index: index // used to filter points so the chart does not get too cluttered
                        }));

                }
                return []
            })
        // const skipPointsEvery = minLength/MIN_POINT_MARKS_PER_LINE;
        const skipPointsEvery = Math.ceil(maxLength / 50);

        return [hiddenLineData, skipPointsEvery];
    }

    hideHorizontalData = (data, names) => {

        // if(data.length > 0 ){
        //     debugger;
        // }
        const processedData = data.flat().filter(d => !!d)
            .filter(({ name }) => !this.state.hiddenLinesDict?.[name])

        return processedData;
    }

    render() {
        const { classes, template, dataDumps, handleRequest } = this.props;
        const plotTemplates = this.props.sections;
        const filterType = plotTemplates?.[0]?.config?.filterType;//Improve checking first

        // Variables used to get datagaps of EF Visualizations
        let dataGaps, vegaDataGaps;
        if (dataDumps){
            dataGaps = getGaps(this.state.filters.startDate, this.state.filters.endDate, dataDumps);
            vegaDataGaps = dataGaps.map((dg, i) => ({
                x: dg.startDate.format('YYYY-MM-DD'),
                x2: dg.endDate.format('YYYY-MM-DD'),
                name: 'dataGap-'+i
            }));
        }

        const particlesAtOutletSwitchData = this.state.particlesAtOutletSwitchData?.[0];

        return (
            <div>
                <Card className={classes.root}>
                    <div className={classes.header}>
                        <div className={classes.title}>
                            <Typography variant='h5'>
                                {getEFLabel(template)}
                            </Typography>
                        </div>
                        <EFFilter filterType={filterType} filters={this.state.filters} setFilters={this.setFilters} />
                        {dataDumps ? <RequestsBox dataGaps={dataGaps} handleRequest={handleRequest} /> : null}
                    </div>

                    <div className={classes.content}>
                        {
                            plotTemplates.map(plotTemplate => {
                                let dataList = plotTemplate.sources.flatMap(template => this.state.dataLists[template] ?? []);
                                const metaDataDict = dataList.reduce((prevDict, series) => {
                                    const { canonical_name, ...data } = series;
                                    prevDict[canonical_name] = data;
                                    return prevDict;
                                }, {})
                                /** TO DO: filter by sector */
                                const metaData = plotTemplate.config.makeMetadata(metaDataDict);

                                const timeseriesData = plotTemplate.sources.reduce((prevDict, currentKey) => {
                                    if (!Object.keys(this.state.timeseriesData).includes(currentKey)) {
                                        return prevDict;
                                    }
                                    Object.entries(this.state.timeseriesData[currentKey]).forEach(([canonical_name, ts]) => {
                                        prevDict[canonical_name] = ts;
                                    });
                                    return prevDict;
                                }, {});


                                const horizontalLinesData = metaData.map(row => {
                                    let currentColIndex = 1;
                                    let thresholdIndex = -1;
                                    return row.thresholds.flatMap((threshold, colIndex) => {
                                        if (threshold.kind !== 'cota-instalacion') {
                                            thresholdIndex++;
                                        }
                                        return [
                                            threshold.lower ? {
                                                value: threshold.lower,
                                                name: `${row.canonical_name}-${currentColIndex++}`,
                                                kind: threshold.kind,
                                                type: 'lower',
                                                thresholdIndex: thresholdIndex,
                                                label: threshold.kind !== 'cota-instalacion' ? `Umbral inferior ${thresholdIndex}` : 'Cota de instalación',
                                            } : undefined,
                                            threshold.upper ? {
                                                value: threshold.upper,
                                                name: `${row.canonical_name}-${currentColIndex++}`,
                                                kind: threshold.kind,
                                                type: 'upper',
                                                thresholdIndex: thresholdIndex,
                                                label: `Umbral superior ${thresholdIndex}`,
                                            } : undefined
                                        ]
                                    }).sort((threshold1, threshold2) => {
                                        if (threshold1.kind === 'cota-instalacion') {
                                            return -1;
                                        }
                                        if (threshold2.kind === 'cota-instalacion') {
                                            return 1
                                        }

                                        if (threshold1.thresholdIndex > threshold2.thresholdIndex) {
                                            return 1;
                                        }
                                        return -1;
                                    });
                                });

                                const cols = Object.values(horizontalLinesData.reduce((prevDict, row) => {
                                    row.forEach(col => {
                                        if (!col) return;
                                        prevDict[col.label] = col;
                                    })
                                    return prevDict;
                                }, {})) ?? [];

                                const columns = ['Instrumento', 'Sistema de drenaje', 'Medición', ...cols.map(col => {
                                    if (col.kind === 'cota-instalacion') {
                                        return 'Cota de instalación';
                                    }

                                    if (col.type === 'lower') {
                                        return `Umbral Inferior ${col.thresholdIndex}`;
                                    }

                                    if (col.type === 'upper') {
                                        return `Umbral Superior ${col.thresholdIndex}`;
                                    }
                                    return `Umbral ${col.thresholdIndex}`;
                                })]


                                /**Build lineStyles: matrix of the same shape as the table containing the propreties (color,
                                 * shape, filled, dashed and name) of each vega-mark (line, etc) to be plotted.
                                 * The name must be unique.
                                 */
                                const getRowGroupLabel = (row) => row?.data_source?.group_names?.[2] ?? 'Sin sector';
                                const rowGroups = [...new Set(metaData.map(plotTemplate.config.getRowGroupLabel))];
                                const groupsToColorMap = rowGroups.reduce((prevDict, group, index) => {
                                    prevDict[group] = COLORS[index % COLORS.length];
                                    return prevDict;
                                }, {});
                                // const columns = plotTemplate.config.getColumnLabels(metaData);


                                let linesStyles = metaData.map((row, index) => {
                                    // color means rowGroup
                                    const group = rowGroups.find(group => group === getRowGroupLabel(row));
                                    const color = groupsToColorMap?.[group] ?? COLORS[0];

                                    // shape means row
                                    const shape = SHAPES[index % SHAPES.length];

                                    return columns.map((column_name, colIndex) => {
                                        // filled means first column
                                        const filled = colIndex === 0;

                                        // dash style maps to column name (first one is continuous line in DASHES)
                                        const dash = DASHES[colIndex <= 2 ? 0 : colIndex - 2 % DASHES.length];

                                        let name = '';
                                        if (colIndex === 2) {
                                            name = row.canonical_name
                                        }
                                        else if (colIndex > 2) {
                                            name = horizontalLinesData[index]?.[colIndex - 3]?.name ?? '';
                                        }

                                        return {
                                            labelOnly: ['Instrumento', 'Sistema de drenaje'].includes(column_name) ? true : false,
                                            color,
                                            shape,
                                            filled,
                                            dash,
                                            name
                                        }
                                    })
                                })

                                const getRowLabels = (row) => {
                                    return [row?.data_source?.name, row?.data_source?.group_names?.[0]]
                                };
                                // apply other modifications
                                // linesStyles = plotTemplate.config.linesStylesModifier(linesStyles);

                                /** Other props for the vegatimeserieschart */
                                const yAxisMeasurementUnits = metaData.flat().find(el => !!el)?.unit?.abbreviation ?? '';
                                const names = [...new Set(linesStyles.flatMap(row => row.map(col => col.name)).filter(name => name !== ''))];
                                const [hiddenLinesData, skipPointsEvery] = this.hideLineData(timeseriesData, names);
                                const hiddenHorizontalLinesData = this.hideHorizontalData(horizontalLinesData, names)

                                /** List of available lines for the legend-table */
                                const availableHorizontal = horizontalLinesData.flatMap(row => row.map(data => data?.name)).filter(d => !!d);
                                const availableTimeSeries = new Set(Object.entries(timeseriesData).map(([key, data]) => {
                                    return data?.[0]?.data.length > 0 ? key : null
                                }));
                                const available = [...availableHorizontal, ...availableTimeSeries];

                                return (
                                    <Card className={classes.content__timeseries} key={plotTemplate.title}>
                                        <div className={classes.SelectableTimeseriesRoot}>
                                            <div className={classes.SelectableTimeseriesContent__subtitle}>
                                                <Typography variant="subtitle1" color="textSecondary"> {plotTemplate.title}</Typography>
                                                <ButtonExport {...this.generateExportProps(
                                                    plotTemplate.title,
                                                    plotTemplate.config.getRowGroupLabel,
                                                    plotTemplate.config.getRowLabels,
                                                    plotTemplate.config.getColumnLabels,
                                                    plotTemplate.config.getCellTimeSeriesName,
                                                    metaData
                                                )} disabled={this.state.isLoading} />
                                            </div>
                                            <div className={classes.SelectableTimeseriesCard__div}>
                                                <div className={classes.SelectableTimeseriesGraphic__timeseries}>
                                                    <div className={classes.SelectableTimeseriesInnerCard}>
                                                        {
                                                            this.state.isLoading ?
                                                                <div className={classes.SelectableTimeseriesSpinnerContainer}>
                                                                    <CircularProgress />
                                                                </div> :
                                                                <VegaTimeseriesChart
                                                                    units={{ y: yAxisMeasurementUnits, x: plotTemplate.config.xAxisUnits }}
                                                                    data={hiddenLinesData}
                                                                    horizontalLinesData={hiddenHorizontalLinesData}
                                                                    gapsData={vegaDataGaps}
                                                                    yAxisTitle={plotTemplate.title}
                                                                    xAxisTitle={plotTemplate.config.xAxisTitle}
                                                                    linesStyles={linesStyles.flatMap(v => v)}
                                                                    names={names}
                                                                    skipPointsEvery={skipPointsEvery}
                                                                    temporalXAxis={true}
                                                                    xDomain={[this.state.filters.startDate.format('YYYY-MM-DD'), this.state.filters.endDate.format('YYYY-MM-DD')]}
                                                                />
                                                        }
                                                    </div>
                                                </div>
                                                {/** Clickable table legend section */}
                                                <div className={classes.SelectableTimeseriesGraphic__selector}>
                                                    <CardGraphicSelector
                                                        metaData={metaData}
                                                        availableNames={available}
                                                        toggleSeries={this.toggleSeries}
                                                        hiddenData={this.state.hiddenLinesDict}
                                                        linesStyles={linesStyles}
                                                        getRowGroupLabel={getRowGroupLabel}
                                                        getRowLabels={getRowLabels}
                                                        getColumnLabels={() => columns}
                                                    />
                                                </div>
                                            </div>
                                        </div >


                                    </Card>
                                )
                            })
                        }
                        <div className={classes.content__details} >
                            <div className={classes.details__section}>
                                <div className={classes.details__disclaimer}>
                                    <Typography variant="body1" color="textSecondary">
                                        Si detectas situaciones como la(s) descrita(s) a continuación, puedes informarlo al sistema, lo que permitirá gestionar tickets de incidentes o alerta. <Link>Saber más</Link>
                                    </Typography>
                                </div>
                                <SwitchBox
                                    header='Material particulado a la salida del sistema de drenaje'
                                    bodyContent='Se detectó material particulado a la salida del sistema de drenaje'
                                    // checked={true}
                                    switchProps={{
                                        checked: particlesAtOutletSwitchData?.events?.[0]?.value === 1,
                                        disabled: particlesAtOutletSwitchData?.events?.[0]?.value === undefined,

                                    }}

                                />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }
}

const MapStateToProps = state => {
    return {
        serieCanonicalName: state.miners.timeSeries.serie_canonical_name
    };
};

Turbidity.propTypes = {
    classes: PropTypes.object.isRequired
};

export default connect(MapStateToProps, null)(withStyles(styles)(Turbidity));

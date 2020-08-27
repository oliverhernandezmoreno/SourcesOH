import React from 'react';
import moment from 'moment/moment';
import Card from '@material-ui/core/Card';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import * as EFService from '@app/services/backend/ef';
import * as DataSourceService from '@app/services/backend/dataSources';
import Typography from '@material-ui/core/Typography';
import { getEFLabel } from '@miners/components/EF/EF.labels';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import DatePicker from '@app/components/utils/DatePicker.js';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import CircularProgress from '@material-ui/core/CircularProgress';
import VegaTimeseriesChart from '@app/components/charts/VegaTimeseriesChart';
import CardGraphicSelector from './DefaultTemporalView/CardGraphicSelector';
import { SHAPES, COLORS, DASHES } from '@app/components/charts/VegaLegendMiniPlot.js';
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
        margin: '30px',
        marginBottom: '0px'
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
    filter: {
        color: 'red',
        marginRight: '1em',
        width: '200px',
        '& > div': {
            width: theme.spacing(22)
        }
    },
    filters: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: '1em',
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


class TopographicProfilesAndHead extends SubscribedComponent {

    state = {
        dataLists: {},
        timeseriesData: {},
        metaDataDict: {},
        dateOne: moment().endOf('day'),
        isLoading: true,
        hiddenLinesDict: {},
        profiles: [],
        profile: {},
        barsData: []
        // filters: {
        //     startDate: moment().subtract(1, 'year').startOf('day'),
        //     endDate: moment().endOf('day'),
        // },
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
                        DataSourceService.list({
                            cache: 60 * 1000,  // one minute
                            target: target,
                            group: 'perfil-transversal',
                            max_events: 1
                        }),

                        (res) => {
                            const ts = res.results;
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
                            const profiles = ts.map(profile => {
                                return {
                                    label: profile.name,
                                    value: profile.canonical_name,
                                    id: profile.id,
                                    sector: profile?.group_names?.[1] ?? '',
                                }
                            })
                            resolve({
                                profiles,
                                dataDicts: {
                                    [templateSourceName]: templateData
                                }
                            });
                        }
                    );
                });

            })
        });

        Promise.all(metadataPromises).then(values => {
            const profiles = [...new Set(values.flatMap(v => v.profiles))];
            this.setProfile(profiles[0]);
            this.setState({
                dataLists: values.map(v => v.dataDicts).reduce((acc, cur) => { return { ...acc, ...cur } }),
                profiles,
                // dataLists: values?.dataDicts?.reduce((acc, cur) => { return { ...acc, ...cur } }),
                isLoading: true,
            });
        })
    }

    reloadSeries = () => {
        this.setProfile(this.state.profile);
    }

    loadSpatialSeries = (id) => {
        // Load data with head endpoint
        const promise = new Promise((resolve, reject) => {
            this.subscribe(
                EFService.read({
                    cache: 60 * 1000,  // one minute
                    target: this.props.target,
                    id: id,
                    date_to: this.state.dateOne.format(),
                }),
                (ts) => {
                    // ts.timeseries[0].canonical_name =  "el-mauro.s-perfil-A1.ef-mvp.m2.parameters.variables.elevacion";
                    // ts.timeseries[0].events => {timestamp: @timestamp, name, x: coords.x, y:value}

                    // const timeseriesDict = {
                    //     [templateSourceName]
                    // }
                    // ts.timeseries[""0""].template_name
                    const parsedTimeseriesDict = ts.timeseries.reduce((prevDict, currentTs) => {
                        const templateName = currentTs.template_name.split('.').pop();
                        prevDict[`variables.${templateName}`] = {
                            [currentTs.canonical_name]: [{
                                label: templateName,
                                data: currentTs.events.map(obs => {
                                    return {
                                        timestamp: moment(obs['@timestamp']),
                                        x: obs.coords.x,
                                        y: obs.value
                                    };
                                })
                            }]
                        }
                        return prevDict;
                    }, {})
                    const parsedProjectedSources = ts.projected_sources.map((source) => {
                        return {
                            name: source?.name,
                            sector: source?.groups?.[1],
                            id: source?.hardware_id,
                            timestamp: moment(source?.timeseries?.[0]?.events?.[0]?.['@timestamp']),
                            x: source?.coords?.x,
                            y: source?.timeseries?.[0]?.events?.[0]?.value,
                        }
                    })

                    resolve(parsedTimeseriesDict);
                    this.setState({
                        timeseriesData: parsedTimeseriesDict,
                        barsData: parsedProjectedSources,
                        isLoading: false,
                    })
                    // resolve({
                    //     [templateName]: {
                    //         [`${serie_canonical_name}`]: [{ label: `${var_name}`, data: ts }]
                    //     },
                    // })
                }
            );
        })

        return promise;
    }

    generateExportProps = (title, getRowGroupLabel, getRowLabels, getColumnLabels, getCellTimeSeriesName, metaData) => {
        const canonical_name = metaData.flatMap(
            (row) => getColumnLabels(metaData)
                .map((colLabel, colIndex) => getCellTimeSeriesName(colLabel, colIndex, row))
                .filter((n) => !this.state.hiddenLinesDict[n])
        );
        return {
            canonical_name,
            dateTo: moment(this.state.dateOne).isValid() ? this.state.dateOne : null,
            head: true
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

        if (prevState.dateOne !== this.state.dateOne) {
            if (moment(this.props.dateOne).isValid()) {
                this.reloadSeries();
            }
        }
    }

    componentWillUnmount = () => {
        this.unsubscribeAll();
    }

    setDateOne = (date) => {
        this.setState({
            dateOne: date,
        });
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

    setProfile = (profile) => {
        this.loadSpatialSeries(profile.id)
        this.setState({
            profile,
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

    hideBarsData = (data) => {

        // if(data.length > 0 ){
        //     debugger;
        // }
        const processedData = data.filter(({ name }) => !this.state.hiddenLinesDict?.[name])

        return processedData;
    }

    render() {
        const { classes, template } = this.props;
        const plotTemplates = this.props.sections;

        return (
            <div>
                <Card className={classes.root}>
                    <div className={classes.header}>
                        <div className={classes.title}>
                            <Typography variant='h5'>
                                {getEFLabel(template)}
                            </Typography>
                        </div>
                        <div className={classes.filters}>
                            <div className={classes.filter}>
                                <DatePicker
                                    views={["year", "month"]}
                                    label="Mes a graficar (fecha 1)"
                                    format="MMMM YYYY"
                                    maxDate={this.state.dateOne}
                                    value={this.state.dateOne}
                                    onChange={this.setDateOne}
                                />
                            </div>
                            <div className={classes.filter}>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={this.state.profile}
                                    renderValue={(profile => profile.label)}
                                    onChange={(event) => this.setProfile(event.target.value)}
                                >
                                    {
                                        this.state.profiles.map(profile => {
                                            return <MenuItem key={profile.label} value={profile}>{profile.label}</MenuItem>
                                        })
                                    }
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className={classes.content}>
                        {
                            plotTemplates.map(plotTemplate => {
                                // let dataList = ['variables.elevacion', 'variables.perfil-suelo-fundacion'].flatMap(template => this.state.dataLists[template] ?? []);
                                // const metaDataDict = dataList.reduce((prevDict, series) => {
                                //     const { canonical_name, ...data } = series;
                                //     prevDict[canonical_name] = data;
                                //     return prevDict;
                                // }, {})
                                /** TO DO: filter by sector */
                                // const metaData = plotTemplate.config.makeMetadata(metaDataDict);
                                const metaData = this.state.profiles;

                                const timeseriesData = ['variables.elevacion', 'variables.perfil-suelo-fundacion'].reduce((prevDict, currentKey) => {
                                    if (!Object.keys(this.state.timeseriesData).includes(currentKey)) {
                                        return prevDict;
                                    }
                                    Object.entries(this.state.timeseriesData[currentKey]).forEach(([canonical_name, ts]) => {
                                        prevDict[canonical_name] = ts;
                                    });
                                    return prevDict;
                                }, {});

                                // const horizontalLinesData = metaData.map(row => {
                                //     let currentColIndex = 1;
                                //     let thresholdIndex = -1;
                                //     return row?.thresholds?.flatMap((threshold, colIndex) => {
                                //         if (threshold.kind !== 'cota-instalacion') {
                                //             thresholdIndex++;
                                //         }
                                //         return [
                                //             threshold.lower ? {
                                //                 value: threshold.lower,
                                //                 name: `${row.canonical_name}-${currentColIndex++}`,
                                //                 kind: threshold.kind,
                                //                 type: 'lower',
                                //                 thresholdIndex: thresholdIndex,
                                //                 label: threshold.kind !== 'cota-instalacion' ? `Umbral inferior ${thresholdIndex}` : 'Cota de instalación',
                                //             } : undefined,
                                //             threshold.upper ? {
                                //                 value: threshold.upper,
                                //                 name: `${row.canonical_name}-${currentColIndex++}`,
                                //                 kind: threshold.kind,
                                //                 type: 'upper',
                                //                 thresholdIndex: thresholdIndex,
                                //                 label: `Umbral superior ${thresholdIndex}`,
                                //             } : undefined
                                //         ]
                                //     }).sort((threshold1, threshold2) => {
                                //         if (threshold1.kind === 'cota-instalacion') {
                                //             return -1;
                                //         }
                                //         if (threshold2.kind === 'cota-instalacion') {
                                //             return 1
                                //         }

                                //         if (threshold1.thresholdIndex > threshold2.thresholdIndex) {
                                //             return 1;
                                //         }
                                //         return -1;
                                //     });
                                // });

                                // const cols = Object.values(horizontalLinesData.reduce((prevDict, row) => {
                                //     if(!row)
                                //         return prevDict
                                //     row.forEach(col => {
                                //         if (!col) return;
                                //         prevDict[col.label] = col;
                                //     })
                                //     return prevDict;
                                // }, {})) ?? [];

                                // const columns = ['Piezómetro', 'Medición', ...cols.map(col => {
                                //     if (col.kind === 'cota-instalacion') {
                                //         return 'Cota de instalación';
                                //     }

                                //     if (col.type === 'lower') {
                                //         return `Umbral Inferior ${col.thresholdIndex}`;
                                //     }

                                //     if (col.type === 'upper') {
                                //         return `Umbral Superior ${col.thresholdIndex}`;
                                //     }
                                //     return `Umbral ${col.thresholdIndex}`;
                                // })]

                                /**Build lineStyles: matrix of the same shape as the table containing the propreties (color,
                                 * shape, filled, dashed and name) of each vega-mark (line, etc) to be plotted.
                                 * The name must be unique.
                                 */
                                const rowGroups = ['topography'];
                                const groupsToColorMap = rowGroups.reduce((prevDict, group, index) => {
                                    prevDict[group] = COLORS[index % COLORS.length];
                                    return prevDict;
                                }, {});
                                // const columns = plotTemplate.config.getColumnLabels(metaData);

                                // let linesStyles = metaData.map((row, index) => {
                                //     // color means rowGroup
                                //     const group = rowGroups[0]
                                //     const color = groupsToColorMap?.[group] ?? COLORS[0];

                                //     // shape means row
                                //     const shape = SHAPES[index % SHAPES.length];

                                //     return columns.map((column_name, colIndex) => {
                                //         // filled means first column
                                //         const filled = colIndex === 0;

                                //         // dash style maps to column name (first one is continuous line in DASHES)
                                //         const dash = DASHES[colIndex <= 1 ? 0 : colIndex - 1 % DASHES.length];

                                //         let name = '';
                                //         if (colIndex === 1) {
                                //             name = row.canonical_name
                                //         }
                                //         else if (colIndex > 1) {
                                //             name = horizontalLinesData[index]?.[colIndex - 2]?.name ?? '';
                                //         }

                                //         return {
                                //             labelOnly: ['Piezómetro'].includes(column_name) ? true : false,
                                //             color,
                                //             shape,
                                //             filled,
                                //             dash,
                                //             name
                                //         }
                                //     })
                                // })

                                const linesStyles = [Object.keys(timeseriesData).map((seriesName, colIndex) => {
                                    const group = rowGroups[0]
                                    const color = groupsToColorMap?.[group] ?? COLORS[0];
                                    const shape = SHAPES[colIndex % SHAPES.length];

                                    // filled means first column
                                    const filled = colIndex === 0;

                                    // dash style maps to column name (first one is continuous line in DASHES)
                                    const dash = DASHES[(colIndex + 1) % DASHES.length];

                                    let name = seriesName;

                                    return {
                                        labelOnly: false,
                                        color,
                                        shape,
                                        filled,
                                        dash,
                                        name
                                    }
                                })]


                                // apply other modifications
                                // linesStyles = plotTemplate.config.linesStylesModifier(linesStyles);

                                /** Other props for the vegatimeserieschart */
                                const yAxisMeasurementUnits = metaData.flat().find(el => !!el)?.unit?.abbreviation ?? '';
                                const names = [...new Set(linesStyles.flatMap(row => row.map(col => col.name)).filter(name => name !== ''))];
                                const [hiddenLinesData, skipPointsEvery] = this.hideLineData(timeseriesData, names);
                                // const hiddenHorizontalLinesData = this.hideHorizontalData(horizontalLinesData, names)

                                const barsStyles = this.state.barsData?.map((bar, index) => {
                                    return ([
                                        {
                                            labelOnly: true
                                        },
                                        {
                                            name: bar.name,
                                            color: COLORS[index % COLORS.length],
                                        }]);
                                }) ?? [];
                                const barNames = this.state.barsData?.map((bar, index) => bar?.name) ?? [];
                                // const columns = ['piezometros', 'medicion']
                                const available = this.state.barsData?.filter(bar => bar.x !== undefined).map(bar => bar.name) ?? [];
                                const hiddenBarsData = this.hideBarsData(this.state.barsData);
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
                                                                    barsData={hiddenBarsData}
                                                                    horizontalLinesData={[]}
                                                                    yAxisTitle={plotTemplate.title}
                                                                    xAxisTitle={plotTemplate.config.xAxisTitle}
                                                                    linesStyles={[...linesStyles.flatMap(v => v), ...barsStyles.flatMap(v => v)]}
                                                                    names={[...names, ...barNames]}
                                                                    temporalXAxis={false}
                                                                    skipPointsEvery={skipPointsEvery}
                                                                />
                                                        }
                                                    </div>
                                                </div>
                                                {/** Clickable table legend section */}
                                                <div className={classes.SelectableTimeseriesGraphic__selector}>
                                                    <CardGraphicSelector
                                                        metaData={this.state.barsData}
                                                        availableNames={available}
                                                        toggleSeries={this.toggleSeries}
                                                        hiddenData={this.state.hiddenLinesDict}
                                                        linesStyles={barsStyles}
                                                        getRowGroupLabel={(row) => row.sector}
                                                        getRowLabels={(row) => [row.name, '']}
                                                        getColumnLabels={() => ['Piezómetro', 'Medición']}
                                                    />
                                                </div>
                                            </div>
                                        </div >


                                    </Card>
                                )
                            })
                        }
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

TopographicProfilesAndHead.propTypes = {
    classes: PropTypes.object.isRequired
};

export default connect(MapStateToProps, null)(withStyles(styles)(TopographicProfilesAndHead));

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
import DatePicker from '@app/components/utils/DatePicker.js';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { Link, Box } from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';

import RequestsBox from '@authorities/components/target/RequestsBox';
import {getGaps} from '@app/services/backend/dumpRequest';
import CircularProgress from '@material-ui/core/CircularProgress';
import VegaTimeseriesChart from '@app/components/charts/VegaTimeseriesChart';
import Button from '@material-ui/core/Button';
import GetAppIcon from '@material-ui/icons/GetApp';
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
    },
    filter: {
        color: 'red',
        marginRight: '1em',
    },
    filters: {
        display: 'grid',
        gridTemplateColumns: 'max-content max-content',
        gridColumnGap: theme.spacing(2),
        marginTop: '1em',
    },
    selector: {
        '& > div': {
            width: theme.spacing(22)
        },
    },
    dateBox: {
        display: 'grid',
        gridTemplateColumns: 'max-content max-content max-content',
        border: '1px solid #6d6d6d;',
        borderRadius: '5px',
        padding: theme.spacing(2),
        alignItems: 'end',
        gridRowGap: theme.spacing(1),
    },
    comparisonBox: {
        display: 'grid',
        gridTemplateColumns: 'max-content',
        border: '1px solid #6d6d6d;',
        borderRadius: '5px',
        padding: theme.spacing(2),
        alignItems: 'end',
        gridRowGap: theme.spacing(1),
    },
    filtersSubtitle: {
        paddingBottom: theme.spacing(1),
    },
    file: {
        display: 'flex',
        flexDirection: 'column',
        background: '#262629',
        borderRadius: '5px',
        padding: theme.spacing(3),
        minHeight: '30rem',
        alignItems: 'flex-start'
    },
    fileHeader: {
        marginBottom: '2rem',
    },
    fileGrid: {
        display: 'grid',
        gridTemplateColumns: '30ch 30ch',
        gridColumnGap: '1rem',
        gridRowGap: '1rem',

    },
    fileGridValue: {
        fontWeight: 1000
    },
    fileDownloadButton: {
        color: '#01aff4',
        border: '1px solid #01aff4',
        display: 'flex',
        marginBottom: '1em',
        marginTop: '1.5em',
    },
    fileDownloadButtonLabel: {
        marginLeft: '0.5em',
    }
});


class TurbidimeterDetail extends SubscribedComponent {

    state = {
        dataLists: {},
        startDate: moment().subtract(1, 'year').startOf('day'),
        endDate: moment().endOf('day'),
        instruments: [],
        instrumentOne: '',
        instrumentTwo: '',
        timeseriesData: {},
        metaDataDict: {},
        isLoading: true,
        hiddenLinesDict: {}
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
                            const instruments = templateData.map(inst => {
                                return {
                                    name: inst?.data_source?.name,
                                }
                            });
                            // this.setState({
                            //     dataLists: {
                            //         ...this.state.dataLists,
                            //         [templateSourceName]: templateData
                            //     },
                            // });
                            resolve({
                                instruments,
                                dataLists: {
                                    [templateSourceName]: templateData
                                }
                            });

                        }
                    );
                });

            })
        });

        Promise.all(metadataPromises).then(values => {
            const instruments = [...new Set(values.flatMap(v => v.instruments))];
            this.setState({
                instruments,
                instrumentOne: instruments?.[0].name,
                dataLists: values.map(v => v.dataLists).reduce((acc, cur) => { return { ...acc, ...cur } }),
                isLoading: true,
            });
            this.reloadSeries();
        })

        this.loadSwitchData('turbiedad.material-particulado').then(fastFlowVariationSwitchData => {
            this.setState({
                fastFlowVariationSwitchData
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
        const promises = dataList.filter(data => {
            return [this.state.instrumentOne, this.state.instrumentTwo].includes(data?.data_source?.name);
        }).flatMap((data) => {
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
                    date_from: this.state.startDate.format(),
                    date_to: this.state.endDate.format(),
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

    generateExportProps = (title, getRowGroupLabel, getRowLabels, getColumnLabels, getCellTimeSeriesName, metaData) => {
        const canonical_name = metaData.flatMap(
            (row) => getColumnLabels(metaData)
                .map((colLabel, colIndex) => getCellTimeSeriesName(colLabel, colIndex, row))
                .filter((n) => !this.state.hiddenLinesDict[n])
        );
        return {
            canonical_name,
            dateFrom: moment(this.state.startDate).isValid() ? this.state.startDate : null,
            dateTo: moment(this.state.endDate).isValid() ? this.state.endDate : null
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

        if (prevState.startDate !== this.state.startDate ||
            prevState.endDate !== this.state.endDate) {
            const validTempDates = moment(this.state.endDate).isValid() && moment(this.state.startDate).isValid();
            if (validTempDates) {
                this.reloadSeries()
            }
        }
        if (prevState.instrumentOne !== this.state.instrumentOne ||
            prevState.instrumentTwo !== this.state.instrumentTwo) {
            this.reloadSeries()
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

    setStartDate = (date) => {
        this.setState({
            startDate: date
        })
    }

    setEndDate = (date) => {
        this.setState({
            endDate: date
        })
    }

    render() {
        const { classes, template, dataDumps, handleRequest } = this.props;
        const plotTemplates = this.props.sections;
        const turbidimeterData = Object.values(this.state.dataLists)?.[0]?.find(data => {
            return this.state.instrumentOne === (data?.data_source?.name)
        });

        const fileData = {
            coords: turbidimeterData?.data_source?.coords?.x && turbidimeterData?.data_source?.coords?.y ? `${turbidimeterData.data_source.coords.x} E ${turbidimeterData.data_source.coords.y} N` : undefined,
            location: turbidimeterData?.data_source?.meta?.location?.value,
            sector: turbidimeterData?.data_source?.group_names?.find(n => n.includes('Sector')),
            drenaje: turbidimeterData?.data_source?.meta?.drenaje?.value,
        }

        const particleAtOutletSwitchData = this.state.particleAtOutletSwitchData?.find(data => {
            return this.state
                .instrumentOne === (data?.data_source?.name)
        });

        // Variables used to get datagaps of EF Visualizations
        let dataGaps, vegaDataGaps;
        if (dataDumps){
            dataGaps = getGaps(this.state.startDate, this.state.endDate, dataDumps);
            vegaDataGaps = dataGaps.map((dg, i) => ({
                x: dg.startDate.format('YYYY-MM-DD'),
                x2: dg.endDate.format('YYYY-MM-DD'),
                name: 'dataGap-'+i
            }));
        }

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
                            <Typography variant='body1' className={classes.filtersSubtitle}>
                                Instrumento a graficar:
                            </Typography>
                            <Typography variant='body1' className={classes.filtersSubtitle}>
                                Comparar con:
                            </Typography>
                            <div className={classes.dateBox}>
                                <div className={classes.filter}>
                                    <DatePicker
                                        label="Desde"
                                        value={this.state.startDate}
                                        onChange={this.setStartDate}
                                        keyboard
                                        format='DD.MM.YYYY'
                                        maxDate={this.state.endDate}
                                    />
                                </div>
                                <div className={classes.filter}>
                                    <DatePicker
                                        label="Hasta"
                                        value={this.state.endDate}
                                        onChange={this.setEndDate}
                                        keyboard
                                        format='DD.MM.YYYY'
                                        minDate={this.state.startDate}
                                    />
                                </div>
                                <div className={[classes.instrumentSelector, classes.selector].join(' ')}>
                                    <FormControl>
                                        <InputLabel shrink id="demo-simple-select-placeholder-label-label">
                                            Instrumento
                                        </InputLabel>
                                        <Select
                                            labelId="instrument-one-label"
                                            id="instrument-one"
                                            value={this.state.instrumentOne}
                                            onChange={(event) => this.setState({ instrumentOne: event.target.value })}
                                        >
                                            {
                                                this.state.instruments?.map(instrument => {
                                                    return <MenuItem key={instrument.name} value={instrument.name}>{instrument.name}</MenuItem>
                                                })
                                            }
                                        </Select>
                                    </FormControl>
                                </div>
                            </div>
                            <div className={classes.comparisonBox}>
                                <div className={[classes.instrumentSelector, classes.selector].join(' ')}>
                                    <FormControl>
                                        <InputLabel shrink id="demo-simple-select-placeholder-label-label">
                                            Instrumento
                                        </InputLabel>
                                        <Select
                                            labelId="instrument-two-label"
                                            id="instrument-two"
                                            value={this.state.instrumentTwo}
                                            onChange={(event) => this.setState({ instrumentTwo: event.target.value })}
                                        >
                                            {
                                                this.state.instruments?.map(instrument => {
                                                    return <MenuItem key={instrument.name} value={instrument.name}>{instrument.name}</MenuItem>
                                                })
                                            }
                                        </Select>
                                    </FormControl>
                                </div>
                            </div>
                        </div>
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
                                const metaData = plotTemplate.config.makeMetadata(metaDataDict).filter(data => {
                                    return [this.state.instrumentOne, this.state.instrumentTwo].includes(data?.data_source?.name);
                                });

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
                                // const columns = plotTemplate.config.getColumnLabels(metaData);


                                let linesStyles = metaData.map((row, index) => {
                                    // color means rowGroup
                                    const color = COLORS[index % COLORS.length];

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
                                                                    xDomain={[this.state.startDate.format('YYYY-MM-DD'), this.state.endDate.format('YYYY-MM-DD')]}
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
                                    header='Se detectó material particulado a la salida del sistema de drenaje'
                                    bodyContent='Las mediciones de este instrumento indican una variación brusca de turbiedad.'
                                    // checked={true}
                                    switchProps={{
                                        checked: particleAtOutletSwitchData?.events?.[0]?.value === 1,
                                        disabled: particleAtOutletSwitchData?.events?.[0]?.value === undefined
                                    }}

                                />
                            </div>
                            <div className={classes.details__section}>
                                <div className={classes.file}>
                                    <Typography component="div" variant="body1" color="textSecondary" className={classes.fileHeader}>
                                        <Box fontWeight="fontWeightBold" >
                                            FICHA
                                        </Box>
                                    </Typography>
                                    <div className={classes.fileGrid}>
                                        {
                                            [
                                                ['Ubicación', fileData.location ?? '-'],
                                                ['Sector', fileData.sector ?? '-'],
                                                ['Coordenadas de instalación', fileData.coords ?? '-'],
                                                ['Sistema de drenaje asociado', fileData.drenaje ?? '-'],
                                            ].map(([label, value]) => {
                                                return (
                                                    <React.Fragment key={label}>
                                                        <Typography variant="body1" color="textSecondary">{label}</Typography>
                                                        <Typography component="div" variant="body1" color="textSecondary">
                                                            <Box fontWeight="fontWeightBold" >
                                                                {value}
                                                            </Box>
                                                        </Typography>
                                                    </React.Fragment>
                                                )
                                            })
                                        }
                                    </div>
                                    <Button
                                        className={classes.fileDownloadButton}
                                        disabled={this.state.isLoading}>
                                        <GetAppIcon />
                                        <span className={classes.fileDownloadButtonLabel}>FICHA TÉCNICA</span>
                                    </Button>
                                </div>
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

TurbidimeterDetail.propTypes = {
    classes: PropTypes.object.isRequired
};

export default connect(MapStateToProps, null)(withStyles(styles)(TurbidimeterDetail));

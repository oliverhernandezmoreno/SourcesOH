import React from "react";
import moment from 'moment/moment';
import { withStyles } from "@material-ui/core/styles";
import { Card, Typography } from "@material-ui/core";
import SubscribedComponent from "@app/components/utils/SubscribedComponent";
import { getEFLabel } from "@miners/components/EF/EF.labels";
import SelectableTimeseries from '@miners/containers/EF/data/EFViews/DefaultTemporalView/SelectableTimeseries.js';
import EFFilter from '@miners/containers/EF/data/EFFilters/EFFilter.js';
import AboutParameter from './DefaultTemporalView/AboutParameter'
import * as TimeseriesService from '@app/services/backend/timeseries';
import * as SiteParameterService from '@app/services/backend/siteParameter';
import { forkJoin } from 'rxjs';
import { SHAPES, COLORS, DASHES } from '@app/components/charts/VegaLegendMiniPlot.js';
import RequestsBox from '@authorities/components/target/RequestsBox';
import {getGaps} from '@app/services/backend/dumpRequest';
import DownloadSheetButton from './DownloadSheetButton';

const styles = (theme) => ({
    root: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        backgroundColor: "#303030",
    },
    header: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        margin: "30px",
        marginBottom: "0px",
    },
    title: {
        height: '100%',
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
    },
    body: {
        display: "flex",
        flexDirection: "column",
    },
    content: {
        width: '100%',
        position: 'relative'
    },
    content__timeseries: {
        backgroundColor: '#262629',
        margin: '30px',
    },
    SelectableTimeseriesButton__export: {
        color: '#01aff4',
        border: '1px solid #01aff4',
        marginLeft: '1rem'
    },
    SelectableTimeseriesButton__label: {
        marginLeft: '0.5em'
    },
});

class ExternalIntegrity extends SubscribedComponent {
    state = {
        filters: {
            startDate: moment().subtract(2, 'month').startOf('day'),
            endDate: moment().endOf('day'),
        },
        measurementsData: [],
        threshold: undefined,
        hiddenLinesDict: {},
        siteParameters: {}
    }

    setFilters = (filters) => {
        this.setState({
            filters
        })
    }

    getSiteParameters() {
        this.subscribe(
            SiteParameterService.get({v1: true}),
            data => {
                this.setState({siteParameters: data});
            }
        );
    }

    generateExportProps = (fileName, canonicalNames) => ({
        target: this.props.target,
        canonical_name: [`${this.props.target}.none.ef-mvp.m2.parameters.lluvia`],
        filename: fileName,
        dateFrom: moment(this.state.filters.startDate).isValid() ? this.state.filters.startDate : null,
        dateTo: moment(this.state.filters.endDate).isValid() ? this.state.filters.endDate : null
    });

    loadTimeseriesData = () => {

        const canonicalName = `${this.props.target}.none.ef-mvp.m2.parameters.lluvia`;

        this.setState({
            isLoading: true
        })
        this.subscribe(
            forkJoin({
                measurements: TimeseriesService.aggregation({
                    cache: 60 * 1000,  // one minute
                    target: this.props.target,
                    timeseries: canonicalName,
                    aggregation_type: 'max',
                    date_from: this.state.filters.startDate.format(),
                    date_to: this.state.filters.endDate.format(),
                    segment: false,
                }),
                rainMetadata: TimeseriesService.read({
                    cache: 60 * 1000,
                    target: this.props.target,
                    timeseries: canonicalName,
                }),
            }),
            ({ measurements, rainMetadata }) => {
                const description = [{
                    name: rainMetadata?.name,
                    description: rainMetadata?.description,
                }];
                this.setState({
                    isLoading: false,
                    description,
                });

                const measurementsData = measurements?.[0]?.map(v => ({ name: 'measurementsData', ...v }));

                this.setState(
                    {
                        measurementsData,
                        threshold: rainMetadata?.thresholds?.[0]?.upper
                    }
                );
            });


    }

    toggleSeries = (name) => {
        this.setState((state) => {
            return {
                hiddenLinesDict: {
                    ...state.hiddenLinesDict,
                    [name]: !state.hiddenLinesDict[name]
                }
            }
        })

    }

    componentDidMount = () => {
        this.loadTimeseriesData();
        this.getSiteParameters();
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (prevState.filters !== this.state.filters) {
            const validTempDates = moment(this.state.filters.endDate).isValid() && moment(this.state.filters.startDate).isValid();
            if (validTempDates) {
                this.loadTimeseriesData()
            }
        }
    }
    render = () => {
        const { classes, dataDumps, handleRequest, wikiLink } = this.props;
        const title = getEFLabel(this.props.template);

        /** Fake data to be replaced */
        const instruments = [
            {
                name: 'instrument1',
                label: '[ID Instrumento 1]'
            },
            {
                name: 'instrument2',
                label: '[ID Instrumento 2]'
            },
            {
                name: 'instrument3',
                label: '[ID Instrumento 3]'
            },
        ];

        const metaData = [
            [
                { name: 'measurementsData' },
            ],
            [
                { name: 'threshold' },
            ],
            [{}],
            ...instruments.map(i => [i])
        ];
        const barsData = this.state.measurementsData;

        const horizontalLinesData = [
            { name: 'threshold', value: this.state.threshold, colIndex: 0 }
        ];

        const columns = ['', ''];

        const myLinesStyles = [
            [
                {
                    color: COLORS[0],
                    markType: 'bar',
                    name: 'measurementsData'
                },
                {
                    labelOnly: true,
                    Container: ({ children, ...props }) => <div {...props}>{children}</div>
                }
            ],
            [
                {
                    color: COLORS[0],
                    shape: SHAPES[0],
                    filled: true,
                    dash: DASHES[0],
                    name: 'threshold'
                },
                {
                    labelOnly: true,
                    Container: ({ children, ...props }) => <div {...props}>{children}</div>
                }
            ],
            [
                {
                    labelOnly: true,
                    Container: () => <div style={{ height: '0.5em' }}></div>
                },
                {
                    labelOnly: true,
                    Container: () => <div style={{ height: '0.5em' }}></div>
                },
            ],
            ...instruments.map((instrument, index) => {
                return [
                    {
                        color: COLORS[index + 1],
                        markType: 'bar',
                        name: instrument.name
                    },
                    {
                        labelOnly: true,
                        Container: ({ children, ...props }) => {
                            return <DownloadSheetButton
                                target={props.target}
                                dataSource={instrument/*it must be a datasource object*/}
                            />
                        }
                    }
                ]
            })

        ];
        const linesStylesModifier = (linesStyles) => {
            return myLinesStyles;
        };

        const labels = ['Intensidad de lluvia promedio de la cuenca', 'Umbral 1', '', ...instruments.map(i => i.label)];


        const getRowGroupLabel = (row, index) => {
            return labels[index];
        }

        const getCellTimeSeriesName = (colName, colIndex, row) => {
            return colIndex === 0 ? row[colIndex].name : '';
        }

        const getRowLabels = () => {
            return ['', ''];
        }

        // Variables used to get datagaps of EF Visualizations
        let dataGaps, vegaDataGaps;
        if (dataDumps) {
            dataGaps = getGaps(this.state.filters.startDate, this.state.filters.endDate, dataDumps);
            vegaDataGaps = dataGaps.map((dg, i) => ({
                x: dg.startDate.format('YYYY-MM-DD'),
                x2: dg.endDate.format('YYYY-MM-DD'),
                name: 'dataGap-' + i
            }));
        }

        return (
            <Card className={classes.root}>
                <div className={classes.header}>
                    <div className={classes.title}>
                        <Typography variant="h5">{title}</Typography>
                        <AboutParameter description={this.state.description} wikiLink={this.state.siteParameters[wikiLink]}></AboutParameter>
                    </div>
                    <EFFilter
                        filterType={'DATE_RANGE'}
                        filters={this.state.filters}
                        setFilters={this.setFilters}
                    />
                    {dataDumps ? 
                        <RequestsBox 
                            dataDumps={dataDumps}
                            dataGaps={dataGaps}
                            handleRequest={handleRequest} /> 
                        : null
                    }
                </div>
                <div className={classes.content}>
                    <Card className={classes.content__timeseries}>
                        <SelectableTimeseries
                            title={"Intensidad de lluvia"}
                            // timeseriesData={timeseriesData}
                            barsData={barsData}
                            horizontalLinesData={horizontalLinesData}
                            gapsData={vegaDataGaps}
                            metaData={metaData}
                            isTemporal={true}
                            getColumnLabels={() => columns}
                            getCellTimeSeriesName={getCellTimeSeriesName}
                            getRowGroupLabel={getRowGroupLabel}
                            getRowLabels={getRowLabels}
                            hiddenLinesDict={this.state.hiddenLinesDict}
                            toggleSeries={this.toggleSeries}
                            linesStylesModifier={linesStylesModifier}
                            exportProps={this.generateExportProps()}
                            isLoading={this.state.isLoading}
                            xDomain={[this.state.filters.startDate.format('YYYY-MM-DD'), this.state.filters.endDate.format('YYYY-MM-DD')]}
                        />
                    </Card>
                </div>
            </Card>
        );
    };
}

export default withStyles(styles)(ExternalIntegrity);

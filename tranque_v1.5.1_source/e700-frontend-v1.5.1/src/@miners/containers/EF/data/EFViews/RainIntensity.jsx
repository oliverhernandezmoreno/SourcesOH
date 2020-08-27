import React from "react";
import moment from 'moment/moment';
import { withStyles } from "@material-ui/core/styles";
import { Card, Typography } from "@material-ui/core";
import SubscribedComponent from "@app/components/utils/SubscribedComponent";
import { getEFLabel } from "@miners/components/EF/EF.labels";
import SelectableTimeseries from '@miners/containers/EF/data/EFViews/DefaultTemporalView/SelectableTimeseries.js';
import EFFilter from '@miners/containers/EF/data/EFFilters/EFFilter.js';
import * as TimeseriesService from '@app/services/backend/timeseries';
import { forkJoin } from 'rxjs';
import { SHAPES, COLORS, DASHES } from '@app/components/charts/VegaLegendMiniPlot.js';
import Button from '@material-ui/core/Button';
import GetAppIcon from '@material-ui/icons/GetApp';

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
        width: "100%",
        margin: "30px",
        marginBottom: "0px",
    },
    title: {
        width: "50%",
        height: "100%",
        display: "inline-block",
        position: "relative",
        marginBottom: "2rem",
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
        hiddenLinesDict: {}
    }

    setFilters = (filters) => {
        this.setState({
            filters
        })
    }


    generateExportProps = (fileName, canonicalNames) => ({
    target: this.props.target,
    canonical_name: canonicalNames,
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
                }),
                rainMetadata: TimeseriesService.read({
                    cache: 60 * 1000,
                    target: this.props.target,
                    timeseries: canonicalName,
                }),
            }),
            ({ measurements, rainMetadata }) => {

                this.setState({
                    isLoading: false
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
        const { classes } = this.props;
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
                            return (
                                <Button className={classes.SelectableTimeseriesButton__export} onClick={() => 'coming soon'} disabled={false}>
                                    <GetAppIcon />
                                    <span className={classes.SelectableTimeseriesButton__label}>Ficha técnica</span>
                                </Button>
                            )
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

        return (
            <Card className={classes.root}>
                <div className={classes.header}>
                    <div className={classes.title}>
                        <Typography variant="h5">{title}</Typography>
                    </div>
                    <EFFilter
                        filterType={'DATE_RANGE'}
                        filters={this.state.filters}
                        setFilters={this.setFilters}
                    />
                </div>
                <div className={classes.content}>
                    <Card className={classes.content__timeseries}>
                        <SelectableTimeseries
                            title={"Intensidad de lluvia"}
                            // timeseriesData={timeseriesData}
                            barsData={barsData}
                            horizontalLinesData={horizontalLinesData}
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
                        />
                    </Card>
                </div>
            </Card>
        );
    };
}

export default withStyles(styles)(ExternalIntegrity);

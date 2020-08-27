import React from "react";
import moment from 'moment/moment';
import { withStyles } from "@material-ui/core/styles";
import { Card, Typography } from "@material-ui/core";
import SubscribedComponent from "@app/components/utils/SubscribedComponent";
import { getEFLabel } from "@miners/components/EF/EF.labels";
import SelectableTimeseries from '@miners/containers/EF/data/EFViews/DefaultTemporalView/SelectableTimeseries.js';
import EFFilter from '@miners/containers/EF/data/EFFilters/EFFilter.js';
import * as TimeseriesService from '@app/services/backend/timeseries';
import * as SiteParameterService from '@app/services/backend/siteParameter';
import AboutParameter from '../DefaultTemporalView/AboutParameter'
import { forkJoin, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import RequestsBox from '@authorities/components/target/RequestsBox';
import { getGaps } from '@app/services/backend/dumpRequest';

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
});

class ExternalIntegrity extends SubscribedComponent {
    state = {
        filters: {
            startDate: moment().subtract(2, 'month').startOf('day'),
            endDate: moment().endOf('day'),
        },
        hiddenLinesDict: {},
        measurementsData: [],
        measurementsMetadata: [],
        siteParameters: {},
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

    generateExportProps = () => ({
        target: this.props.target,
        filename: 'Porcentaje_de_finos.xlsx',
        canonical_name: this.state.measurementsMetadata.map(row => row.canonical_name),
        dateFrom: moment(this.state.filters.startDate).isValid() ? this.state.filters.startDate : null,
        dateTo: moment(this.state.filters.endDate).isValid() ? this.state.filters.endDate : null
    })

    loadTimeseriesData = () => {

        const templateName = `ef-mvp.m2.parameters.porcentaje-finos`;

        this.setState({
            isLoading: true
        })
        const listRequest = TimeseriesService.list({
            cache: 60 * 1000,  // one minute
            target: this.props.target,
            template_name: templateName,
            max_events: 1
        });


        this.subscribe(
            listRequest.pipe(
                mergeMap(tsList => {
                    return forkJoin({
                        measurementsMetadata: of(tsList),
                        measurements: forkJoin(
                            tsList.map(ts => {
                                return TimeseriesService.aggregation({
                                    cache: 60 * 1000,  // one minute
                                    target: this.props.target,
                                    timeseries: ts.canonical_name,
                                    aggregation_type: 'sample',
                                    interval: '1D',
                                    date_from: this.state.filters.startDate.format(),
                                    date_to: this.state.filters.endDate.format(),
                                    segment: false,
                                })
                            })
                        )
                    })
                })
            )
            ,
            ({ measurements, measurementsMetadata }) => {
                const descriptionLists = [measurementsMetadata?.[0]];
                const description = descriptionLists.map(el => {
                    const  obj = el;
                    return obj?.name ? {name: obj?.name, description: obj?.description } : {};
                }).filter(el => el.description !== undefined);
                const measurementsData = measurements.reduce((prevDict, measurement, index) => {
                    const name = measurementsMetadata[index].canonical_name;
                    const data = [{ label: ' ', data: measurement?.[0]?.map(v => [v]) }];
                    prevDict[name] = data;
                    return prevDict;
                }, {})

                this.setState({
                    measurementsData,
                    measurementsMetadata: measurementsMetadata,
                    isLoading: false,
                    description,
                })
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

        const metaData = this.state.measurementsMetadata;
        const timeseriesData = this.state.measurementsData;
        const horizontalLinesData = metaData.map(row => ({
            name: `${row.canonical_name}-umbral`,
            value: row?.thresholds?.[0]?.upper
        }));

        const getColumnLabels = () => ['Medición', 'Umbral'];
        const getCellTimeSeriesName = (colName, colIndex, row) => {
            if (colIndex === 0) {
                return row.canonical_name;
            }
            return `${row.canonical_name}-umbral`;
        }
        const getRowGroupLabel = (row) => row.data_source_group.name;


        const linesStylesModifier = (matrix) => {
            return matrix.map((row) => {
                return row.map((style, colIndex) => {
                    if (colIndex === 0) {
                        return {
                            ...style,
                            dash: [0, 1]
                        }
                    }
                    return {
                        ...style,
                        dash: [1, 0],
                        filled: true,
                        shape: 'none'
                    };
                })
            })
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
                            title={"Porcentaje de finos"}
                            timeseriesData={timeseriesData}
                            horizontalLinesData={horizontalLinesData}
                            gapsData={vegaDataGaps}
                            metaData={metaData}
                            isTemporal={true}
                            getColumnLabels={getColumnLabels}
                            getCellTimeSeriesName={getCellTimeSeriesName}
                            getRowGroupLabel={getRowGroupLabel}
                            // getRowLabels={getRowLabels}
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

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
import * as ParameterService from '@app/services/backend/parameter';
import * as SiteParameterService from '@app/services/backend/siteParameter';
import { forkJoin } from 'rxjs';
import RequestsBox from '@authorities/components/target/RequestsBox';
import {getGaps} from '@app/services/backend/dumpRequest';

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
            startDate: moment().subtract(2, 'year').startOf('day'),
            endDate: moment().endOf('day'),
        },
        measurementsData: [],
        upperBandData: [],
        lowerBandData: [],
        maxTonnage: undefined,
        hiddenLinesDict: {},
        siteParameters: {}
    }

    setFilters = (filters) => {
        this.setState({
            filters
        })
    }


    loadTimeseriesData = () => {

        const measurementsCanonicalName = `${this.props.target}.none.ef-mvp.m2.parameters.tonelaje`;
        const errorHalfWidthCanonicalName = `error-permitido-tonelaje-plan-depositacion-proyecto`;


        this.subscribe(
            forkJoin({
                measurements: TimeseriesService.aggregation({
                    cache: 60 * 1000,  // one minute
                    target: this.props.target,
                    timeseries: measurementsCanonicalName,
                    aggregation_type: 'max',
                    interval: '1D',
                    date_from: this.state.filters.startDate.format(),
                    date_to: this.state.filters.endDate.format(),
                    segment: false,
                }),
                errorHalfWidth: ParameterService.read({
                    cache: 60 * 1000,  // one minute
                    target: this.props.target,
                    id: errorHalfWidthCanonicalName,
                }),
                maxTonnage: TimeseriesService.read({
                    cache: 60 * 1000,
                    target: this.props.target,
                    timeseries: measurementsCanonicalName,
                }),
            }),
            ({ measurements, errorHalfWidth, maxTonnage }) => {
                const description = [{
                    name: maxTonnage?.name,
                    description: maxTonnage?.description,
                }];

                const measurementsData = [{ label: ' ', data: measurements?.[0]?.map(v => [v]) }];
                const upperBandData = isNaN(parseFloat(errorHalfWidth?.value)) ? undefined : [
                    {
                        label: ' ',
                        data: measurements?.[0]?.map(v => [{
                            x: v.x,
                            y: v.y + parseFloat(errorHalfWidth?.value)
                        }])
                    }
                ];

                const lowerBandData = isNaN(parseFloat(errorHalfWidth?.value)) ? undefined : [
                    {
                        label: ' ',
                        data: measurements?.[0]?.map(v => [{
                            x: v.x,
                            y: v.y - parseFloat(errorHalfWidth?.value)
                        }])
                    }
                ];
                this.setState(
                    {
                        measurementsData,
                        upperBandData,
                        lowerBandData,
                        maxTonnage: maxTonnage?.thresholds?.[0]?.upper,
                        description,
                    }
                );
            });


    }

    toggleSeries = (name) => {
        if (name === 'measurementsData') return;
        this.setState((state) => {
            return {
                hiddenLinesDict: {
                    ...state.hiddenLinesDict,
                    [name]: !state.hiddenLinesDict[name]
                }
            }
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

    generateExportProps = (getColumnLabels, getCellTimeSeriesName, metaData) => {
        const canonical_name = metaData.flatMap(
            (row) => getColumnLabels(metaData)
                .map((colLabel, colIndex) => row[colIndex].canonical_name)
                .filter((n) => !this.state.hiddenLinesDict[n])
        );
        return {
            target: this.props.target,
            canonical_name: canonical_name,
            dateFrom: moment(this.state.filters.startDate).isValid() ? this.state.filters.startDate : null,
            dateTo: moment(this.state.filters.endDate).isValid() ? this.state.filters.endDate : null
        }
    }

    render = () => {
        const { classes, dataDumps, handleRequest, wikiLink } = this.props;
        const title = getEFLabel(this.props.template);
        const measurementsCanonicalName = `${this.props.target}.none.ef-mvp.m2.parameters.tonelaje`;
        const errorHalfWidthCanonicalName = `error-permitido-tonelaje-plan-depositacion-proyecto`;

        const metaData = [
            [
                { 
                    name: 'measurementsData', 
                    canonical_name: measurementsCanonicalName,
                }, { 
                    name: 'upperBandData',
                    canonical_name: errorHalfWidthCanonicalName,
                }, { 
                    name: 'lowerBandData',
                    canonical_name: errorHalfWidthCanonicalName,
                }, { name: 'maxTonnage' }
            ]
        ];
        const timeseriesData = metaData[0].reduce((prevDict, data) => {
            if (data.name === 'maxTonnage') return prevDict;
            prevDict[data.name] = this.state[data.name];
            return prevDict;
        }, {});


        const horizontalLinesData = [
            { name: 'maxTonnage', value: this.state.maxTonnage, colIndex: 0 }
        ];

        const getColumnLabels = () => ['Medición', 'Umbral superior', 'Umbral inferior', 'Máximo'];
        const getCellTimeSeriesName = (colName, colIndex, row) => row[colIndex].name;

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
                            title={"Tonelaje acumulado"}
                            timeseriesData={timeseriesData}
                            horizontalLinesData={horizontalLinesData}
                            gapsData={vegaDataGaps}
                            metaData={metaData}
                            isTemporal={true}
                            getColumnLabels={getColumnLabels}
                            getCellTimeSeriesName={getCellTimeSeriesName}
                            hiddenLinesDict={this.state.hiddenLinesDict}
                            toggleSeries={this.toggleSeries}
                            exportProps={this.generateExportProps(
                                getColumnLabels,
                                getCellTimeSeriesName,
                                metaData
                            )}
                            xDomain={[this.state.filters.startDate.format('YYYY-MM-DD'), this.state.filters.endDate.format('YYYY-MM-DD')]}
                        // handleDownload={() => this.handleDownload(
                        //     plotTemplate.title,
                        //     plotTemplate.config.getRowGroupLabel,
                        //     plotTemplate.config.getRowLabels,
                        //     plotTemplate.config.getColumnLabels,
                        //     plotTemplate.config.getCellTimeSeriesName,
                        //     metaData
                        // )}
                        // getRowGroupLabel={plotTemplate.config.getRowGroupLabel}
                        // getRowLabels={plotTemplate.config.getRowLabels}
                        // linesStylesModifier={plotTemplate.config.linesStylesModifier}
                        // isLoading={this.state.isLoading}
                        />
                    </Card>
                </div>
            </Card>
        );
    };
}

export default withStyles(styles)(ExternalIntegrity);

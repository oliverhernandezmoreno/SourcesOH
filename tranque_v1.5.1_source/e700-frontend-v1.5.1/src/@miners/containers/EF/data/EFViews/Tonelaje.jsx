import React from "react";
import moment from 'moment/moment';
import { withStyles } from "@material-ui/core/styles";
import { Card, Typography } from "@material-ui/core";
import SubscribedComponent from "@app/components/utils/SubscribedComponent";
import { getEFLabel } from "@miners/components/EF/EF.labels";
import SelectableTimeseries from '@miners/containers/EF/data/EFViews/DefaultTemporalView/SelectableTimeseries.js';
import EFFilter from '@miners/containers/EF/data/EFFilters/EFFilter.js';
import * as TimeseriesService from '@app/services/backend/timeseries';
import * as ParameterService from '@app/services/backend/parameter';
import { forkJoin } from 'rxjs';

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
        hiddenLinesDict: {}
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
                        maxTonnage: maxTonnage?.thresholds?.[0]?.upper
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

        const metaData = [
            [{ name: 'measurementsData' }, { name: 'upperBandData' }, { name: 'lowerBandData' }, { name: 'maxTonnage' }]
        ];
        const timeseriesData = metaData[0].reduce((prevDict, data) => {
            if (data.name === 'maxTonnage') return prevDict;
            prevDict[data.name] = this.state[data.name];
            return prevDict;
        }, {});


        const horizontalLinesData = [
            { name: 'maxTonnage', value: this.state.maxTonnage, colIndex: 0 }
        ];

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
                            title={"Tonelaje acumulado"}
                            timeseriesData={timeseriesData}
                            horizontalLinesData={horizontalLinesData}
                            metaData={metaData}
                            isTemporal={true}
                            getColumnLabels={() => ['Medición', 'Umbral superior', 'Umbral inferior', 'Máximo']}
                            getCellTimeSeriesName={(colName, colIndex, row) => row[colIndex].name}
                            hiddenLinesDict={this.state.hiddenLinesDict}
                            toggleSeries={this.toggleSeries}

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

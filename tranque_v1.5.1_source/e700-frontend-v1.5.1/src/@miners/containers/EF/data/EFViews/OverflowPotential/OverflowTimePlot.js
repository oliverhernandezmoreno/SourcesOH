import React from "react";
import moment from 'moment/moment';
import { withStyles } from "@material-ui/core/styles";
import SubscribedComponent from "@app/components/utils/SubscribedComponent";
import SelectableTimeseries from '@miners/containers/EF/data/EFViews/DefaultTemporalView/SelectableTimeseries.js';
import * as TimeseriesService from '@app/services/backend/timeseries';
import { forkJoin } from 'rxjs';
import { COLORS } from '@app/components/charts/VegaLegendMiniPlot.js';

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

class OverflowTimePlot extends SubscribedComponent {
    state = {
        overflowTimeData: [],
        hiddenLinesDict: {},
        thresholdData: undefined,
        overflowTimeUnits: {},
        isLoading: false
    }

    loadTimeseriesData = () => {


        // Potencial de rebalse: {target}.none.ef-mvp.m2.parameters.potencial-rebalse. /list > [0] o /read con {target}.none.{asdf}
        // Umbral 1: .thresholds ??
        // Umbral 2: .thresholds ??
        // Intensidad de lluvia: {target}.none.ef-mvp.m2.parameters.lluvia en .events
        // Intensidad de lluvia promedio: Promedio en el frontend de ef-mvp.m2.parameters.lluvia anterior.
        this.setState({
            isLoading: true
        })

        const overflowPotentialCanonicalName = `${this.props.target}.none.ef-mvp.m2.parameters.potencial-rebalse.tiempo-rebalse`;
        const overflowPotentialTemplateName = `ef-mvp.m2.parameters.potencial-rebalse.tiempo-rebalse`;

        this.subscribe(
            forkJoin({
                overflowPotential: TimeseriesService.aggregation({
                    cache: 60 * 1000,  // one minute
                    target: this.props.target,
                    timeseries: overflowPotentialCanonicalName,
                    aggregation_type: 'max',
                    interval: '1D',
                    date_from: this.props.filters.startDate.format(),
                    date_to: this.props.filters.endDate.format(),
                }),
                overflowPotentialList: TimeseriesService.list({
                    cache: 60 * 1000,  // one minute
                    target: this.props.target,
                    template_name: overflowPotentialTemplateName,
                    max_events: 1
                }),
            }),
            ({ overflowPotential, overflowPotentialList, }) => {

                const overflowTimeData = [{ label: ' ', data: overflowPotential?.[0]?.map(v => [v]) }];
                const thresholdData = overflowPotentialList?.[0]?.thresholds?.[0].lower;
                this.setState(
                    {
                        overflowTimeData,
                        thresholdData,
                        overflowTimeUnits: overflowPotentialList?.[0]?.unit,
                        isLoading: false,
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
        if (prevProps.filters !== this.props.filters) {
            const validTempDates = moment(this.props.filters.endDate).isValid() && moment(this.props.filters.startDate).isValid();
            if (validTempDates) {
                this.loadTimeseriesData()
            }
        }
    }
    render = () => {

        const metaData = [
            [{ name: 'overflowTimeData', unit: this.state.overflowTimeUnits }, { name: 'Umbral' }]
        ];
        const timeseriesData = {
            overflowTimeData: this.state.overflowTimeData
        }

        const horizontalLinesData = [
            { name: 'Umbral', value: this.state.thresholdData, colIndex: 1 }
        ];

        const getColumnLabels = () => ["Tiempo de rebalse", "Umbral"]

        const linesStylesModifier = (linesStyles) => linesStyles.map(row => row.map(style => {
            if (style.name === 'Umbral') {
                return {
                    ...style,
                    color: COLORS[1],
                }
            }
            return style;
        }));


        return (
            //     <div className={classes.content}>
            //         <Card className={classes.content__timeseries}>
            <SelectableTimeseries
                title={"Tiempo de rebalse"}
                metaData={metaData}
                timeseriesData={timeseriesData}
                isTemporal={true}
                getColumnLabels={getColumnLabels}
                getCellTimeSeriesName={(colName, colIndex, row) => row[colIndex].name}
                toggleSeries={this.toggleSeries}
                hiddenLinesDict={this.state.hiddenLinesDict}
                linesStylesModifier={linesStylesModifier}
                horizontalLinesData={horizontalLinesData}
                isLoading={this.state.isLoading}

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
            //     </Card>
            // </div>
        );
    };
}

export default withStyles(styles)(OverflowTimePlot);

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

class OverflowPotentialPlot extends SubscribedComponent {
    state = {
        overflowPotentialData: [],
        rainIntensityData: [],
        hiddenLinesDict: {},
        overflowPotentialUnits: {},
        rainIntensityUnits: {},
        overflowPotentialThresholds: [],
        isLoading: false
    }

    loadTimeseriesData = () => {

        this.setState({
            isLoading: true
        });

        const overflowPotentialTemplateName = 'ef-mvp.m2.parameters.potencial-rebalse';
        const overflowPotentialCanonicalName = `${this.props.target}.none.${overflowPotentialTemplateName}`;
        const rainIntensityTemplateName = 'ef-mvp.m2.parameters.lluvia';
        const rainIntensityCanonicalName = `${this.props.target}.none.${rainIntensityTemplateName}`;

        this.subscribe(
            forkJoin({

                overflowPotential: TimeseriesService.aggregation({
                    cache: 10,  // one minute
                    target: this.props.target,
                    timeseries: overflowPotentialCanonicalName,
                    aggregation_type: 'max',
                    date_from: this.props.filters.startDate.format(),
                    date_to: this.props.filters.endDate.format(),
                }),
                rainIntensity: TimeseriesService.aggregation({
                    cache: 10,  // one minute
                    target: this.props.target,
                    timeseries: rainIntensityCanonicalName,
                    aggregation_type: 'max',
                    date_from: this.props.filters.startDate.format(),
                    date_to: this.props.filters.endDate.format(),
                }),
                overflowPotentialList: TimeseriesService.list({
                    cache: 10,  // one minute
                    target: this.props.target,
                    template_name: overflowPotentialTemplateName,
                    max_events: 1
                }),
                rainIntensityList: TimeseriesService.list({
                    cache: 10,  // one minute
                    target: this.props.target,
                    template_name: rainIntensityTemplateName,
                    max_events: 1
                }),

            }),
            ({ overflowPotential, rainIntensity, overflowPotentialList, rainIntensityList }) => {


                const overflowPotentialData = [{ label: ' ', data: overflowPotential?.[0]?.map(v => [v]) }];
                const rainIntensityData = rainIntensity?.[0]?.map(v => ({
                    name: 'rainIntensityData',
                    x: v.x,
                    y: v.y
                })) ?? [];
                const overflowPotentialThresholds = overflowPotentialList?.[0]?.thresholds?.map(t => t?.upper);

                const averageRainfall = rainIntensityData.reduce((acc, cur) => acc + cur.y ?? 0, 0) / (rainIntensityData.length || 1);
                this.setState(
                    {
                        overflowPotentialData,
                        rainIntensityData,
                        averageRainfall,
                        overflowPotentialUnits: overflowPotentialList?.[0]?.unit,
                        rainIntensityUnits: rainIntensityList?.[0]?.unit,
                        isLoading: false,
                        overflowPotentialThresholds
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
            [
                { name: 'overflowPotentialData', unit: this.state.overflowPotentialUnits },
                ...this.state.overflowPotentialThresholds.map((t, index) => ({ name: `overflowPotentialThreshold-${index}` })),
                { name: 'rainIntensityData', unit: this.state.rainIntensityUnits },
                { name: 'averageRainfall', unit: this.state.rainIntensityUnits }
            ]
        ];
        const timeseriesData = {
            overflowPotentialData: this.state.overflowPotentialData
        }

        const horizontalLinesData = this.state.overflowPotentialThresholds.map((t, index) => ({
            name: `overflowPotentialThreshold-${index}`,
            value: t
        }))


        const rightHorizontalLinesData = [
            { name: 'averageRainfall', value: this.state.averageRainfall, colIndex: 2 },

        ];

        const getColumnLabels = () => [
            "Potencial de rebalse",
            ...this.state.overflowPotentialThresholds.map((t, index) => `Umbral ${index + 1}`),
            "Intensidad de lluvia",
            "Lluvia promedio"]

        const linesStylesModifier = (linesStyles) => linesStyles.map(row => row.map(style => {
            const color = ['rainIntensityData', 'averageRainfall'].includes(style.name) ?
                COLORS[1] : COLORS[0];
            if (style.name === 'rainIntensityData') {
                return {
                    ...style,
                    markType: 'bar',
                    color: color,
                }
            }
            return {
                ...style,
                color,
            };
        }))

        return (
            //     <div className={classes.content}>
            //         <Card className={classes.content__timeseries}>
            <SelectableTimeseries
                title={"Potencial de rebalse"}
                metaData={metaData}
                timeseriesData={timeseriesData}
                horizontalLinesData={horizontalLinesData}
                isTemporal={true}
                getColumnLabels={getColumnLabels}
                getCellTimeSeriesName={(colName, colIndex, row) => row[colIndex].name}
                toggleSeries={this.toggleSeries}
                hiddenLinesDict={this.state.hiddenLinesDict}
                linesStylesModifier={linesStylesModifier}
                rightAxisData={{
                    barsData: this.state.rainIntensityData,
                    horizontalLinesData: rightHorizontalLinesData,
                }}
                yRightAxisTitle='Intensidad de lluvia'
                yRightAxisUnits={this.state.rainIntensityUnits?.abbreviation ?? ''}
                isLoading={this.state.isLoading}
                exportProps={(() => {
                    const overflowPotentialTemplateName = 'ef-mvp.m2.parameters.potencial-rebalse';
                    const overflowPotentialCanonicalName = `${this.props.target}.none.${overflowPotentialTemplateName}`;
                    const rainIntensityTemplateName = 'ef-mvp.m2.parameters.lluvia';
                    const rainIntensityCanonicalName = `${this.props.target}.none.${rainIntensityTemplateName}`;

                    return {
                        target: this.props.target,
                        filename: 'Potencial_de_rebalse.xlsx',
                        canonical_name: [overflowPotentialCanonicalName, rainIntensityCanonicalName],
                        dateFrom: moment(this.props.filters.startDate).isValid() ? this.props.filters.startDate : null,
                        dateTo: moment(this.props.filters.endDate).isValid() ? this.props.filters.endDate : null
                    };
                })()}

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

export default withStyles(styles)(OverflowPotentialPlot);

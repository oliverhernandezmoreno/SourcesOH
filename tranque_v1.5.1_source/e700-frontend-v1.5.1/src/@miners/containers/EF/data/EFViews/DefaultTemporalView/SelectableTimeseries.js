import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/core/styles';
import VegaTimeseriesChart from '@app/components/charts/VegaTimeseriesChart';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import CardGraphicSelector from './CardGraphicSelector';
import { SHAPES, COLORS, DASHES } from '@app/components/charts/VegaLegendMiniPlot';
import ButtonExport from '@miners/components/utils/ButtonExport';

const styles = theme => ({
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

const MAX_POINT_MARKS_PER_LINE = 50;
class SelectableTimeseries extends SubscribedComponent {
    constructor(props) {
        super(props);

        this.state = {
            hiddenLinesDict: {},
            linesStylesDict: {},
            unit: undefined
        };
    }

    static defaultProps = {
        getCellTimeSeriesName: (column_name, col_index, row) => { },
        timeseriesData: {},
        metaData: [],
        getRowGroupLabel: (row) => { },
        getColumnLabels: (metaData) => [],
        title: '',
        handleDownload: () => { },
        isTemporal: true,
        horizontalLinesData: [],
        verticalLinesData: [],
        barsData: [],
        getRowLabels: (row) => [],
        linesStylesModifier: (linesStyles) => linesStyles,
        otherLinesStyles: [],
        hiddenLinesDict: {},
        rightAxisData: {},
        xScale: undefined
    }

    static propTypes = {
        /**
         * Dict with time series data as it comes from the backend.
         * Each key to be plotted must match name for the "lineStyles"
         * It is expected of data rows to be located at:
         * dict[key][0].data
         */
        timeseriesData: PropTypes.array,

        /**
         * Array of {name, value} fields of horizontal lines to be
         * plotted.
         */
        horizontalLinesData: PropTypes.array,

        verticalLinesData: PropTypes.array,

        /**
         * Array of {name, x, y} fields of bars to be plotted.
         */
        barsData: PropTypes.array,

        /**
         * Dictionary with {timeseriesData, horizontalLinesData,
         * barsData} to be plotted using the axis on the right side of
         * the plot.
         */
        rightAxisData: PropTypes.object,

        /**
         * Array whose elements represent rows of the interactive
         * table-legend and from where each cell in the table is built
         * using other callbacks.
         */
        metaData: PropTypes.array,

        /**
         * Callback with signature (metaData)=>['col label1', ...]
         * where metaData is props.metaData and returns an array of
         * labels to put over each column. If a column name is null,
         * the entire column is not displayed.
         */
        getColumnLabels: PropTypes.func,

        /**
         * Callback to asign a unique identifier between a current
         * cell and a its timeseries.
         *
         * It will receive the following params: (column_name,
         * col_index, row) column_name: name provided by the
         * getColumnLabels col_index: index of the column this cell
         * belongs to. Extracted from getColumLabels row: row
         * (element) of the metaData list for this cell. */
        getCellTimeSeriesName: PropTypes.func,


        /**
         * Dictionary whose keys must match a "name" of
         * props.getCellTimeseriesName with boolean values to tell if
         * a line is hidden (not plotted) or not.
         */
        hiddenLinesDict: PropTypes.object,


        /**
         * Callback with signature (row) => rowGrouplabel, where each
         * row is taken from props.metaData and returns a string that
         * is used to label rows on the left side outside of the
         * table.
         */
        getRowGroupLabel: PropTypes.func,

        /**
         * Callback with signature (row) => ['row_cell1_label',
         * 'row_cell2_label', ...]  Receives a row from metaData and
         * returns a list of labels to be put on each cell of that
         * row.
         */
        getRowLabels: PropTypes.func,

        /**
         * Props to forward to the "DATOS" export button.
         */
        exportProps: PropTypes.object,

        /**
         * Indicates whether the plot x-axis is temporal (true) or
         * quantitative (false)
         */
        isTemporal: true,

        /**
         * String to be used as title shown outside of the plot and on
         * the Y-axis if no yAxisTitle is provided.
         */
        title: PropTypes.string,

        /**
         * String to be used as title of the Y-axis.
         */
        yAxisTitle: PropTypes.string,

        /**
         * Callback that receives a matrix (array of arrays)
         * containing the configuration of styles of each line in the
         * table/plot.  This matrix has same rows number as the
         * metaData and same column number as the length of the
         * returned array of getColumnLabels.
         *
         * Each element (cell) contains a dict of
         * { color, shape, filled, dash, name}
         * - color, shape, dash are normally obtained from
         *   src/@app/components/charts/VegaLegendMiniPlot.js constants.
         * - filled can be true or false
         * - name is the identifier of a cell and must correspond to a
         *   key in the timeseriesData dictionary
         *
         * The default encoding is:
         * - same color for same rowGroup
         * - same shape for items on the same row
         * - first column point marks are filled (true); others are
         *   empty (false)
         * - first and second column are continuous; others have
         *   different discontinuous dash patterns
         */
        linesStylesModifier: PropTypes.func,

        /**
         * Array with additional linesStyles of lines that are not
         * rendered in the table
         */
        otherLinesStyles: PropTypes.array,

        /**
         * String to be used as title for the right-side y-axis.
         */
        yRightAxisTitle: PropTypes.string,

        /**
         * String to attach to the right y axis title between brackets
         * to display units
         */
        yRightAxisUnits: PropTypes.string,

        /**
         * Scale object for the x axis
         */
        xScale: PropTypes.object
    }

    componentDidMount() {

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
            .filter(name => !this.props.hiddenLinesDict?.[name])
            .flatMap((canonical_name) => {
                const series = data?.[canonical_name];
                const normalized = (series ?? []).flatMap(
                    (set) => (set?.data ?? []).flatMap(
                        (segment) => segment.map((v) => ({...v, name: canonical_name}))
                    )
                );
                maxLength = Math.max(normalized.length, 2, maxLength);
                return normalized;
            })
            .map((v, index) => ({...v, index}));
        // const skipPointsEvery = minLength/MIN_POINT_MARKS_PER_LINE;
        const skipPointsEvery = Math.ceil(maxLength / MAX_POINT_MARKS_PER_LINE);
        return [hiddenLineData, skipPointsEvery];
    }

    hideHorizontalData = (data, names) => {

        return data
            .filter(({ name }) => !this.props.hiddenLinesDict?.[name])
    }

    hideBarsData = (data) => {
        const processedData = data.filter(({ name }) => !this.props.hiddenLinesDict?.[name])
        return processedData;
    }

    hideData = (timeseriesData, horizontalLinesData, barsData, names) => {
        const [hiddenLinesData, skipPointsEvery] = this.hideLineData(timeseriesData, names);
        const hiddenHorizontalLinesData = this.hideHorizontalData(horizontalLinesData, names)
        const hiddenBarsData = this.hideBarsData(barsData);

        return [[hiddenLinesData, skipPointsEvery], hiddenHorizontalLinesData, hiddenBarsData];
    }

    getAvailable = (timeseriesData, horizontalLinesData, barsData) => {
        const availableHorizontal = horizontalLinesData.map(data => data.name);
        const availableBars = barsData.map(data => data.name);
        const availableTimeSeries = new Set(Object.entries(timeseriesData).map(([key, data]) => {
            return data?.[0]?.data?.length > 0 ? key : null
        }));
        return [...availableHorizontal, ...availableTimeSeries, ...availableBars];
    }

    render() {
        const { classes } = this.props;


        /**Build lineStyles: matrix of the same shape as the table containing the propreties (color,
         * shape, filled, dashed and name) of each vega-mark (line, etc) to be plotted.
         * The name must be unique.
         */
        const rowGroups = [...new Set(this.props.metaData.map(this.props.getRowGroupLabel))];
        const groupsToColorMap = rowGroups.reduce((prevDict, group, index) => {
            prevDict[group] = COLORS[index % COLORS.length];
            return prevDict;
        }, {});
        const columns = this.props.getColumnLabels(this.props.metaData);
        let linesStyles = this.props.metaData.map((row, index) => {
            // color means rowGroup
            const group = rowGroups.find(group => group === this.props.getRowGroupLabel(row, index));
            const color = groupsToColorMap?.[group] ?? COLORS[0];

            // shape means row
            const shape = SHAPES[index % SHAPES.length];

            return columns.map((column_name, index) => {
                // filled means first column
                const filled = index === 0;

                // dash style maps to column name (first one is continuous line in DASHES)
                const dash = DASHES[index <= 1 ? 0 : index - 1 % DASHES.length];
                return {
                    color,
                    shape,
                    filled,
                    dash,
                    name: this.props.getCellTimeSeriesName(column_name, index, row)
                }
            })
        })

        // apply other modifications
        linesStyles = this.props.linesStylesModifier(linesStyles);

        /** Other props for the vegatimeserieschart */
        const yAxisMeasurementUnits = this.props.metaData.flat().find(el => !!el)?.unit?.abbreviation ?? '';
        const names = linesStyles.flatMap(row => row.map(col => col.name));

        const [[hiddenLinesData, skipPointsEvery], hiddenHorizontalLinesData, hiddenBarsData] = this.hideData(
            this.props.timeseriesData,
            this.props.horizontalLinesData,
            this.props.barsData,
            names
        )
        const availableLeft = this.getAvailable(this.props.timeseriesData,
            this.props.horizontalLinesData,
            this.props.barsData)



        const [[hiddenRightAxisLinesData,], hiddenRightAxisHorizontalLinesData, hiddenRightAxisBarsData] = this.hideData(
            this.props.rightAxisData.timeseriesData ?? [],
            this.props.rightAxisData.horizontalLinesData ?? [],
            this.props.rightAxisData.barsData ?? [],
            names
        )

        const availableRight = this.getAvailable(this.props.rightAxisData.timeseriesData ?? [],
            this.props.rightAxisData.horizontalLinesData ?? [],
            this.props.rightAxisData.barsData ?? []);

        const available = [...availableLeft, ...availableRight];

        return (
            <div className={classes.SelectableTimeseriesRoot}>
                <div className={classes.SelectableTimeseriesContent__subtitle}>
                    <Typography variant="subtitle1" color="textSecondary"> {this.props.title}</Typography>
                    <ButtonExport {...this.props.exportProps} disabled={this.props.isLoading} />
                </div>
                <div className={classes.SelectableTimeseriesCard__div}>
                    <div className={classes.SelectableTimeseriesGraphic__timeseries}>
                        <div className={classes.SelectableTimeseriesInnerCard}>
                            {
                                this.props.isLoading ?
                                    <div className={classes.SelectableTimeseriesSpinnerContainer}>
                                        <CircularProgress />
                                    </div> :
                                    <VegaTimeseriesChart
                                        units={{
                                            y: yAxisMeasurementUnits,
                                            x: this.props.xAxisUnits,
                                            yRightAxis: availableRight.length > 0 ? this.props.yRightAxisUnits : undefined
                                        }}
                                        data={hiddenLinesData}
                                        verticalLinesData={this.props.verticalLinesData}
                                        horizontalLinesData={hiddenHorizontalLinesData}
                                        gapsData={this.props.gapsData}
                                        barsData={hiddenBarsData}
                                        yAxisTitle={this.props.yAxisTitle || this.props.title}
                                        xAxisTitle={this.props.xAxisTitle}
                                        yRightAxisTitle={
                                            availableRight.length > 0 ? this.props.yRightAxisTitle : undefined
                                        }
                                        linesStyles={linesStyles.flat().concat(this.props.otherLinesStyles)}
                                        names={names}
                                        temporalXAxis={this.props.isTemporal}
                                        skipPointsEvery={skipPointsEvery}
                                        xDomain={this.props.xDomain}
                                        rightAxisData={{
                                            data: hiddenRightAxisLinesData,
                                            barsData: hiddenRightAxisBarsData,
                                            horizontalLinesData: hiddenRightAxisHorizontalLinesData
                                        }}
                                        xScale={this.props.xScale}
                                    />
                            }
                        </div>
                    </div>
                    {/** Clickable table legend section */}
                    <div className={classes.SelectableTimeseriesGraphic__selector}>
                        <CardGraphicSelector
                            availableNames={available}
                            toggleSeries={this.props.toggleSeries}
                            horizontalLinesData={this.props.horizontalLinesData}
                            hiddenData={this.props.hiddenLinesDict}
                            linesStyles={linesStyles}
                            metaData={this.props.metaData}
                            getRowGroupLabel={this.props.getRowGroupLabel}
                            getRowLabels={this.props.getRowLabels}
                            getColumnLabels={this.props.getColumnLabels}
                        />
                    </div>
                </div>
            </div >
        );
    }
}


SelectableTimeseries.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(SelectableTimeseries);

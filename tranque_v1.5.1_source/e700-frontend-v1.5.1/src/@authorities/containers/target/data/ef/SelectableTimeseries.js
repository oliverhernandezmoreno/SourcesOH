import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/core/styles';
import VegaTimeseriesChart from '@app/components/charts/VegaTimeseriesChart';
import Button from '@material-ui/core/Button';
import GetAppIcon from '@material-ui/icons/GetApp';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import CardGraphicSelector from '@miners/containers/EF/data/EFViews/DefaultTemporalView/CardGraphicSelector';
import { SHAPES, COLORS, DASHES } from '@app/components/charts/VegaLegendMiniPlot.js';

const styles = theme => ({
    root: {
        width: '100%',
        height: '70%',
        position: 'relative',
        padding: '2em',
    },
    card__div: {
        display: 'inline-block',
        verticalAlign: 'top',
        width: '100%',
    },
    graphic__timeseries: {
        width: '100%',
        height: '100%',
        display: 'inline-block',
        verticalAlign: 'top',
        padding: '1em'
    },
    graphic__selector: {
        width: '100%',
        height: '100%',
        display: 'inline-block',
        verticalAlign: 'top',
        padding: '1em'
    },
    button__export: {
        color: '#01aff4',
        border: '1px solid #01aff4'
    },
    button__label: {
        marginLeft: '0.5em'
    },
    content__subtitle: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: '1em'
    },
    innerCard: {
        maxWidth: '100%',
        maxHeight: '100%',
        minHeight: "432px",
    },
    plot_innerCard: {
        maxWidth: '100%',
        maxHeight: '100%'
    },
    spinnerContainer: {
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
        getRowLabels: (row) => [],
        linesStylesModifier: (linesStyles) => linesStyles
    }

    static propTypes = {
        /**
         * Dict with time series data as it comes from the backend.
         * Each key to be plotted must match name for the "lineStyles"
         * It is expected of data rows to be located at: dict[key][0].data
         */
        timeseriesData: PropTypes.array,

        /**
         * Array of {name, value} fields of horizontal lines to be plotted.
         */
        horizontalLinesData: PropTypes.array,
        /**
         * Array whose elements represent rows of the interactive table-legend
         * and from where each cell in the table is built using other callbacks.
         */
        metaData: PropTypes.array,

        /**
         * Callback with signature (metaData)=>['col label1', ...]
         * where metaData is props.metaData and returns an array of
         * labels to put over each column. If a column name is null, the entire column is not displayed.
         */
        getColumnLabels: PropTypes.func,

        /**
         * Callback to asign a unique identifier between a current cell and
         * a its timeseries.
         *
         * It will receive the following params: (column_name, col_index, row)
         * column_name: name provided by the getColumnLabels
         * col_index: index of the column this cell belongs to. Extracted from getColumLabels
         * row: row (element) of the metaData list for this cell.
         * */
        getCellTimeSeriesName: PropTypes.func,


        /**
         * Callback with signature (row) => rowGrouplabel, where each row
         * is taken from props.metaData and returns a string that
         * is used to label rows on the left side outside of the table.
         */
        getRowGroupLabel: PropTypes.func,
        /**
         * Callback with signature (row) => ['row_cell1_label', 'row_cell2_label', ...]
         * Receives a row from metaData and returns a list of labels to be put
         * on each cell of that row.
         */
        getRowLabels: PropTypes.func,
        /**
         * Callback to be executed when the "DATOS" button is clicked.
         */
        handleDownload: () => { },
        /**
         * Indicates whether the plot x-axis is temporal (true) or quantitative (false)
         */
        isTemporal: true,
        /**
         * String to be used as title shown outside of the plot and on the Y-axis.
         */
        title: PropTypes.string,
        /**
         * Callback that receives a matrix (array of arrays) containing the
         * configuration of styles of each line in the table/plot.
         * This matrix has same rows number as the metaData and same column
         * number as the length of the returned array of getColumnLabels.
         *
         * Each element (cell) contains a dict of
         * { color, shape, filled, dash, name}
         * - color, shape, dash are normally obtained from src/@app/components/charts/VegaLegendMiniPlot.js
         * constants.
         * - filled can be true or false
         * - name is the identifier of a cell and must correspond to a key in the timeseriesData dictionary
         *
         * The default encoding is:
         * - same color for same rowGroup
         * - same shape for items on the same row
         * - first column point marks are filled (true); others are empty (false)
         * - first and second column are continuous; others have different discontinuous dash patterns
         */
        linesStylesModifier: PropTypes.func
    }

    componentDidMount() {

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
                            ...v[0],
                            name: canonical_name,
                            index: index // used to filter points so the chart does not get too cluttered
                        }));

                }
                return []
            })
        // const skipPointsEvery = minLength/MIN_POINT_MARKS_PER_LINE;
        const skipPointsEvery = Math.ceil(maxLength / MAX_POINT_MARKS_PER_LINE);

        return [hiddenLineData, skipPointsEvery];
    }

    hideHorizontalData = (data, names) => {

        return data
            .filter(({ name }) => !this.state.hiddenLinesDict?.[name])
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
            const group = rowGroups.find(group => group === this.props.getRowGroupLabel(row));
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
        const [hiddenLinesData, skipPointsEvery] = this.hideLineData(this.props.timeseriesData, names);
        const hiddenHorizontalLinesData = this.hideHorizontalData(this.props.horizontalLinesData, names);

        /** List of available lines for the legend-table */
        const availableHorizontal = this.props.horizontalLinesData.map(data => data.name);
        const availableTimeSeries = new Set(Object.entries(this.props.timeseriesData).map(([key, data]) => {
            return data?.[0]?.data.length > 0 ? key : null
        }));
        const available = [...availableHorizontal, ...availableTimeSeries];
        return (
            <div className={classes.root}>
                <div className={classes.content__subtitle}>
                    <Typography variant="subtitle1" color="textSecondary"> {this.props.title}</Typography>
                    <Button className={classes.button__export} onClick={this.props.handleDownload()} disabled={this.props.isLoading}>
                        <GetAppIcon />
                        <span className={classes.button__label}>DATOS</span>
                    </Button>

                </div>
                <div className={classes.card__div}>
                    <div className={classes.graphic__timeseries}>
                        <div className={classes.innerCard}>
                            {
                                this.props.isLoading ?
                                    <div className={classes.spinnerContainer}>
                                        <CircularProgress />
                                    </div> :
                                    <VegaTimeseriesChart
                                        units={{ y: yAxisMeasurementUnits, x: this.props.xAxisUnits }}
                                        data={hiddenLinesData}
                                        horizontalLinesData={hiddenHorizontalLinesData}
                                        gapsData={this.props.gapsData}
                                        yAxisTitle={this.props.title}
                                        xAxisTitle={this.props.xAxisTitle}
                                        linesStyles={linesStyles.flatMap(v => v)}
                                        names={names}
                                        temporalXAxis={this.props.isTemporal}
                                        skipPointsEvery={skipPointsEvery}
                                        xDomain={this.props.xDomain}
                                    />
                            }
                        </div>
                    </div>
                    {/** Clickable table legend section */}
                    <div className={classes.graphic__selector}>
                        <CardGraphicSelector
                            availableNames={available}
                            toggleSeries={this.toggleSeries}
                            horizontalLinesData={this.props.horizontalLinesData}
                            hiddenData={this.state.hiddenLinesDict}
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

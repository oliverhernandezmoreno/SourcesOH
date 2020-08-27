import React, {Component} from 'react';
import {FlexibleWidthXYPlot, HorizontalBarSeries, HorizontalGridLines, XAxis, YAxis} from 'react-vis';
import 'react-vis/dist/style.css';
import * as moment from 'moment';
import 'moment/locale/es';
import {withStyles} from '@material-ui/core/styles';

function timeFormatter(format) {
    return (value) => {
        return moment(value).format(format || 'L');
    };
}

const styles = theme => ({
    root: {
        padding: theme.spacing(2)
    },
    gridLines: {
        strokeWidth: 48,
        '& line': {
            stroke: theme.palette.primary.main
        }
    },
    axis: {
        '& line': {
            display: 'none'
        }
    }
});

export const HorizontalBarSeriesChart = withStyles(styles)(
    class extends Component {

        state = {
        };

        static getDerivedStateFromProps(props, state) {
            return null;
        }

        render() {
            const {classes, data, xDomain, yDomain} = this.props;
            return (
                <div className={classes.root}>
                    <FlexibleWidthXYPlot 
                        xType="time" yType="ordinal"
                        colorType="literal"
                        yDomain={yDomain || null}
                        xDomain={xDomain || null}
                        height={72 * (yDomain ? yDomain.length : 0)}
                        margin={{left: 148, top: 24, right: 24}}
                        stroke={0}>
                        <HorizontalGridLines className={classes.gridLines}/>
                        <XAxis 
                            tickFormat={timeFormatter()} tickTotal={5} 
                            className={classes.axis}/>
                        <YAxis className={classes.axis}/>
                        <HorizontalBarSeries barWidth={0.5} data={data || null} />
                    </FlexibleWidthXYPlot>
                </div>
            );
        };
    }
);

HorizontalBarSeriesChart.propTypes = {};

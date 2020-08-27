import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Crosshair, FlexibleWidthXYPlot, HorizontalGridLines, LineMarkSeries, MarkSeries, XAxis, YAxis} from 'react-vis';
import 'react-vis/dist/style.css';
import * as moment from 'moment';
import 'moment/locale/es';
import {withStyles} from '@material-ui/core/styles';
import sum from 'hash-sum';
import {Announcement} from '@material-ui/icons';
import {Typography} from '@material-ui/core';
import classNames from 'classnames';

function timeFormattter(format) {
    return (value) => {
        return moment(value).format(format);
    };
}

const hslToRgb = (h, s, l) => {
    let r, g, b;
    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [
        '#',
        (~~(r * 255)).toString(16).padStart(2, '0'),
        (~~(g * 255)).toString(16).padStart(2, '0'),
        (~~(b * 255)).toString(16).padStart(2, '0')
    ].join('');
};

const colorWheel = (spokes, saturation = 0.7, luminescence = 0.7) => {
    const step = 1.61803399 / 3;
    const colors = [];
    for (let i = 0; i < spokes; i++) {
        colors.push(hslToRgb((i * step) % 1, saturation, luminescence));
    }
    return colors;
};

const styles = theme => ({
    root: {
        padding: theme.spacing(2)
    },
    crosshairBorder: {
        backgroundColor: theme.palette.primary.light,
        padding: '1px',
        borderRadius: 4,
        borderWidth: 0.5
    },
    crosshair: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(0.5),
        margin: '0',
        borderRadius: 4,
        borderWidth: 0.5,
        color: theme.palette.text.primary,
        '& h3': {
            marginTop: 0,
            paddingTop: 0
        },
        '&>div': {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            '&>div:not(first-child)': {
                marginLeft: '5px'
            }
        }
    },
    gridLines: {
        strokeWidth: 30,
        '& line': {
            stroke: theme.palette.secondary.light
        }
    },
    noData: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.palette.text.disabled
    },
    label: {
        '& text': {
            fill: theme.palette.text.primary
        },
        color: theme.palette.text.primary
    },
    axis: {
        '& line': {
            display: 'none'
        }
    }
});

export const MarkSeriesChart = withStyles(styles)(
    class extends Component {
        handleHover() {
            return (xValue) => {
                const values = [];
                this.props.data.forEach((d) => {
                    d.data.forEach((x) => {
                        if (x.isSame(xValue)) {
                            values.push({x, label: d.label});
                        }
                    });
                });
                if (values.length > 0) {
                    this.setState({hoveredData: values});
                } else {
                    this.setState({hoveredData: false});
                }
            };
        }

        state = {
            hoveredData: false,
            handleHover: this.handleHover()
        };

        static getDerivedStateFromProps(props, state) {
            if (!props.data) {
                return {
                    noData: true
                };
            }
            const dataHash = sum(props.data);
            if (state.dataHash === dataHash) {
                return null;
            }

            let xTickFormat = 'L';
            if (props.xTickFormat !== undefined) {
                xTickFormat = props.xTickFormat;
            }
            const colors = colorWheel(props.data.length);
            const colorMap = {};

            props.data.forEach((d, index) => {
                const color = d.color ? d.color : colors[index];
                if (d.label) {
                    colorMap[d.label] = color;
                }
            });

            // To avoid problem with hover over multiple lines, add onNearesX handler on a new transparent line that contains all posible X values
            const xValuesSet = new Set();
            let someYValue = 0;
            props.data.forEach(
                d => {
                    someYValue = d.label;
                    d.data.forEach(x => xValuesSet.add(x));
                }
            );
            const xValues = [
                xValuesSet.size === 1 ?
                    moment(Array.from(xValuesSet)[0]).subtract(1, props.timeUnit || 'month') :
                    null,
                ...Array.from(xValuesSet).sort((a, b) => a.valueOf() - b.valueOf()),
                xValuesSet.size === 1 ?
                    moment(Array.from(xValuesSet)[0]).add(1, props.timeUnit || 'month') :
                    null
            ].filter((t) => t);

            if (xValuesSet.size === 0) {
                return {
                    noData: true
                };
            }

            const lines = [];
            let labelMaxLength = 0;
            props.data.forEach((d, index) => {
                const color = d.color ? d.color : d.label ? colorMap[d.label] : colors[0];
                const label = d.label || '';
                if (label.length > labelMaxLength) {
                    labelMaxLength = label.length;
                }
                const values = d.data.map(x => ({x, y: label}));
                lines.push(
                    <MarkSeries
                        key={`${d.label}-${index}`}
                        size={6}
                        color={values.length > 0 ? color : 'transparent'}
                        data={values.length > 0 ? values : [{x: Array.from(xValuesSet)[0], y: label}]}
                    />
                );
            });

            lines.push(
                <LineMarkSeries
                    key={`xvalues`} color='transparent'
                    onNearestX={d => state.handleHover(d.x)}
                    data={xValues.map(x => ({x: x, y: someYValue}))}
                />
            );

            if (lines.length > 1) {
                return {
                    xTickFormat,
                    lines,
                    colorMap,
                    dataHash,
                    labelMaxLength,
                    noData: false
                };
            } else {
                return {noData: true};
            }
        }

        render() {
            const {
                xTickFormat,
                lines,
                colorMap,
                hoveredData,
                labelMaxLength,
                noData
            } = this.state;
            const {classes} = this.props;
            return (
                <div
                    className={classes.root}>
                    {noData && <div className={classes.noData}>
                        <div><Announcement/></div>
                        <Typography variant="h6">Sin datos disponibles</Typography>
                    </div>}
                    {!noData && <FlexibleWidthXYPlot
                        margin={{left: 10 + labelMaxLength * 6, top: 24, right: 16}}
                        xType='time'
                        yType="ordinal"
                        height={30 + 33 * lines.length}
                        onMouseLeave={() => {
                            this.setState({hoveredData: false});
                        }}>
                        <HorizontalGridLines className={classes.gridLines}/>
                        <XAxis
                            tickFormat={timeFormattter(xTickFormat)}
                            tickTotal={5}
                            className={classNames(classes.label, classes.axis)}
                        />
                        <YAxis className={classNames(classes.label, classes.axis)}/>
                        {lines}
                        {hoveredData && <Crosshair values={hoveredData}>
                            <div className={classes.crosshairBorder}>
                                <div className={classes.crosshair}>
                                    <table>
                                        <tbody>{hoveredData.map((e, index) =>
                                            <tr key={index}>
                                                {e.label &&
                                                <td style={{color: colorMap[e.label]}}>{e.label}:</td>}
                                                <td style={{fontSize: '12px'}}>{timeFormattter(xTickFormat)(e.x)}</td>
                                            </tr>
                                        )}</tbody>
                                    </table>
                                </div>
                            </div>
                        </Crosshair>}
                    </FlexibleWidthXYPlot>}
                </div>
            );
        };
    }
);

MarkSeriesChart.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            data: PropTypes.array.isRequired,
            label: PropTypes.string,
            color: PropTypes.string
        })).isRequired
};

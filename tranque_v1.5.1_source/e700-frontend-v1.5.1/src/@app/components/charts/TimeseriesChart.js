import React, {Component} from 'react';
import {
    AreaSeries,
    ChartLabel,
    Crosshair,
    DiscreteColorLegend,
    FlexibleWidthXYPlot,
    HorizontalGridLines,
    LabelSeries,
    LineMarkSeries,
    LineSeries,
    XAxis,
    YAxis
} from 'react-vis';
import 'react-vis/dist/style.css';
import * as moment from 'moment';
import 'moment/locale/es';
import {withStyles} from '@material-ui/core/styles';
import sum from 'hash-sum';

import {formatDecimal} from '@app/services/formatters';
import {Announcement} from '@material-ui/icons';
import {Typography} from '@material-ui/core';


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
        padding: '2rem',
        paddingBottom: '2rem',
        '& .rv-discrete-color-legend-item': {
            color: theme.palette.text.primary
        },
    },
    paddingRoot: {
        paddingBottom: theme.spacing(7)
    },
    crosshairBorder: {
        backgroundColor: theme.palette.primary.light,
        padding: '1px',
        borderRadius: 4,
        borderWidth: 0.5
    },
    crosshair: {
        backgroundColor: theme.palette.background.paper,
        padding: '0.25rem',
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
        '& .rv-xy-plot__grid-lines__line': {
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
    warningLabel: {
        '& text': {
            fill: theme.palette.text.primary,
            fontWeight: 'bold'
        },
        color: theme.palette.text.primary
    }
});

function formatNumber(n, decimals = 2) {
    const sign = n < 0 ? '-' : '';
    const N = Math.abs(n);
    const k = 1000;
    const sizes = ['', 'k'];
    const i = Math.floor(Math.log(N) / Math.log(k));
    const ri = Math.max(0, Math.min(i, sizes.length - 1));
    return sign + formatDecimal(N / Math.pow(k, ri), decimals) + sizes[ri];
}

class TimeseriesChart extends Component {

    formatBigNumbers(x) {
        return formatNumber(x, 3);
    }

    handleHover() {
        return (xValue) => {
            const values = [];
            this.props.data.forEach((d) => {
                d.data.forEach((events) => {
                    const eve = events.find(e => e.x.isSame(xValue));
                    if (eve !== undefined) {
                        eve.label = d.label;
                        values.push(eve);
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
        if (props.data === undefined) {
            return {
                unitsX: undefined,
                unitsY: undefined,
                xTickFormat: undefined,
                legend: undefined,
                areas: undefined,
                lines: undefined,
                colorMap: undefined,
                thresholds: undefined,
                allZero: false,
                noData: false,
                noAreas: false
            };
        }
        const dataHash = sum(props.data);
        const areasHash = sum(props.areas);
        const thresholdHash = sum(props.thresholds);
        if (state.dataHash === dataHash
            && state.thresholdHash === thresholdHash
            && state.areasHash === areasHash) {
            return null;
        }

        let unitsX = 'Periodo de tiempo';
        let unitsY = '';

        if (props.units !== undefined) {
            if (props.units.x !== undefined) {
                unitsX = props.units.x;
            }
            if (props.units.y !== undefined) {
                unitsY = props.units.y;
            }
        }

        const colors = colorWheel(props.data.length);
        const colorMap = {};
        const legendItems = [];
        props.data.forEach((d, index) => {
            const color = d.color ? d.color : colors[index];
            if (d.label !== undefined) {
                legendItems.push({title: d.label, color: color});
                colorMap[d.label] = color;
            }
        });

        const lines = [];
        props.data.forEach((d, index) => {
            const color = d.color ? d.color : d.label ? colorMap[d.label] : colors[0];
            d.data.forEach(
                (events, index2) => {
                    if (events.length > 0) {
                        lines.push(
                            <LineMarkSeries
                                key={`${d.label}-${index}-${index2}`}
                                color={color}
                                style={{mark: {stroke: 'white'}}}
                                data={events}
                            />
                        );
                    }
                }
            );
        });

        const areas = [];
        (props.areas || []).forEach((d, index) => {
            const color = d.color ? d.color : d.label ? colorMap[d.label] : colors[0];
            d.data.forEach(
                (events, index2) => {
                    if (events.length > 0) {
                        areas.push(
                            <AreaSeries
                                key={`${d.label}-${index}-${index2}`}
                                color={color}
                                data={events}
                            />
                        );
                    }
                }
            );
        });
        const noAreas = typeof props.areas !== 'undefined' && areas.length === 0;

        // To avoid problem with hover over multiple lines, add onNearesX handler on a new transparent line that contains all posible X values
        const xValuesSet = new Set();
        let someYValue = 0;
        let minY = Number.MAX_VALUE;
        let maxY = Number.MIN_VALUE;
        props.data.forEach((d) => {
            d.data.forEach((events) => {
                if (events.length > 0) {
                    someYValue = events[0].y;
                }
                events.forEach(e => {
                    xValuesSet.add(e.x);
                    if (minY > e.y) {
                        minY = e.y;
                    }
                    if (maxY < e.y) {
                        maxY = e.y;
                    }
                });
            });
        });
        if (minY > props.minY) {
            minY = props.minY;
        }
        if (maxY < props.maxY) {
            maxY = props.maxY;
        }
        if (xValuesSet.size < 1) {
            return {noData: true};
        }
        if (props.minX) {
            xValuesSet.add(props.minX);
        }
        if (props.maxX) {
            xValuesSet.add(props.maxX);
        }
        const xValues = [
            xValuesSet.size === 1 ?
                moment(Array.from(xValuesSet)[0]).clone().subtract(1, props.timeUnit || 'month') :
                null,
            ...Array.from(xValuesSet).sort((a, b) => a.valueOf() - b.valueOf()),
            xValuesSet.size === 1 ?
                moment(Array.from(xValuesSet)[0]).clone().add(1, props.timeUnit || 'month') :
                null
        ].filter((t) => t);
        lines.push(
            <LineMarkSeries
                key={`xvalues`} color='transparent'
                style={{mark: {stroke: 'white'}}}
                onNearestX={d => state.handleHover(d.x)}
                data={xValues.map(x => ({x: x, y: someYValue}))}
            />,
            <LineMarkSeries
                key={`yvalues`} color='transparent'
                style={{mark: {stroke: 'white'}}}
                data={[{x: xValues[0], y: minY}, {x: xValues[0], y: maxY}]}
            />
        );

        let xTickFormat;
        if (props.xTickFormat) {
            xTickFormat = props.xTickFormat;
        } else {
            const defaultTickFormats = [
                {
                    unit: 'months',
                    threshold: 3,
                    format: 'MMM YYYY'
                },
                {
                    unit: 'days',
                    threshold: 7,
                    format: 'DD MMM YYYY'
                },
                {
                    unit: 'hours',
                    threshold: Number.MIN_VALUE,
                    format: 'DD MMM - HH:mm'
                }
            ];
            const firstX = xValues[0];
            const lastX = xValues[xValues.length - 1];
            const timeUnit = defaultTickFormats.find(tu => lastX.diff(firstX, tu.unit) >= tu.threshold);
            xTickFormat = timeUnit.format;
        }

        const legend = legendItems.length > 0 ?
            <DiscreteColorLegend orientation='horizontal' items={legendItems}/> : null;

        const thresholds = [];
        const thresholdColor = '#faff3e';
        if (props.thresholds && xValues.length > 0) {
            const firstX = xValues[0];
            const lastX = xValues[xValues.length - 1];
            props.thresholds.forEach((t, index) => {
                thresholds.push(<LineSeries
                    key={`t-line-${index}`} color={thresholdColor}
                    data={[{x: firstX, y: t.value}, {x: lastX, y: t.value}]}
                    strokeStyle='dashed'/>);
                thresholds.push(<LabelSeries
                    key={`t-label-${index}`} style={{fontSize: 12, fill: thresholdColor}}
                    data={[{x: lastX.valueOf(), y: t.value, label: t.label}]}/>);
            });
        }

        const allZero = props.data
            .filter((serie) => serie)
            .every((serie) => serie.data.every((vector) => vector.filter((pair) => pair).every((pair) => pair.y === 0)));

        if (lines.length > 1 || areas.length > 0) {
            return {
                unitsX,
                unitsY,
                xTickFormat,
                legend,
                areas,
                lines,
                colorMap,
                dataHash,
                areasHash,
                thresholdHash,
                thresholds,
                allZero,
                noAreas
            };
        } else {
            return {noData: true};
        }
    }

    render() {
        return (
            <div
                className={`${this.props.classes.root} ${this.state.legend ? this.props.classes.paddingRoot : ''}`}>
                {this.state.noData && <div className={this.props.classes.noData}>
                    <div><Announcement/></div>
                    <Typography variant="h6">Sin datos disponibles</Typography>
                </div>}
                {!this.state.noData && <FlexibleWidthXYPlot
                    margin={{left: 72, top: 24, right: 16}} {...(this.state.allZero ? {yDomain: [0, 1]} : {})}
                    xType='time'
                    height={280}
                    onMouseLeave={() => {
                        this.setState({hoveredData: false});
                    }}>
                    <HorizontalGridLines className={this.props.classes.gridLines}/>
                    <XAxis
                        tickFormat={timeFormattter(this.state.xTickFormat)}
                        tickTotal={5}
                        tickLabelAngle={-20}
                        className={this.props.classes.label}
                    />
                    {this.state.noAreas && <ChartLabel
                        text={this.props.noAreaLabel || 'ⓘ No hay tendencias disponibles'}
                        className={this.props.classes.warningLabel}
                        includeMargin={true}
                        xPercent={0.99}
                        yPercent={-0.23}
                        style={{textAnchor: 'end'}}
                    />
                    }
                    <ChartLabel
                        text={this.state.unitsX}
                        className={this.props.classes.label}
                        includeMargin={true}
                        xPercent={0.99}
                        yPercent={0.73}
                        style={{textAnchor: 'end'}}
                    />
                    <YAxis
                        tickFormat={this.formatBigNumbers.bind(this)}
                        className={this.props.classes.label}
                    />
                    <ChartLabel
                        text={this.state.unitsY}
                        className={this.props.classes.label}
                        includeMargin={true}
                        xPercent={0.05}
                        yPercent={-0.23}
                    />
                    {this.state.legend}
                    {this.state.areas}
                    {this.state.lines}
                    {this.state.thresholds}
                    {this.state.hoveredData && <Crosshair values={this.state.hoveredData}>
                        <div className={this.props.classes.crosshairBorder}>
                            <div className={this.props.classes.crosshair}>
                                <h3>{this.state.hoveredData[0].x.format(this.state.xTickFormat)}</h3>
                                <table>
                                    <tbody>{this.state.hoveredData.map((e, index) =>
                                        <tr key={index}>
                                            {e.label ?
                                                <td style={{color: this.state.colorMap[e.label]}}>{e.label}:</td> : []}
                                            <td style={{fontSize: '12px'}}>{formatDecimal(e.y, 3)}</td>
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

export default withStyles(styles)(TimeseriesChart);

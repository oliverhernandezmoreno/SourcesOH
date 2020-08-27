import React, { PureComponent } from "react";
import { VegaLite } from "react-vega";

export const SHAPES = [
    "circle",
    "square",
    "diamond",
    "triangle-up",
    "triangle-down",
    "triangle-right",
    "triangle-left",
    "cross",
];

export const COLORS = [
    "#ff7bb5", // pink
    "#97e54f", // green
    "#00b7ff", // light blue
    "#f9b200", // orange-ish
    "#a9a5ff", // purple-ish
];

export const DASHES = [
    [4, 0], // continous line
    [4, 1],
    [4, 2],
    [2, 1],
    [2, 2],
    [8, 4],
    [8, 2],
    [8, 1],
];

class VegaLegendMiniPlot extends PureComponent {
    static defaultProps = {
        shape: SHAPES[0],
        filled: true,
        color: COLORS[0],
        dash: DASHES[0],
        /**
         * What kind of mark is it, can be "line" or "bar"
         */
        markType: "line",
    };

    lineSpec = () => {
        return {
            data: {
                values: [{ a: -100 }, { a: 0 }, { a: 100 }],
            },
            mark: {
                type: "line",
                point: {
                    style: "triangle",
                    filled: this.props.filled,
                },
                color: this.props.color,
                clip: true,
                strokeDash: this.props.dash,
            },
            encoding: {
                x: {
                    field: "a",
                    type: "quantitative",
                    scale: {
                        domain: [-5, 5],
                    },
                    axis: {
                        title: null,
                    },
                },
            },
            config: {
                background: null,
                axis: false,
                style: {
                    triangle: {
                        shape: this.props.shape,
                        strokeWidth: 2,
                        size: 80,
                        color: this.props.color,
                    },
                },
            },
        };
    };

    barSpec = () => {
        return {
            data: { values: [{ a: 0, b: 0.5 }] },
            mark: {
                type: "bar",
                color: this.props.color,
                clip: true,
            },
            encoding: {
                x: {
                    field: "a",
                    type: "quantitative",
                    scale: { domain: [-0.5, 0.5] },
                    axis: { title: null },
                },
                y: {
                    field: "b",
                    type: "quantitative",
                    axis: { title: null },
                },
            },
            config: {
                background: null,
                axis: false,
                bar: {
                    continuousBandSize: 15,
                },
            },
        };
    };
    render() {
        const lineSpec = this.props.markType === "line" ? this.lineSpec() : {};
        const barSpec = this.props.markType === "bar" ? this.barSpec() : {};
        const spec = {
            schema: "https://vega.github.io/schema/vega-lite/v4.json",
            width: 32,
            height: 24,
            padding: 0,
            view: {
                stroke: null,
            },
            ...lineSpec,
            ...barSpec,
        };

        return <VegaLite renderer="svg" spec={spec} actions={false} />;
    }
}

export default VegaLegendMiniPlot;

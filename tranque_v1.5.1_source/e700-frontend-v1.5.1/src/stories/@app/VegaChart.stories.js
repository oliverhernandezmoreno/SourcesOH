import React from 'react';

import { storiesOf } from '@storybook/react';
import VegaTimeseriesChart from '@app/components/charts/VegaTimeseriesChart';
import VegaLegendMiniPlot from '@app/components/charts/VegaLegendMiniPlot';
import moment from 'moment/moment';


const props = {
    data: new Array(10).fill(1).flatMap((e, index) => [
        {
            name: "el-mauro.s-perfil-A1.ef-mvp.m2.parameters.variables.elevacion",
            index: 0,
            x: 0 + index * 325,
            y: 731.8853820597765,
        },
        {
            name: "el-mauro.s-perfil-A1.ef-mvp.m2.parameters.variables.elevacion",
            index: 32,
            x: 321.3190234103885 + index * 325,
            y: 841.4329524302399,
        },
        {
            name:
                "el-mauro.s-perfil-A1.ef-mvp.m2.parameters.variables.perfil-suelo-fundacion",
            index: 13,
            x: 65 + index * 390,
            y: 232.8850183373796,
        },
        {
            name:
                "el-mauro.s-perfil-A1.ef-mvp.m2.parameters.variables.perfil-suelo-fundacion",
            index: 45,
            x: 225.00224166312543 + index * 390,
            y: 431.5274682630082,
        },
        {
            name:
                "el-mauro.s-perfil-A1.ef-mvp.m2.parameters.variables.perfil-suelo-fundacion",
            index: 77,
            x: 385 + index * 390,
            y: 437.9825160809631,
        },
    ]),
    data2: [
        {
            name: "el-mauro.s-perfil-A1.ef-mvp.m2.parameters.variables.elevacion",
            index: 0,
            x: moment('2019-01-01'),
            y: 731.8853820597765,
        },
        {
            name: "el-mauro.s-perfil-A1.ef-mvp.m2.parameters.variables.elevacion",
            index: 32,
            x: moment('2019-04-01'),
            y: 841.4329524302399,
        },
        {
            name:
                "el-mauro.s-perfil-A1.ef-mvp.m2.parameters.variables.perfil-suelo-fundacion",
            index: 13,
            x: moment('2019-07-01'),
            y: 232.8850183373796,
        },
        {
            name:
                "el-mauro.s-perfil-A1.ef-mvp.m2.parameters.variables.perfil-suelo-fundacion",
            index: 45,
            x: moment('2019-10-01'),
            y: 431.5274682630082,
        },
        {
            name:
                "el-mauro.s-perfil-A1.ef-mvp.m2.parameters.variables.perfil-suelo-fundacion",
            index: 77,
            x: moment('2020-01-01'),
            y: 437.9825160809631,
        },
    ],
    verticalLinesData: [
        {
            value: 2000,
            name: 'vertical-line1',
        },
        {
            value: 20000,
            name: 'vertical-line2',
        }
    ],
    horizontalLinesData: [
        {
            value: 120.00000000,
            name: "el-mauro.s-pz-A-01.ef-mvp.m2.parameters.presion-poros-3",
            kind: "cota-instalacion",
        },
        {
            value: 500.00000000,
            name: "el-mauro.s-pz-C-01.ef-mvp.m2.parameters.presion-poros-1",
            kind: null,
        },
        {
            value: 600.00000000,
            name: "el-mauro.s-pz-C-03.ef-mvp.m2.parameters.presion-poros-2",
            kind: null,
        },
        {
            value: 820.00000000,
            name: "el-mauro.s-pz-C-06.ef-mvp.m2.parameters.presion-poros-1",
            kind: null,
        },
    ],
    barsData: [
        {
            x: 400,
            y: 200,
            name: 'bar1'
        },
        {
            x: 800,
            y: 400,
            name: 'bar1'
        },
        {
            x: 2000,
            y: 600,
            name: 'bar2'
        },
        {
            x: 2400,
            y: 300,
            name: 'bar2'
        },
        {
            x: 1400,
            y: 300,
            name: 'bar3'
        }
    ],
    rectanglesData: [
        {
            x: 400,
            x2: 620,
            name: 'rect1'
        },
        {
            x: 1100,
            x2: 1300,
            name: 'rect2'
        },
        {
            x: 3300,
            x2: 4000,
            name: 'rect3'
        }
    ],
    linesStyles: [
        {
            color: "#ff7bb5",
            shape: "circle",
            filled: true,
            dash: [4, 0],
            name: "el-mauro.s-perfil-A1.ef-mvp.m2.parameters.variables.elevacion",
        },
        {
            color: "#ff7bb5",
            shape: "circle",
            filled: false,
            dash: [4, 0],
            name:
                "el-mauro.s-perfil-A1.ef-mvp.m2.parameters.variables.perfil-suelo-fundacion",
        },
        {
            color: "#00b7ff",
            shape: "square",
            filled: true,
            dash: [4, 0],
            name: "el-mauro.s-pz-A-01.ef-mvp.m2.parameters.presion-poros-3",
        },
        {
            color: "#00b7ff",
            shape: "square",
            filled: false,
            dash: [4, 0],
            name: "el-mauro.s-pz-C-01.ef-mvp.m2.parameters.presion-poros-1",
        },
        {
            color: "#97e54f",
            shape: "diamond",
            filled: true,
            dash: [4, 0],
            name: "el-mauro.s-pz-C-03.ef-mvp.m2.parameters.presion-poros-2",
        },
        {
            color: "#97e54f",
            shape: "diamond",
            filled: false,
            dash: [4, 0],
            name: "el-mauro.s-pz-C-06.ef-mvp.m2.parameters.presion-poros-1",
        },
        {
            color: "#97e54f",
            name: "bar1",
            markType: 'bar'
        },
        {
            color: "#f9b200",
            name: "bar2",
            markType: 'bar'
        },
        {
            color: "#a9a5ff",
            name: "bar3",
            markType: 'bar'
        },
        {
            name: 'vertical-line1',
            color: "yellow",
            shape: "none",
            dash: [4, 0],
        },
        {
            name: 'vertical-line2',
            color: "aqua",
            shape: "none",
            dash: [4, 0],
        }
    ],
};



storiesOf('App/VegaTimeseriesChart', module)
    .add('01-Scatter lines with point marks', () => {
        return <div>
            return <div>
                <h1>VegaTimeSeriesChart</h1>
                <VegaTimeseriesChart
                    data={props.data}
                    horizontalLinesData={[]}
                    linesStyles={props.linesStyles}
                    names={props.linesStyles.map(l => l.name)}
                    units={{ y: "m.s.n.m." }}
                    yAxisTitle={"Perfil topográfico y cotas piezométricas"}
                    xAxisTitle={"DISTANCIA HORIZONTAL"}
                    temporalXAxis={false}
                    skipPointsEvery={1}
                />
                <h1>VegaLegendMiniPlot</h1>
                {
                    props.linesStyles
                        .filter(line => props.data.some(d => d.name === line.name))
                        .map((lineProperties, index) => {
                            return (
                                <div key={index} style={{ margin: '1em' }}>
                                    <VegaLegendMiniPlot

                                        color={lineProperties?.color}
                                        shape={lineProperties?.shape}
                                        filled={lineProperties?.filled}
                                        dash={lineProperties?.dash}
                                    />
                                    {lineProperties.name}
                                </div>

                            )
                        })

                }
            </div>
        </div>
    })
    .add('02-Horizontal lines too', () => {
        return <div>
            <h1>VegaTimeSeriesChart</h1>
            <VegaTimeseriesChart
                data={props.data}
                horizontalLinesData={props.horizontalLinesData}
                linesStyles={props.linesStyles}
                names={props.linesStyles.map(l => l.name)}
                units={{ y: "m.s.n.m." }}
                yAxisTitle={"Perfil topográfico y cotas piezométricas"}
                xAxisTitle={"DISTANCIA HORIZONTAL"}
                temporalXAxis={false}
                skipPointsEvery={1}
            />
            <h1>VegaLegendMiniPlot</h1>
            {
                props.linesStyles
                    .filter(line =>
                        props.data.some(d => d.name === line.name) ||
                        props.horizontalLinesData.some(d => d.name === line.name))
                    .map((lineProperties, index) => {
                        return (
                            <div key={index} style={{ margin: '1em' }}>
                                <VegaLegendMiniPlot
                                    color={lineProperties?.color}
                                    shape={lineProperties?.shape}
                                    filled={lineProperties?.filled}
                                    dash={lineProperties?.dash}
                                />
                                {lineProperties.name}
                            </div>

                        )
                    })

            }
        </div>
    })
    .add('03-Explicit xaxis range', () => {
        return <div>
            <h1>VegaTimeSeriesChart</h1>
            <VegaTimeseriesChart
                data={props.data}
                horizontalLinesData={props.horizontalLinesData}
                linesStyles={props.linesStyles}
                names={props.linesStyles.map(l => l.name)}
                units={{ y: "m.s.n.m." }}
                yAxisTitle={"Perfil topográfico y cotas piezométricas"}
                xAxisTitle={"DISTANCIA HORIZONTAL"}
                temporalXAxis={false}
                skipPointsEvery={1}
                xDomain={[0, 5000]}
            />
            <h1>VegaLegendMiniPlot</h1>
            {
                props.linesStyles
                    .filter(line =>
                        props.data.some(d => d.name === line.name) ||
                        props.horizontalLinesData.some(d => d.name === line.name))
                    .map((lineProperties, index) => {
                        return (
                            <div key={index} style={{ margin: '1em' }}>
                                <VegaLegendMiniPlot
                                    color={lineProperties?.color}
                                    shape={lineProperties?.shape}
                                    filled={lineProperties?.filled}
                                    dash={lineProperties?.dash}
                                />
                                {lineProperties.name}
                            </div>

                        )
                    })

            }
        </div>
    })
    .add('04-Explicit xaxis range with dates', () => {
        return <div>
            <h1>VegaTimeSeriesChart</h1>
            <VegaTimeseriesChart
                data={props.data2}
                horizontalLinesData={props.horizontalLinesData}
                linesStyles={props.linesStyles}
                names={props.linesStyles.map(l => l.name)}
                units={{ y: "m.s.n.m." }}
                yAxisTitle={"Perfil topográfico y cotas piezométricas"}
                xAxisTitle={"Timestamp"}
                temporalXAxis={true}
                skipPointsEvery={1}
                xDomain={['2018-10-01', '2020-04-01']}
            />
            <h1>VegaLegendMiniPlot</h1>
            {
                props.linesStyles
                    .filter(line =>
                        props.data.some(d => d.name === line.name) ||
                        props.horizontalLinesData.some(d => d.name === line.name))
                    .map((lineProperties, index) => {
                        return (
                            <div key={index} style={{ margin: '1em' }}>
                                <VegaLegendMiniPlot
                                    color={lineProperties?.color}
                                    shape={lineProperties?.shape}
                                    filled={lineProperties?.filled}
                                    dash={lineProperties?.dash}
                                />
                                {lineProperties.name}
                            </div>

                        )
                    })

            }
        </div>
    })
    .add('05-Missing data (rectangles)', () => {

        const dataWithMissingvalues = props.data.map((d, index) => ({
            ...d,
            y: (index > 5 && index < 10) || (index > 15 && index < 20) ? undefined : d.y
        }))
        return <div>
            <h1>VegaTimeSeriesChart</h1>
            <VegaTimeseriesChart
                data={dataWithMissingvalues}
                /* horizontalLinesData={props.horizontalLinesData} */
                gapsData={props.rectanglesData}
                linesStyles={props.linesStyles}
                names={props.linesStyles.map(l => l.name)}
                units={{ y: "m.s.n.m." }}
                yAxisTitle={"Perfil topográfico y cotas piezométricas"}
                xAxisTitle={"DISTANCIA HORIZONTAL"}
                temporalXAxis={false}
                skipPointsEvery={1}
            />
            <h1>VegaLegendMiniPlot</h1>
            {
                props.linesStyles
                    .filter(line =>
                        props.data.some(d => d.name === line.name) ||
                        props.horizontalLinesData.some(d => d.name === line.name))
                    .map((lineProperties, index) => {
                        return (
                            <div key={index} style={{ margin: '1em' }}>
                                <VegaLegendMiniPlot
                                    color={lineProperties?.color}
                                    shape={lineProperties?.shape}
                                    filled={lineProperties?.filled}
                                    dash={lineProperties?.dash}
                                />
                                {lineProperties.name}
                            </div>

                        )
                    })

            }
        </div>
    })
    .add('06-Log axis', () => {

        const dataWithMissingvalues = props.data.map(d => ({ ...d, x: Math.pow(2, d.x / 100) }));
        return <div style={{ width: '800px' }}>
            <h1>VegaTimeSeriesChart</h1>
            <VegaTimeseriesChart
                data={dataWithMissingvalues}
                linesStyles={props.linesStyles}
                names={props.linesStyles.map(l => l.name)}
                units={{ y: "m.s.n.m." }}
                xScale={{ type: "log" }}
                yAxisTitle={"Perfil topográfico y cotas piezométricas"}
                xAxisTitle={"DISTANCIA HORIZONTAL"}
                temporalXAxis={false}
                skipPointsEvery={1}
            />
        </div>
    })
    .add('07-Vertical lines', () => {

        const dataWithMissingvalues = props.data.map(d => ({ ...d, x: Math.pow(2, d.x / 100) }));
        return <div style={{ width: '800px' }}>
            <h1>VegaTimeSeriesChart</h1>
            <VegaTimeseriesChart
                data={dataWithMissingvalues}
                verticalLinesData={props.verticalLinesData}
                linesStyles={props.linesStyles}
                names={props.linesStyles.map(l => l.name)}
                units={{ y: "m.s.n.m." }}
                xScale={{ type: "log" }}
                yAxisTitle={"Perfil topográfico y cotas piezométricas"}
                xAxisTitle={"DISTANCIA HORIZONTAL"}
                temporalXAxis={false}
                skipPointsEvery={1}
            />
        </div>
    })
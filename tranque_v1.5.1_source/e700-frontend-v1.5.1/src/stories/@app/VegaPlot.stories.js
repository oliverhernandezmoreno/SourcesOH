import React from 'react';

import { storiesOf } from '@storybook/react';
import VegaTimeseriesChart from '@app/components/charts/VegaTimeseriesChart';
import VegaLegendMiniPlot from '@app/components/charts/VegaLegendMiniPlot';


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
    .add('03-And bars', () => {
        return <div>
            <h1>VegaTimeSeriesChart</h1>
            <VegaTimeseriesChart
                data={props.data}
                horizontalLinesData={props.horizontalLinesData}
                barsData={props.barsData}
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
                    .map((lineProperties, index) => {
                        return (
                            <div key={index} style={{ margin: '1em' }}>
                                <VegaLegendMiniPlot
                                    color={lineProperties?.color}
                                    shape={lineProperties?.shape}
                                    filled={lineProperties?.filled}
                                    dash={lineProperties?.dash}
                                    markType={lineProperties.markType}
                                />
                                {lineProperties.name}
                            </div>

                        )
                    })
            }
        </div>
    })
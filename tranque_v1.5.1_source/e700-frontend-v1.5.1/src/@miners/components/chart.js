import React from 'react';
import {HorizontalGridLines, LineMarkSeries, XAxis, XYPlot, YAxis} from 'react-vis';
import 'react-vis/dist/style.css';
import 'moment/locale/es';

const Chart = (props) => {
    return (
        <XYPlot
            xType="ordinal"
            width={800}
            height={340}
            margin={{left: 80, bottom: 90}}>

            <HorizontalGridLines/>
            <XAxis
                title="Periodo de tiempo"
                tickTotal={1}
                tickLabelAngle={-60}
                style={{color: 'red'}}
            />
            <YAxis title={props.units}/>
            <LineMarkSeries color="#0095D0"
                data={props.data.slice().reverse()}/>
        </XYPlot>
    );
};

export default Chart;

import React from 'react';
import {storiesOf} from '@storybook/react';
import {HorizontalBarSeriesChart} from '@app/components/charts/HorizontalBarSeriesChart';
import {ThemeSelect} from 'stories/ThemeSelect';
import * as moment from 'moment';


const yDomain = ["gray", "green", "yellow", "red"];
const data = [
    {y: "red", x0: moment('2019-02-01'), x: moment('2019-05-01'), color: "#ff0000"}, 
    {y: "red", x0: moment('2019-06-01'), x: moment('2019-10-01'), color: "#ff0000"},
    {y: "green", x0: moment('2019-01-01'), x: moment('2019-02-01'), color: "#00ff00"}, 
    {y: "green", x0: moment('2019-05-01'), x: moment('2019-06-01'), color: "#00ff00"},
    {y: "green", x0: moment('2019-10-01'), x: moment('2020-01-01'), color: "#00ff00"}
];

function getFirstAndLastDate(data){
    let firstDate = moment();
    data.forEach(d => {
        firstDate = d.x0.isBefore(firstDate) ? d.x0 : firstDate;
    });

    let lastDate = moment(0);
    data.forEach(d => {
        lastDate = d.x.isAfter(lastDate) ? d.x : lastDate; 
    });

    return {firstDate, lastDate};
}

const dateRange = [getFirstAndLastDate(data).firstDate, getFirstAndLastDate(data).lastDate];

storiesOf('App/HorizontalBarSeriesChart', module)
    .add('Usage examples', () => (
        <ThemeSelect defaultTheme="autoridad">
            <HorizontalBarSeriesChart data={data} yDomain={yDomain} xDomain={dateRange}/>
        </ThemeSelect>
    ));

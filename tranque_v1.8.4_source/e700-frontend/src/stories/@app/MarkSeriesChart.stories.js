import React from 'react';
import {storiesOf} from '@storybook/react';

import {Grid, Paper, useTheme} from '@material-ui/core';

import {MarkSeriesChart} from '@app/components/charts/MarkSeriesChart';
import moment from 'moment';
import {ThemeSelect} from 'stories/ThemeSelect';

const now = moment();

const multipleRows = [
    {
        label: 'first line',
        data: [
            now,
            moment(now).subtract(2, 'month'),
            moment(now).subtract(10, 'month'),
            moment(now).subtract(7, 'month'),
            moment(now).subtract(1, 'month')
        ]
    },
    {
        label: 'second line',
        data: [
            moment(now).subtract(4, 'month'),
            moment(now).subtract(5, 'month'),
            moment(now).subtract(8, 'month'),
            moment(now).subtract(1, 'month')
        ]
    },
    {
        label: 'third line',
        data: []
    },
    {
        label: 'fourth line with a long text',
        data: [
            moment(now).subtract(3, 'month'),
            moment(now).subtract(6, 'month'),
            moment(now).subtract(9, 'month')
        ]
    }
];

const denseData = [];
for (let i = 0; i < 80; i++) {
    denseData.push(moment(now).subtract(i, 'day'));
}

const colors = ['green', 'black', 'yellow', 'orange'];

const examples = [
    {
        title: 'multiple rows',
        data: multipleRows
    },
    {
        title: 'empty',
        data: []
    },
    {
        title: 'single row',
        data: [multipleRows[0]]
    },
    {
        title: 'two rows',
        data: [multipleRows[0], multipleRows[1]]
    },
    {
        title: 'three rows',
        data: [multipleRows[0], multipleRows[1], multipleRows[2]]
    },
    {
        title: 'custom colors',
        data: multipleRows.map((x, i) => ({...x, color: colors[i]}))
    },
    {
        title: 'overlapping data',
        data: [{
            label: `${denseData.length} points`,
            data: denseData
        }]
    }
];

function Example({key, title, data}) {
    const theme = useTheme();
    const style = {
        padding: '16px',
        border: '1px solid white',
        borderRadius: '2px',
        borderColor: theme.palette.text.disabled,
        color: theme.palette.text.primary
    };
    return (
        <Grid key={key} item container xs={12} style={style}>
            <Grid item xs={3}>
                <div>{title}</div>
                <pre>props: {JSON.stringify({data: data}, undefined, 2)}</pre>
            </Grid>
            <Grid item xs={9}>
                <Paper>
                    <MarkSeriesChart data={data}/>
                </Paper>
            </Grid>
        </Grid>
    );
}

storiesOf('App/MarkSeriesChart', module)
    .add('Usage examples', () => (
        <ThemeSelect defaultTheme="autoridad">
            <Grid container spacing={2}>
                {examples.map((p, i) => <Grid key={i} item container><Example {...p}/></Grid>)}
            </Grid>
        </ThemeSelect>
    ));

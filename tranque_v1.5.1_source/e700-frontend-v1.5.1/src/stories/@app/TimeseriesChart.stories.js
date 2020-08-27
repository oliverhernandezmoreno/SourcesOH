import React from 'react';

import {storiesOf} from '@storybook/react';

import {Grid, Paper, useTheme} from '@material-ui/core';

import 'react-vis/dist/style.css';
import moment from 'moment';
import {ThemeSelect} from 'stories/ThemeSelect';
import TimeseriesChart from '@app/components/charts/TimeseriesChart';

const now = moment();

const lines = [
    {
        label: 'first group',
        data: [
            [
                {x: now, y: 5},
                {x: moment(now).subtract(2, 'month'), y: 2},
                {x: moment(now).subtract(10, 'month'), y: 3},
                {x: moment(now).subtract(7, 'month'), y: 1},
                {x: moment(now).subtract(1, 'month'), y: 8}
            ],
            [
                {x: moment(now).subtract(12, 'month'), y: 2},
                {x: moment(now).subtract(20, 'month'), y: 3},
                {x: moment(now).subtract(17, 'month'), y: 1},
                {x: moment(now).subtract(11, 'month'), y: 8}
            ]
        ]
    },
    {
        label: 'second group',
        data: [
            [
                {x: moment(now).subtract(4, 'month'), y: 3},
                {x: moment(now).subtract(5, 'month'), y: 4},
                {x: moment(now).subtract(8, 'month'), y: 7},
                {x: moment(now).subtract(1, 'month'), y: 5}
            ]
        ]
    },
    {
        label: 'third group',
        data: []
    },
    {
        label: 'fourth group with a long text',
        data: [
            [
                {x: moment(now).subtract(3, 'month'), y: 4},
                {x: moment(now).subtract(6, 'month'), y: 1},
                {x: moment(now).subtract(9, 'month'), y: 1}
            ]
        ]
    }
];

const areas = [
    {
        label: 'first group',
        data: [
            [
                {x: now, y: 5, y0: 5},
                {x: moment(now).subtract(1, 'month'), y: 8, y0: 4},
                {x: moment(now).subtract(2, 'month'), y: 2, y0: 0},
                {x: moment(now).subtract(7, 'month'), y: 1, y0: 1},
                {x: moment(now).subtract(10, 'month'), y: 3, y0: 0}
            ],
            [
                {x: moment(now).subtract(11, 'month'), y: 8, y0: 4},
                {x: moment(now).subtract(12, 'month'), y: 2, y0: 1},
                {x: moment(now).subtract(17, 'month'), y: 1, y0: 0},
                {x: moment(now).subtract(20, 'month'), y: 3, y0: 1}
            ]
        ]
    },
    {
        label: 'second group',
        data: [
            [
                {x: moment(now).subtract(1, 'month'), y: 12, y0: 2},
                {x: moment(now).subtract(2, 'month'), y: 4, y0: 0},
                {x: moment(now).subtract(7, 'month'), y: 3, y0: 0},
                {x: moment(now).subtract(10, 'month'), y: 4, y0: 0}
            ]
        ]
    },
    {
        label: 'third group',
        data: []
    },
    {
        label: 'fourth area',
        data: [
            [
                {x: moment(now).subtract(3, 'month'), y: 4},
                {x: moment(now).subtract(6, 'month'), y: 1},
                {x: moment(now).subtract(9, 'month'), y: 1}
            ]
        ]
    }
];

const colors = ['green', 'black', 'yellow', 'orange'];

const examples = [
    {
        title: 'full features',
        chartProps: {
            data: lines,
            areas: areas,
            units: {x: 'Tiempo?', y: 'valor y'},
            thresholds: [{value: 5, label: 'some threshold at 5'}],
            minX: moment().subtract(3, 'year'),
            maxX: moment().add(2, 'months'),
            minY: -1,
            maxY: 12
        }
    },
    {
        title: 'empty',
        chartProps: {
            data: [],
            areas: []
        }
    },
    {
        title: 'single value, empty area',
        chartProps: {
            data: [{
                label: 'third group',
                data: [[{x: moment(), y: 3}]]
            }],
            areas: [],
            minY: 0
        }
    },
    {
        title: 'single line group',
        chartProps: {
            data: [lines[0]]
        }
    },
    {
        title: 'two line groups',
        chartProps: {
            data: [lines[0], lines[1]]
        }
    },
    {
        title: 'three line groups (one empty)',
        chartProps: {
            data: [lines[0], lines[1], lines[2]]
        }
    },
    {
        title: 'custom line colors',
        chartProps: {
            data: lines.map((x, i) => ({...x, color: colors[i]}))
        }
    },
    {
        title: 'single area group',
        chartProps: {
            data: [lines[0]],
            areas: [areas[0]]
        }
    },
    {
        title: 'two area groups',
        chartProps: {
            data: [lines[0], lines[1]],
            areas: [areas[0], areas[1]]
        }
    },
    {
        title: 'three area groups (one empty)',
        chartProps: {
            data: [lines[0], lines[1], lines[2]],
            areas: [areas[0], areas[1], areas[2]]
        }
    },
    {
        title: 'custom area colors',
        chartProps: {
            data: lines.map((x, i) => ({...x, color: colors[i]})),
            areas: areas.map((x, i) => ({...x, color: colors[i]}))
        }
    }
];

function Example({key, title, chartProps}) {
    const theme = useTheme();
    const style = {
        padding: '16px',
        border: '1px solid white',
        borderRadius: '2px',
        borderColor: theme.palette.text.disabled,
        color: theme.palette.text.primary
    };
    return (
        <Grid key={key} item container xs={12} style={style} spacing={1}>
            <Grid item xs={3}>
                <div>{title}</div>
                <div style={{maxHeight: '350px', overflow: 'auto'}}>
                    <pre>props: {JSON.stringify(chartProps, undefined, 1)}</pre>
                </div>
            </Grid>
            <Grid item xs={9}>
                <Paper>
                    <TimeseriesChart {...chartProps}/>
                </Paper>
            </Grid>
        </Grid>
    );
}

storiesOf('App/TimeseriesChart', module)
    .add('Usage examples', () => (
        <ThemeSelect defaultTheme="minera">
            <Grid container spacing={2}>
                {examples.map((p, i) => <Grid key={i} item container><Example {...p}/></Grid>)}
            </Grid>
        </ThemeSelect>
    ));

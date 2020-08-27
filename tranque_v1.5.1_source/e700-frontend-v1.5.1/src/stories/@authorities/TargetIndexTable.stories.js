import React from 'react';

import theme from '@authorities/theme';

import {storiesOf} from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import {TargetIndexTable} from '@authorities/components/target/TargetIndexTable';
import {Container} from '@material-ui/core';
import moment from 'moment';

const empty = {
    title: '',
    subtitle: '',
    groups: [],
    timeseries: [],
    target: ''
};

const singleGroup = {
    title: 'ESTABILIDAD FÍSICA',
    subtitle: 'ESTABILIDAD FÍSICA',
    groups: [
        {
            templates: [
                {
                    visible: true,
                    template_name: 'template-1',
                    label: 'Estatus público (informa alertas)'
                },
                {
                    visible: false,
                    template_name: 'template-2',
                    label: 'Estatus interno (informa eventos)'
                }
            ]
        }
    ],
    timeseries: [],
    target: 'test'
};

const twoGroups = {
    title: 'RIESGO AGUAS SUBTERRÁNEAS',
    subtitle: 'AGUAS CIRCUNDANTES',
    groups: [
        {
            header: 'Valores de referencia según RCA u otros compromisos',
            templates: [
                {
                    visible: true,
                    template_name: 'template-1',
                    label: 'Uso Riego'
                },
                {
                    visible: true,
                    template_name: 'template-2',
                    label: 'Uso Consumo humano/bebida animal'
                },
                {
                    visible: true,
                    template_name: 'template-3',
                    label: 'Uso Recreacional'
                },
                {
                    visible: true,
                    template_name: 'template-4',
                    label: 'Uso Vida acuática'
                }
            ]
        },
        {
            header: 'Valores de referencia según estándar plataforma',
            templates: [
                {
                    visible: false,
                    template_name: 'template-5',
                    label: 'Uso Riego'
                },
                {
                    visible: false,
                    template_name: 'template-6',
                    label: 'Uso Consumo humano/bebida animal'
                },
                {
                    visible: false,
                    template_name: 'template-7',
                    label: 'Uso Recreacional'
                },
                {
                    visible: false,
                    template_name: 'template-8',
                    label: 'Uso Vida acuática'
                }
            ]
        }
    ],
    timeseries: [],
    target: 'test'
};

function getTimeseries() {
    const templates = [];
    for (let i = 1; i < 9; i++) {
        templates.push(`template-${i}`);
    }
    const timeseries = [];
    const now = moment();
    templates.forEach((t, i) => {
        const events = [];
        for (let j = 0; j < i; j++) {
            const date = moment(now).subtract(j, 'day');
            events.push({
                '@timestamp': date.toISOString(),
                name: `test.${t}`,
                value: Math.random(),
                date
            });
        }
        timeseries.push({
            template_name: t,
            thresholds: [
                {
                    upper: '0.5',
                    lower: null,
                    kind: null
                }
            ],
            events
        });
    });
    return timeseries;
}

storiesOf('Authorities/TargetIndexTable', module)
    .addDecorator(muiTheme([theme]))
    .add('empty', () => (<Container maxWidth="md"><TargetIndexTable {...empty}/></Container>))
    .add('single group, two rows, no data', () => (
        <Container maxWidth="md"><TargetIndexTable {...singleGroup}/></Container>))
    .add('two groups, four rows, no data', () => (
        <Container maxWidth="md"><TargetIndexTable {...twoGroups}/></Container>))
    .add('single group, two rows', () => (
        <Container maxWidth="md"><TargetIndexTable {...singleGroup} timeseries={getTimeseries()}/></Container>))
    .add('two groups, four rows', () => (
        <Container maxWidth="md"><TargetIndexTable {...twoGroups} timeseries={getTimeseries()}/></Container>));

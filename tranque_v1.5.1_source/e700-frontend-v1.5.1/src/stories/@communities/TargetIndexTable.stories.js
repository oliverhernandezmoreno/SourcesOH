import React from 'react';
import theme from '@communities/theme';
import { storiesOf } from '@storybook/react';
import {TargetIndexTable} from '@communities/components/target/TargetIndexTable';
import {muiTheme} from 'storybook-addon-material-ui';
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
    for (let i = 0; i < 9; i++) {
        templates.push(`template-${i}`);
    }
    const timeseries = [];
    const now = moment();

    templates.forEach((t, i) => {
        const events = [];
        const date = moment(now);
        events.push({
            '@timestamp': date.toISOString(),
            name: `test.${t}`,
            value: Math.random(),
            date
        });
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
storiesOf('Communities/TargetIndexTable communities', module)
    .addDecorator(muiTheme([theme]))
    .add('empty', () => (<Container maxWidth="md"><TargetIndexTable {...empty}/></Container>))
    .add('single',() => (<Container maxWidth="md"><TargetIndexTable {...singleGroup}/></Container>))
    .add('two Group', () => (<Container maxWidth="md"><TargetIndexTable {...twoGroups} timeseries={getTimeseries()}/></Container>));

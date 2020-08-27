import React from 'react';
import theme from '@miners/theme';
import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import ScaleOption from '@alerts_events/components/ticket/detail/ActionsSection/ScaleOption';
import { groupNames, A, B, C, D, YELLOW_ALERT, RED_ALERT } from '@alerts_events/constants/ticketGroups';
import {ticket} from './data/Ticket';
import {getUser} from '../data/User';

const divStyle = {
    backgroundColor: theme.palette.secondary.light,
    color: '#ffffff'
};

const scaleOptions = {
    [A]: [
        {
            label: 'Escalar de ' + groupNames[A] + ' a ' + groupNames[B],
            subLabel: '',
            value: B},
        {
            label: 'Escalar de ' + groupNames[A] + ' a ' + groupNames[C],
            subLabel: 'Esta opción activará una alerta amarilla que será visible en el sitio público.' +
                      'La gestión de la alerta es exclusiva de la autoridad.',
            value: C
        },
        {
            label: 'Escalar de ' + groupNames[A] + ' a ' + groupNames[D],
            subLabel: 'Esta opción activará una alerta roja que será visible en el sitio público. ' +
                      'La gestión de la alerta es exclusiva de la autoridad.',
            value: D
        }
    ],
    [B]: [
        {
            label: 'Escalar de ' + groupNames[B] + ' a ' + groupNames[C],
            subLabel: 'Esta opción activará una alerta amarilla que será visible en el sitio público. ' +
                      'La gestión de la alerta es exclusiva de la autoridad.',
            value: C
        },
        {
            label: 'Escalar de ' + groupNames[B] + ' a ' + groupNames[D],
            subLabel: 'Esta opción activará una alerta roja que será visible en el sitio público. ' +
                      'La gestión de la alerta es exclusiva de la autoridad.',
            value: D
        }
    ],
    [C]: [
        {
            label: 'Escalar de ' + groupNames[C] + ' a ' + groupNames[D],
            subLabel: 'Esta opción activará una alerta roja que será visible en el sitio público. ' +
                      'La gestión de la alerta es exclusiva de la autoridad.',
            value: D
        }
    ],
    [YELLOW_ALERT]: [
        {
            label: 'Escalar de ' + groupNames[YELLOW_ALERT] + ' a ' + groupNames[RED_ALERT],
            subLabel: '',
            value: RED_ALERT
        }
    ]
}

const conditions = [
    {complete: true, description: "Condición 1"},
    {complete: false, description: "Condición 2"},
    {complete: false, description: "Condición 3"},
    {complete: false, description: "Autorización", authorization: 'autoridad-2'}
]

const completed_conditions = [
    {complete: true, description: "Condición 1"},
    {complete: true, description: "Condición 2"},
    {complete: true, description: "Condición 3"},
]

function getConditions(completed) {
    if (completed) return completed_conditions;
    return conditions;
}

function getEscalateConditions(completed) {

    return {
        [B]: getConditions(completed),
        [C]: getConditions(completed),
        [D]: getConditions(completed),
        [RED_ALERT]: getConditions(completed)
    }
}

function getScaleOption(group, nextGroup, completed) {
    return (<div style={divStyle}>
        <ScaleOption
            user={getUser({}, null)}
            option={scaleOptions[group].find(o=>o.value === nextGroup)}
            conditions={getEscalateConditions(completed)}
            group={group}
            ticket={ticket}
            onTicketUpdate={() => {}}
            onRequest={() => {}}
            requests={[]}
        />
    </div>);
}



storiesOf('Alerts&Events/ticket-detail/ActionsSection/EscalateOption', module)
    .addDecorator(muiTheme([theme]))
    .add('ScaleOption A -> B', () => getScaleOption(A, B, false))
    .add('ScaleOption A -> C', () => getScaleOption(A, C, false))
    .add('ScaleOption A -> D', () => getScaleOption(A, D, false))
    .add('ScaleOption B -> C', () => getScaleOption(B, C, false))
    .add('ScaleOption B -> D', () => getScaleOption(B, D, false))
    .add('ScaleOption C -> D', () => getScaleOption(C, D, false))
    .add('ScaleOption YELLOW -> RED', () => getScaleOption(YELLOW_ALERT, RED_ALERT, false))
    .add('ScaleOption A -> B (all conditions completed)', () => getScaleOption(A, B, true))

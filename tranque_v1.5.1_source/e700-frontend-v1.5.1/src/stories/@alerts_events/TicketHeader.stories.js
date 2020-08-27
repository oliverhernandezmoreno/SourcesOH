import React from 'react';
import theme from '@miners/theme';
import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import TicketHeader from '@alerts_events/components/ticket/TicketHeader';
import { A, B, C, D, RED_ALERT, YELLOW_ALERT, CLOSED } from '@alerts_events/constants/ticketGroups';
import {getTicket} from './data/Ticket';

const divStyle = {
    backgroundColor: theme.palette.secondary.light,
    color: '#ffffff'
};

function getTicketHeader(changes, level) {
    return (<div style={divStyle}>
        <TicketHeader ticket={getTicket({
            ...changes,
            result_state: {level}})}
        />
    </div>);
}

storiesOf('Alerts&Events/TicketHeader/Active', module)
    .addDecorator(muiTheme([theme]))
    .add('A', () => getTicketHeader({state: A}, 1))
    .add('B', () => getTicketHeader({state: B}, 2))
    .add('C', () => getTicketHeader({state: C}, 3))
    .add('D', () => getTicketHeader({state: D}, 4))
    .add('YELLOW ALERT', () => getTicketHeader({state: YELLOW_ALERT}, 5))
    .add('RED ALERT', () => getTicketHeader({state: RED_ALERT},6))

storiesOf('Alerts&Events/TicketHeader/Closed', module)
    .addDecorator(muiTheme([theme]))
    .add('A', () => getTicketHeader({state: CLOSED}, 1))
    .add('B', () => getTicketHeader({state: CLOSED}, 2))
    .add('C', () => getTicketHeader({state: CLOSED}, 3))
    .add('D', () => getTicketHeader({state: CLOSED}, 4))
    .add('YELLOW ALERT', () => getTicketHeader({state: CLOSED}, 5))
    .add('RED ALERT', () => getTicketHeader({state: CLOSED}, 6))

storiesOf('Alerts&Events/TicketHeader/Archived', module)
    .addDecorator(muiTheme([theme]))
    .add('A', () => getTicketHeader({archived: true}, 1))
    .add('B', () => getTicketHeader({archived: true}, 2))
    .add('C', () => getTicketHeader({archived: true}, 3))
    .add('D', () => getTicketHeader({archived: true}, 4))

storiesOf('Alerts&Events/TicketHeader/NotEvaluable', module)
    .addDecorator(muiTheme([theme]))
    .add('A', () => getTicketHeader({evaluable: false}, 1))
    .add('B', () => getTicketHeader({evaluable: false}, 2))
    .add('C', () => getTicketHeader({evaluable: false}, 3))
    .add('D', () => getTicketHeader({evaluable: false}, 4))

import React from 'react';
import theme from '@miners/theme';
import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import TicketHeader from '@alerts_events/components/ticket/TicketHeader';
import { A, B, C, D, RED_ALERT, YELLOW_ALERT, CLOSED } from '@alerts_events/constants/ticketGroups';
import {getTicket} from './data/Ticket';
import { getUser } from 'stories/data/User';
import { authority_2_actions, miner_1_actions } from './data/actions';

const divStyle = {
    backgroundColor: theme.palette.secondary.light,
    color: '#ffffff'
};

function getTicketHeader(changes, level, user) {
    return (<div style={divStyle}>
        <TicketHeader
            ticket={getTicket({
                ...changes,
                result_state: {level}})}
            user={user}
        />
    </div>);
}

const minerUser = getUser({}, miner_1_actions);
const authorityUser = getUser({}, authority_2_actions);

storiesOf('Alerts&Events/TicketHeader/Active', module)
    .addDecorator(muiTheme([theme]))
    .add('A', () => getTicketHeader({state: A}, 1, minerUser))
    .add('B', () => getTicketHeader({state: B}, 2, minerUser))
    .add('C', () => getTicketHeader({state: C}, 3, minerUser))
    .add('D', () => getTicketHeader({state: D}, 4, minerUser))
    .add('YELLOW ALERT', () => getTicketHeader({state: YELLOW_ALERT}, 5, minerUser))
    .add('RED ALERT', () => getTicketHeader({state: RED_ALERT},6, minerUser))

storiesOf('Alerts&Events/TicketHeader/Closed', module)
    .addDecorator(muiTheme([theme]))
    .add('A', () => getTicketHeader({state: CLOSED}, 1, minerUser))
    .add('B', () => getTicketHeader({state: CLOSED}, 2, minerUser))
    .add('C', () => getTicketHeader({state: CLOSED}, 3, minerUser))
    .add('D', () => getTicketHeader({state: CLOSED}, 4, minerUser))
    .add('YELLOW ALERT', () => getTicketHeader({state: CLOSED}, 5, minerUser))
    .add('RED ALERT', () => getTicketHeader({state: CLOSED}, 6, minerUser))

storiesOf('Alerts&Events/TicketHeader/Archived', module)
    .addDecorator(muiTheme([theme]))
    .add('A', () => getTicketHeader({archived: true}, 1, minerUser))
    .add('B', () => getTicketHeader({archived: true}, 2, minerUser))
    .add('C', () => getTicketHeader({archived: true}, 3, minerUser))
    .add('D', () => getTicketHeader({archived: true}, 4, minerUser))

storiesOf('Alerts&Events/TicketHeader/NotEvaluable', module)
    .addDecorator(muiTheme([theme]))
    .add('A', () => getTicketHeader({evaluable: false}, 1, minerUser))
    .add('B', () => getTicketHeader({evaluable: false}, 2, minerUser))
    .add('C', () => getTicketHeader({evaluable: false}, 3, minerUser))
    .add('D', () => getTicketHeader({evaluable: false}, 4, minerUser))

storiesOf('Alerts&Events/TicketHeader/AuthorityUser view', module)
    .addDecorator(muiTheme([theme]))
    .add('A', () => getTicketHeader({state: A}, 1, authorityUser))
    .add('B', () => getTicketHeader({state: B}, 2, authorityUser))
    .add('C', () => getTicketHeader({state: C}, 3, authorityUser))
    .add('D', () => getTicketHeader({state: D}, 4, authorityUser))
    .add('YELLOW ALERT', () => getTicketHeader({state: YELLOW_ALERT}, 5, authorityUser))
    .add('RED ALERT', () => getTicketHeader({state: RED_ALERT}, 6, authorityUser))

import React from 'react';
import theme from '@miners/theme';
import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import TicketListCard from '@alerts_events/components/ticket/TicketListCard';
import { A, B, C, D, RED_ALERT, YELLOW_ALERT, CLOSED } from '@alerts_events/constants/ticketGroups';
import {getTicket, ticket} from './data/Ticket';
import { getUser } from 'stories/data/User';


function getTicketListCard(changes, level) {
    return (<TicketListCard
        user={getUser()}
        ticket={getTicket({...changes,
            result_state: {...ticket.result_state, level}})}
    />);
}

storiesOf('Alerts&Events/TicketListCard/Active', module)
    .addDecorator(muiTheme([theme]))
    .add('Red alert ticket', () => getTicketListCard({state: RED_ALERT}, 6))
    .add('Yellow alert ticket', () => getTicketListCard({state: YELLOW_ALERT}, 5))
    .add('Ticket A', () => getTicketListCard({state: A}, 1))
    .add('Ticket B', () => getTicketListCard({state: B}, 2))
    .add('Ticket C', () => getTicketListCard({state: C}, 3))
    .add('Ticket D', () => getTicketListCard({state: D}, 4))


storiesOf('Alerts&Events/TicketListCard/Closed', module)
    .addDecorator(muiTheme([theme]))
    .add('Ticket A', () => getTicketListCard({state: CLOSED}, 1))
    .add('Ticket B', () => getTicketListCard({state: CLOSED}, 2))
    .add('Ticket C', () => getTicketListCard({state: CLOSED}, 3))
    .add('Ticket D', () => getTicketListCard({state: CLOSED}, 4))
    .add('Yellow alert ticket ', () => getTicketListCard({state: CLOSED}, 5))
    .add('Red alert ticket', () => getTicketListCard({state: CLOSED}, 6))


storiesOf('Alerts&Events/TicketListCard/Archived', module)
    .addDecorator(muiTheme([theme]))
    .add('Ticket A', () => getTicketListCard({state: A, archived: true}, 1))
    .add('Ticket B', () => getTicketListCard({state: B, archived: true}, 2))
    .add('Ticket C', () => getTicketListCard({state: C, archived: true}, 3))
    .add('Ticket D', () => getTicketListCard({state: D, archived: true}, 4))
    .add('Yellow alert ticket ', () => getTicketListCard({state: YELLOW_ALERT, archived: true}, 5))
    .add('Red alert ticket', () => getTicketListCard({state: RED_ALERT, archived: true}, 6))


storiesOf('Alerts&Events/TicketListCard/Unevaluable', module)
    .addDecorator(muiTheme([theme]))
    .add('Ticket A', () => getTicketListCard({state: A, evaluable: false}, 1))
    .add('Ticket B', () => getTicketListCard({state: B, evaluable: false}, 2))
    .add('Ticket C', () => getTicketListCard({state: C, evaluable: false}, 3))
    .add('Ticket D', () => getTicketListCard({state: D, evaluable: false}, 4))
    .add('Yellow alert ticket ', () => getTicketListCard({state: YELLOW_ALERT, evaluable: false}, 5))
    .add('Red alert ticket', () => getTicketListCard({state: RED_ALERT, evaluable: false}, 6))

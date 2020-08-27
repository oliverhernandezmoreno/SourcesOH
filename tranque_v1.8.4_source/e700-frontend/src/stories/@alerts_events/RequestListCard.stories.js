import React from 'react';
import theme from '@miners/theme';
import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import RequestListCard from '@alerts_events/components/requests/RequestListCard';
import {getRequest} from './data/authorizationRequests';
import { PENDING, APPROVED, DENIED } from '@alerts_events/constants/authorizationStates';
import {getTicket} from './data/Ticket';
import { C, RED_ALERT } from '@alerts_events/constants/ticketGroups';

const Cticket = getTicket({result_state: {level: 3}, state: C});
const REDticket = getTicket({result_state: {level: 6}, state: RED_ALERT});

storiesOf('Alerts&Events/RequestListCard/Close', module)
    .addDecorator(muiTheme([theme]))
    .add('Pending', () =>
        <RequestListCard
            request={
                getRequest(null,  {
                    authorization: 'ticket.C.close.authorization.authority-2',
                    status: PENDING,
                    ticket: Cticket
                }, 0, '')
            }
            onClick={() => {}}/>)
    .add('Approved', () =>
        <RequestListCard
            request={
                getRequest(null,  {
                    authorization: 'ticket.C.close.authorization.authority-2',
                    status: APPROVED,
                    ticket: Cticket
                }, 0, '')
            }
            onClick={() => {}}/>)
    .add('Denied', () =>
        <RequestListCard
            request={
                getRequest(null,  {
                    authorization: 'ticket.C.close.authorization.authority-2',
                    status: DENIED,
                    ticket: Cticket
                }, 0, '')
            }
            onClick={() => {}}/>)

storiesOf('Alerts&Events/RequestListCard/Archive', module)
    .addDecorator(muiTheme([theme]))
    .add('Pending', () =>
        <RequestListCard
            request={
                getRequest(null,  {
                    authorization: 'ticket.C.archive.authorization.authority-2',
                    status: PENDING,
                    ticket: Cticket
                }, 0, '')
            }
            onClick={() => {}}/>)
    .add('Approved', () =>
        <RequestListCard
            request={
                getRequest(null,  {
                    authorization: 'ticket.C.archive.authorization.authority-2',
                    status: APPROVED,
                    ticket: Cticket
                }, 0, '')
            }
            onClick={() => {}}/>)
    .add('Denied', () =>
        <RequestListCard
            request={
                getRequest(null,  {
                    authorization: 'ticket.C.archive.authorization.authority-2',
                    status: DENIED,
                    ticket: Cticket
                }, 0, '')
            }
            onClick={() => {}}/>)

storiesOf('Alerts&Events/RequestListCard/Escalate', module)
    .addDecorator(muiTheme([theme]))
    .add('Pending', () =>
        <RequestListCard
            request={
                getRequest(null,  {
                    authorization: 'ticket.C.escalate.D.authorization.authority-2',
                    status: PENDING,
                    ticket: Cticket
                }, 0, '')
            }
            onClick={() => {}}/>)
    .add('Approved', () =>
        <RequestListCard
            request={
                getRequest(null,  {
                    authorization: 'ticket.C.escalate.D.authorization.authority-2',
                    status: APPROVED,
                    ticket: Cticket
                }, 0, '')
            }
            onClick={() => {}}/>)
    .add('Denied', () =>
        <RequestListCard
            request={
                getRequest(null,  {
                    authorization: 'ticket.C.escalate.D.authorization.authority-2',
                    status: DENIED,
                    ticket: Cticket
                }, 0, '')
            }
            onClick={() => {}}/>)

storiesOf('Alerts&Events/RequestListCard/Unescalate', module)
    .addDecorator(muiTheme([theme]))
    .add('Pending', () =>
        <RequestListCard
            request={
                getRequest(null,  {
                    authorization: 'ticket.RED.escalate.YELLOW.authorization.authority-2',
                    status: PENDING,
                    ticket: REDticket
                }, 0, '')
            }
            onClick={() => {}}/>)
    .add('Approved', () =>
        <RequestListCard
            request={
                getRequest(null,  {
                    authorization: 'ticket.RED.escalate.YELLOW.authorization.authority-2',
                    status: APPROVED,
                    ticket: REDticket
                }, 0, '')
            }
            onClick={() => {}}/>)
    .add('Denied', () =>
        <RequestListCard
            request={
                getRequest(null,  {
                    authorization: 'ticket.RED.escalate.YELLOW.authorization.authority-2',
                    status: DENIED,
                    ticket: REDticket
                }, 0, '')
            }
            onClick={() => {}}/>)

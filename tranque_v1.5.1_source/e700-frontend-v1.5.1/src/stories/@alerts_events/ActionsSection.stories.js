import React from 'react';
import theme from '@miners/theme';
import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import ActionsSection from '@alerts_events/components/ticket/detail/ActionsSection/ActionsSection';
import {getTicket} from './data/Ticket';
import { A, B, C, D, YELLOW_ALERT, RED_ALERT } from '@alerts_events/constants/ticketGroups';
import { getRequest } from './data/authorizationRequests';
import { APPROVED } from '@alerts_events/constants/authorizationStates';
import {getUser} from '../data/User';


const divStyle = {
    backgroundColor: theme.palette.secondary.light,
    color: '#ffffff'
};

const tabNames = {
    close: 'Cerrar',
    scale: 'Escalar',
    archive: 'Archivar',
    unarchive: 'Desarchivar',
    unscale: 'Desescalar'
};

const conditions = [
    {complete: true, description: "Condición 1"},
    {complete: false, description: "Condición 2"},
    {complete: false, description: "Condición 3"},
    {complete: false, description: "Autorización", authorization: 'autoridad-2'}
]

const escalate_conditions = {
    [B]: conditions,
    [C]: conditions,
    [D]: conditions,
    [RED_ALERT]: conditions,
    [YELLOW_ALERT]: conditions
}

const user = getUser({}, null);

function getActionsSection(level, tabValue, conditions_type, pendingRequest, requestAction, requesting) {
    const conds = conditions_type === 'escalate_conditions' ? escalate_conditions : conditions;
    const ticket = getTicket({ [conditions_type]: conds, result_state: { level } });
    const request = getRequest(
        ticket,
        pendingRequest ? {} : {status: APPROVED, authorization: requestAction}, 0, '');
    const oldRequest = getRequest(ticket, {status: APPROVED}, 0, '');
    return (<div style={divStyle}>
        <ActionsSection
            handleTabChange={() => {}}
            tabValue={tabValue}
            ticket={ticket}
            user={user}
            onTicketUpdate={() => {}}
            onRequest={() => {}}
            requests={[request, oldRequest, oldRequest, oldRequest]}
            requesting={requesting}
        />
    </div>);
}


// CLOSE & ARCHIVE
storiesOf('Alerts&Events/ticket-detail/ActionsSection', module)
    .addDecorator(muiTheme([theme]))
    .add('Close tab', () => getActionsSection(2, tabNames.close, 'close_conditions', false, null, false))
    .add('Archive tab', () => getActionsSection(2, tabNames.archive, 'archive_conditions', false, null, false))
    .add('Unscale tab', () => getActionsSection(6, tabNames.unscale, 'escalate_conditions', false, null, false))

    .add('Close tab (requesting)', () => getActionsSection(2, tabNames.close, 'close_conditions', false, null, true))
    .add('Archive tab (requesting)', () => getActionsSection(2, tabNames.archive, 'archive_conditions', false, null, true))
    .add('Unscale tab (requesting)', () => getActionsSection(6, tabNames.unscale, 'escalate_conditions', false, null, true))


// SCALE
storiesOf('Alerts&Events/ticket-detail/ActionsSection/Escalate', module)
    .addDecorator(muiTheme([theme]))
    .add(A, () => getActionsSection(1, tabNames.scale, 'escalate_conditions', false, null, false))
    .add(B, () => getActionsSection(2, tabNames.scale, 'escalate_conditions', false, null, false))
    .add(C, () => getActionsSection(3, tabNames.scale, 'escalate_conditions', false, null, false))
    .add(YELLOW_ALERT, () => getActionsSection(5, tabNames.scale, 'escalate_conditions', false, null, false))

    .add(A + '(requesting)', () => getActionsSection(1, tabNames.scale, 'escalate_conditions', false, null, true))
    .add(YELLOW_ALERT + '(requesting)', () => getActionsSection(5, tabNames.scale, 'escalate_conditions', false, null, true))

// With pending requests
const closeRequest = 'ticket.B.close.authorization.authority-2';
const archiveRequest = 'ticket.B.archive.authorization.authority-2';
const unescalateRequest = 'ticket.RED.escalate.YELLOW.authorization.authority-2';
const escalateRequest = 'ticket.B.escalate.C.authorization.authority-2';

storiesOf('Alerts&Events/ticket-detail/ActionsSection/PendingRequest', module)
    .addDecorator(muiTheme([theme]))
    .add('Close tab', () => getActionsSection(2, tabNames.close, 'close_conditions', true, closeRequest, false))
    .add('Archive tab', () => getActionsSection(2, tabNames.archive, 'archive_conditions', true, archiveRequest, false))
    .add('Unscale tab', () => getActionsSection(6, tabNames.unscale, 'escalate_conditions', true, unescalateRequest, false))
    .add(B, () => getActionsSection(2, tabNames.scale, 'escalate_conditions', true, escalateRequest, false))

import React from 'react';
import theme from '@miners/theme';
import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import AuthorizationSection from '@alerts_events/components/ticket/detail/AuthorizationSection';
import {getTicket} from './data/Ticket';
import {getUser} from '../data/User';
import {getRequest} from './data/authorizationRequests';
import {PENDING, APPROVED, DENIED} from '@alerts_events/constants/authorizationStates';
import {APPROVING, DENYING} from '@alerts_events/components/ticket/detail/AuthorizationSection';

const divStyle = {
    backgroundColor: theme.palette.secondary.light,
    color: '#ffffff'
};

const default_action = 'ticket.C.archive.authorization.authority-2';
const escalate_action = 'ticket.C.escalate.D.authorization.authority-2';
const common_user = {username: 'Usuario'};
const petitioner_user = {username: 'Usuario_con_rol_solicitante'};
const authorizator_user = {username: 'Usuario_con_rol_autorizador'};

function getAuthorizationSection(user, action, request_status, docs_number, comment, loading) {
    const ticket = getTicket();
    return (<div style={divStyle}>
        <AuthorizationSection
            user={user}
            request={getRequest(ticket, {authorization: action, status: request_status}, docs_number, comment)}
            ticket={ticket}
            onComment={() => {}}
            onDownload={() => {}}
            onResolve={() => {}}
            loadingType={loading}
        />
    </div>);
}


storiesOf('Alerts&Events/ticket-detail/AuthorizationSection/Pending_request', module)
    .addDecorator(muiTheme([theme]))
    .add('Common user', () =>
        getAuthorizationSection(getUser(common_user, []), PENDING, null, null, null))
    .add('Petitioner user', () =>
        getAuthorizationSection(getUser(petitioner_user, [default_action + '.request']), default_action, PENDING, null, null, null))
    .add('Authorizator user', () =>
        getAuthorizationSection(getUser(authorizator_user, [default_action + '.resolve']), default_action, PENDING, null, null, null))
    .add('Authorizator user (approving)', () =>
        getAuthorizationSection(getUser(authorizator_user, [default_action + '.resolve']), default_action, PENDING, null, null, APPROVING))
    .add('Authorizator user (denying)', () =>
        getAuthorizationSection(getUser(authorizator_user, [default_action + '.resolve']), default_action, PENDING, null, null, DENYING))

storiesOf('Alerts&Events/ticket-detail/AuthorizationSection/Aproved_request', module)
    .addDecorator(muiTheme([theme]))
    .add('Comment & 2 documents', () =>
        getAuthorizationSection(getUser(common_user, []), default_action, APPROVED, 2, true, null))
    .add('Comment & 2 documents (petitioner)', () =>
        getAuthorizationSection(getUser(petitioner_user, [default_action + '.request']), default_action, APPROVED, 2, true, null))
    .add('Comment & 2 documents (authorizator)', () =>
        getAuthorizationSection(getUser(authorizator_user, [default_action + '.resolve']), default_action, APPROVED, 2, true, null))


storiesOf('Alerts&Events/ticket-detail/AuthorizationSection/Denied_request', module)
    .addDecorator(muiTheme([theme]))
    .add('Comment & 2 documents', () =>
        getAuthorizationSection(getUser(common_user, []), default_action, DENIED, 2, true, null))
    .add('Comment & 2 documents (petitioner)', () =>
        getAuthorizationSection(getUser(petitioner_user, [default_action + '.request']), default_action, DENIED, 2, true, null))
    .add('Comment & 2 documents (authorizator)', () =>
        getAuthorizationSection(getUser(authorizator_user, [default_action + '.resolve']), default_action, DENIED, 2, true, null))

// DENIED request is the same and for all users
storiesOf('Alerts&Events/ticket-detail/AuthorizationSection/Comments & Documents', module)
    .addDecorator(muiTheme([theme]))
    .add('0 attachments', () =>
        getAuthorizationSection(getUser(common_user, []), default_action, APPROVED, null, false, null))
    .add('Just a comment', () =>
        getAuthorizationSection(getUser(common_user, []), default_action, APPROVED, null, true, null))
    .add('2 documents', () =>
        getAuthorizationSection(getUser(common_user, []), default_action, APPROVED, 2, false, null))
    .add('10 documents & 1 comment', () =>
        getAuthorizationSection(getUser(common_user, []), default_action, APPROVED, 10, true, null))

// Escalate request examples
storiesOf('Alerts&Events/ticket-detail/AuthorizationSection/Escalate request', module)
    .addDecorator(muiTheme([theme]))
    .add('Pending', () =>
        getAuthorizationSection(getUser(common_user, []), escalate_action, PENDING, null, false, null))
    .add('Pending received', () =>
        getAuthorizationSection(getUser(authorizator_user, [escalate_action + '.resolve']), escalate_action, PENDING, null, null, null))
    .add('Approved', () =>
        getAuthorizationSection(getUser(common_user, []), escalate_action, APPROVED, 2, true, null))
    .add('Denied', () =>
        getAuthorizationSection(getUser(common_user, []), escalate_action, DENIED, 2, true, null))

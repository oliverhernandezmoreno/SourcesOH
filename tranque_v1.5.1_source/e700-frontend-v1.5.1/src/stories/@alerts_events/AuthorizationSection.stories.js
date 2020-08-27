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
const common_user = {username: 'Usuario'};
const petitioner_user = {username: 'Usuario_con_rol_solicitante'};
const authorizator_user = {username: 'Usuario_con_rol_autorizador'};





function getAuthorizationSection(user, request_status, docs_number, comment, loading) {
    const ticket = getTicket();
    return (<div style={divStyle}>
        <AuthorizationSection
            user={user}
            request={getRequest(ticket, {status: request_status}, docs_number, comment)}
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
        getAuthorizationSection(getUser(petitioner_user, [{name: default_action + '.request'}]), PENDING, null, null, null))
    .add('Authorizator user', () =>
        getAuthorizationSection(getUser(authorizator_user, [{name: default_action + '.resolve'}]), PENDING, null, null, null))
    .add('Authorizator user (approving)', () =>
        getAuthorizationSection(getUser(authorizator_user, [{name: default_action + '.resolve'}]), PENDING, null, null, APPROVING))
    .add('Authorizator user (denying)', () =>
        getAuthorizationSection(getUser(authorizator_user, [{name: default_action + '.resolve'}]), PENDING, null, null, DENYING))

storiesOf('Alerts&Events/ticket-detail/AuthorizationSection/Aproved_request', module)
    .addDecorator(muiTheme([theme]))
    .add('Comment & 2 documents', () =>
        getAuthorizationSection(getUser(common_user, []), APPROVED, 2, true, null))
    .add('Comment & 2 documents (petitioner)', () =>
        getAuthorizationSection(getUser(petitioner_user, [{name: default_action + '.request'}]), APPROVED, 2, true, null))
    .add('Comment & 2 documents (authorizator)', () =>
        getAuthorizationSection(getUser(authorizator_user, [{name: default_action + '.resolve'}]), APPROVED, 2, true, null))


storiesOf('Alerts&Events/ticket-detail/AuthorizationSection/Denied_request', module)
    .addDecorator(muiTheme([theme]))
    .add('Comment & 2 documents', () =>
        getAuthorizationSection(getUser(common_user, []), DENIED, 2, true, null))
    .add('Comment & 2 documents (petitioner)', () =>
        getAuthorizationSection(getUser(petitioner_user, [{name: default_action + '.request'}]), DENIED, 2, true, null))
    .add('Comment & 2 documents (authorizator)', () =>
        getAuthorizationSection(getUser(authorizator_user, [{name: default_action + '.resolve'}]), DENIED, 2, true, null))

// DENIED request is the same and for all users
storiesOf('Alerts&Events/ticket-detail/AuthorizationSection/Comments & Documents', module)
    .addDecorator(muiTheme([theme]))
    .add('0 attachments', () =>
        getAuthorizationSection(getUser(common_user, []), APPROVED, null, false, null))
    .add('Just a comment', () =>
        getAuthorizationSection(getUser(common_user, []), APPROVED, null, true, null))
    .add('2 documents', () =>
        getAuthorizationSection(getUser(common_user, []), APPROVED, 2, false, null))
    .add('10 documents & 1 comment', () =>
        getAuthorizationSection(getUser(common_user, []), APPROVED, 10, true, null))

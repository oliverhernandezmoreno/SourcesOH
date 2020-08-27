import React from 'react';
import theme from '@miners/theme';
import { storiesOf } from '@storybook/react';
import {Provider} from 'react-redux';
import {configureStore} from '@app/store';
import {muiTheme} from 'storybook-addon-material-ui';
import {getUser} from '../data/User';
import RequestsScopedList from '@alerts_events/components/requests/RequestsScopedList';
import {getRequest} from './data/authorizationRequests';
import { PENDING, APPROVED } from '@alerts_events/constants/authorizationStates';
import {getTicket} from './data/Ticket';

const store = configureStore();

const PETITIONER = 'solicitante';
const AUTHORIZER = 'autorizador';

const PENDING_RECEIVED = 'pendingReceived';
const pendingReceivedUserFilters = [PETITIONER];
const RESOLVED_RECEIVED = 'resolvedReceived';
const resolvedReceivedUserFilters = [PETITIONER, AUTHORIZER];
const PENDING_REQUESTED = 'pendingRequested';
const pendingRequestedUserFilters = [];
const RESOLVED_REQUESTED = 'resolvedRequested';
const resolvedRequestedUserFilters = [AUTHORIZER];

const petitionerUser = getUser({username: 'Usuario Minera-1', id: 0},[]); // Like Miner-1 (only requests)
const superUser = getUser({username: 'Usuario Autoridad-2', id: 1},[]); // Like Authority-2 (requests and resolves)
const authorizerUser = getUser({username: 'Usuario Autoridad-3', id: 2},[]); // Like Authority-3 (only resolves)
const authorizerUser2 = getUser({username: 'Usuario Autoridad-33', id: 3},[]); // Another Authority-3 (only resolves)

function getArchivingRequest(status) {
    return getRequest(null,  {
        authorization: 'ticket.C.archive.authorization.authority-2',
        created_at: '2020-05-05T15:55:45.782196Z',
        created_by: petitionerUser,
        id: 1,
        resolved_at: status === PENDING ? null : '2020-05-05T16:28:56.570943Z',
        resolved_by: status === PENDING ? null : superUser,
        status: status,
        ticket: getTicket({id:1})
    }, 0, '');
}

function getEscalateRequest(status) {
    return getRequest(null,  {
        authorization: 'ticket.YELLOW.escalate.RED.authorization.authority-3',
        created_at: '2020-05-05T15:55:45.782196Z',
        created_by: superUser,
        id: 2,
        resolved_at: status === PENDING ? null : '2020-05-05T16:28:56.570943Z',
        resolved_by: status === PENDING ? null : authorizerUser,
        status: status,
        ticket: getTicket({id:2})
    }, 0, '');
}

storiesOf('Alerts&Events/RequestsScopedList/0_EmptyList', module)
    .addDecorator(muiTheme([theme]))
    .addDecorator(story => <Provider store={store}>{story()}</Provider>)
    .add('a) Pending received', () => (<>
        {'*There should be 0 users in petitioner filter*'}
        <RequestsScopedList
            type={PENDING_RECEIVED}
            user={superUser} // Visualizer user
            userFilters={pendingReceivedUserFilters}
            requests={[]}
            onRequestClick={(r) => {}}/></>))
    .add('b) Resolved received', () => (<>
        {'*Disabled Usuario_autoridad_2 is in authorizer filter; 0 users in petitioner filter*'}
        <RequestsScopedList
            type={RESOLVED_RECEIVED}
            user={superUser} // Visualizer user
            userFilters={resolvedReceivedUserFilters}
            requests={[]}
            onRequestClick={(r) => {}}/></>))
    .add('c) Pending requested', () => (<>
        {'*There are no filters here*'}
        <RequestsScopedList
            type={PENDING_REQUESTED}
            user={superUser} // Visualizer user
            userFilters={pendingRequestedUserFilters}
            requests={[]}
            onRequestClick={(r) => {}}/></>))
    .add('d) Resolved requested', () => (<>
        {'*There should be 0 users in authorizer filter*'}
        <RequestsScopedList
            type={RESOLVED_REQUESTED}
            user={superUser} // Visualizer user
            userFilters={resolvedRequestedUserFilters}
            requests={[]}
            onRequestClick={(r) => {}}/></>))

storiesOf('Alerts&Events/RequestsScopedList/1_PetitionerUser just made a request', module)
    .addDecorator(muiTheme([theme]))
    .addDecorator(story => <Provider store={store}>{story()}</Provider>)
    .add('b) Resolved received', () => (<>
        {'*Disabled Usuario_minera_1 in authorizer filter; 0 users in petitioner filter*'}
        <RequestsScopedList
            type={RESOLVED_RECEIVED}
            user={petitionerUser} // Visualizer user
            userFilters={resolvedReceivedUserFilters}
            requests={[]}
            onRequestClick={(r) => {}}/></>))
    .add('c) Pending requested (1)', () => (<>
        {'*The request is visible. There are no filters here*'}
        <RequestsScopedList
            type={PENDING_REQUESTED}
            user={petitionerUser} // Visualizer user
            userFilters={pendingRequestedUserFilters}
            requests={[getArchivingRequest(PENDING)]}
            onRequestClick={(r) => {}}/></>))

storiesOf('Alerts&Events/RequestsScopedList/2_SuperUser receives and made a request', module)
    .addDecorator(muiTheme([theme]))
    .addDecorator(story => <Provider store={store}>{story()}</Provider>)
    .add('a) Pending received (1)', () => (<>
        {'*An archive request is visible. Usuario_minera_1 is in petitioner filter*'}
        <RequestsScopedList
            type={PENDING_RECEIVED}
            user={superUser} // Visualizer user
            userFilters={pendingReceivedUserFilters}
            requests={[getArchivingRequest(PENDING)]}
            onRequestClick={(r) => {}}/></>))
    .add('b) Resolved received', () => (<>
        {'*Disabled Usuario_autoridad_2 in authorizer filter; 0 users in petitioner filter*'}
        <RequestsScopedList
            type={RESOLVED_RECEIVED}
            user={superUser} // Visualizer user
            userFilters={resolvedReceivedUserFilters}
            requests={[]}
            onRequestClick={(r) => {}}/></>))
    .add('c) Pending requested (1)', () => (<>
        {'*An escalate request is visible. There are no filters here.*'}
        <RequestsScopedList
            type={PENDING_REQUESTED}
            user={superUser} // Visualizer user
            userFilters={pendingRequestedUserFilters}
            requests={[getEscalateRequest(PENDING)]}
            onRequestClick={(r) => {}}/></>))

storiesOf('Alerts&Events/RequestsScopedList/3_SuperUser resolves the first request', module)
    .addDecorator(muiTheme([theme]))
    .addDecorator(story => <Provider store={store}>{story()}</Provider>)
    .add('b) Resolved received (1)', () => (<>
        {'*Archive request is visible. Usuario_minera_1 is in petitioner filter; Disabled Usuario-autoridad_2 is in authorizer filter*'}
        <RequestsScopedList
            type={RESOLVED_RECEIVED}
            user={superUser} // Visualizer user
            userFilters={resolvedReceivedUserFilters}
            requests={[getArchivingRequest(APPROVED)]}
            onRequestClick={(r) => {}}/></>))
    .add('c) Pending requested (1)', () => (<>
        {'*Escalate request is visible. There are no filters here*'}
        <RequestsScopedList
            type={PENDING_REQUESTED}
            user={superUser} // Visualizer user
            userFilters={pendingRequestedUserFilters}
            requests={[getEscalateRequest(PENDING)]}
            onRequestClick={(r) => {}}/></>))

storiesOf('Alerts&Events/RequestsScopedList/4_PetitionerUser sees the resolved request', module)
    .addDecorator(muiTheme([theme]))
    .addDecorator(story => <Provider store={store}>{story()}</Provider>)
    .add('b) Resolved received', () => (<>
        {'*Disabled Usuario_minera_1 is in authorizer filter; 0 users in petitioner filter*'}
        <RequestsScopedList
            type={RESOLVED_RECEIVED}
            user={petitionerUser} // Visualizer user
            userFilters={resolvedReceivedUserFilters}
            requests={[]}
            onRequestClick={(r) => {}}/></>))
    .add('d) Resolved requested (1)', () => (<>
        {'*Archive request is visible. Usuario_autoridad_2 is in authorizer filter*'}
        <RequestsScopedList
            type={RESOLVED_REQUESTED}
            user={petitionerUser} // Visualizer user
            userFilters={resolvedRequestedUserFilters}
            requests={[getArchivingRequest(APPROVED)]}
            onRequestClick={(r) => {}}/></>))

storiesOf('Alerts&Events/RequestsScopedList/5_AuthorizerUser sees a pending received request', module)
    .addDecorator(muiTheme([theme]))
    .addDecorator(story => <Provider store={store}>{story()}</Provider>)
    .add('a) Pending received (1)', () => (<>
        {'*Escalate request is visible. Usuario_autoridad_2 is in petitioner filter*'}
        <RequestsScopedList
            type={PENDING_RECEIVED}
            user={authorizerUser} // Visualizer user
            userFilters={pendingReceivedUserFilters}
            requests={[getEscalateRequest(PENDING)]}
            onRequestClick={(r) => {}}/></>))
    .add('b) Resolved received', () => (<>
        {'*Disabled Usuario_autoridad_3 in authorizer filter; 0 users in petitioner filter*'}
        <RequestsScopedList
            type={RESOLVED_RECEIVED}
            user={authorizerUser} // Visualizer user
            userFilters={resolvedReceivedUserFilters}
            requests={[]}
            onRequestClick={(r) => {}}/></>))

storiesOf('Alerts&Events/RequestsScopedList/6_AuthorizerUser resolves the request', module)
    .addDecorator(muiTheme([theme]))
    .addDecorator(story => <Provider store={store}>{story()}</Provider>)
    .add('b) Resolved received (1)', () => (<>
        {'*Escalate request is visible. Disabled Usuario_autoridad_3 is in authorizer filter; Usuario_autoridad_2 is in petitioner filter*'}
        <RequestsScopedList
            type={RESOLVED_RECEIVED}
            user={authorizerUser} // Visualizer user
            userFilters={resolvedReceivedUserFilters}
            requests={[getEscalateRequest(APPROVED)]}
            onRequestClick={(r) => {}}/></>))

storiesOf('Alerts&Events/RequestsScopedList/7_AuthorizerUser2 sees a received request he did not resolved', module)
    .addDecorator(muiTheme([theme]))
    .addDecorator(story => <Provider store={store}>{story()}</Provider>)
    .add('b) Resolved received (1)', () => (<>
        {'*An escalate request is visible. Disabled Usuario_autoridad_33 + Usuario_autoridad_3 are in authorizer filter; Usuario_autoridad_2 is in petitioner filter*'}
        <RequestsScopedList
            type={RESOLVED_RECEIVED}
            user={authorizerUser2} // Visualizer user
            userFilters={resolvedReceivedUserFilters}
            requests={[getEscalateRequest(APPROVED)]}
            onRequestClick={(r) => {}}/></>))

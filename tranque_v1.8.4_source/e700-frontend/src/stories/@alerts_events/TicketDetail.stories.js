import React from 'react';
import theme from '@miners/theme';
import {Provider} from 'react-redux';
import {configureStore} from '@app/store';
import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import TicketDetail from '@alerts_events/components/ticket/detail/TicketDetail';
import {getTicket} from './data/Ticket';
import { A, B, C, D, YELLOW_ALERT, RED_ALERT } from '@alerts_events/constants/ticketGroups';
import { getRequest } from './data/authorizationRequests';
import { PENDING } from '@alerts_events/constants/authorizationStates';
import {getUser} from '../data/User';
import { miner_1_actions, miner_2_actions, miner_3_actions, miner_4_actions,
    authority_1_actions, authority_2_actions, authority_3_actions } from './data/actions';

const store = configureStore();

const miner_1 = getUser({}, miner_1_actions);
const miner_2 = getUser({}, miner_2_actions);
const miner_3 = getUser({}, miner_3_actions);
const miner_4 = getUser({}, miner_4_actions);
const authority_1 = getUser({}, authority_1_actions);
const authority_2 = getUser({}, authority_2_actions);
const authority_3 = getUser({}, authority_3_actions);

const EF = 'ef';

function getTicketDetail(state, scope, user, showTargetInfo, currentFiles, comments, logs, requests, publicMessages) {
    let level;
    if (state.startsWith(A)) level = 1;
    else if (state.startsWith(B)) level = 2;
    else if (state.startsWith(C)) level = 3;
    else if (state.startsWith(D)) level = 4;
    else if (state === YELLOW_ALERT) level = 5;
    else level = 6;
    const ticket = getTicket({result_state: {...getTicket().result_state, level}, state});
    return <TicketDetail
        ticket={ticket}
        currentComments={'...'}
        currentFiles={currentFiles}
        comments={comments}
        logs={logs}
        user={user}
        requests={requests || [getRequest(ticket, {status: PENDING}, 0, '')]}
        scope={scope}
        showTargetInfo={showTargetInfo}
        publicMessages={publicMessages}
        currentPublicAlertMessage={'...'}
        handleClose={() => {}}
        onComment={() => {}}
        onDownload={(doc) => {}}
        onChangeComment={(c, f, t) => {}}
        onTicketUpdate={(t, c) => {}}
        onPublicAlertMessageUpdate={() => {}}
        onChangePublicAlertMessage={(c) => {}}
        onRequest={() => {}}
        onRequestResolve={() => {}}
        onAuthorizationDownload={(doc) => {}}/>
}


storiesOf('Alerts&Events/ticket-detail/EF Dialog', module)
    .addDecorator(muiTheme([theme]))
    .addDecorator(story => <Provider store={store}>{story()}</Provider>)
    .add('With target info', () => getTicketDetail(A, EF, miner_1, true, [], [], [], null, []))

storiesOf('Alerts&Events/ticket-detail/EF Dialog/A', module)
    .addDecorator(muiTheme([theme]))
    .addDecorator(story => <Provider store={store}>{story()}</Provider>)
    .add('Miner-1', () => getTicketDetail(A, EF, miner_1, false, [], [], [], null, []))
    .add('Miner-2', () => getTicketDetail(A, EF, miner_2, false, [], [], [], null, []))
    .add('Miner-3', () => getTicketDetail(A, EF, miner_3, false, [], [], [], null, []))
    .add('Miner-4', () => getTicketDetail(A, EF, miner_4, false, [], [], [], null, []))
    .add('Authority-1', () => getTicketDetail(A, EF, authority_1, false, [], [], [], null, []))
    .add('Authority-2', () => getTicketDetail(A, EF, authority_2, false, [], [], [], null, []))
    .add('Authority-3', () => getTicketDetail(A, EF, authority_3, false, [], [], [], null, []))

storiesOf('Alerts&Events/ticket-detail/EF Dialog/B', module)
    .addDecorator(muiTheme([theme]))
    .addDecorator(story => <Provider store={store}>{story()}</Provider>)
    .add('Miner-1', () => getTicketDetail(B, EF, miner_1, false, [], [], [], null, []))
    .add('Miner-2', () => getTicketDetail(B, EF, miner_2, false, [], [], [], null, []))
    .add('Miner-3', () => getTicketDetail(B, EF, miner_3, false, [], [], [], null, []))
    .add('Miner-4', () => getTicketDetail(B, EF, miner_3, false, [], [], [], null, []))
    .add('Authority-1', () => getTicketDetail(B, EF, authority_1, false, [], [], [], null, []))
    .add('Authority-2', () => getTicketDetail(B, EF, authority_2, false, [], [], [], null, []))
    .add('Authority-3', () => getTicketDetail(B, EF, authority_3, false, [], [], [], null, []))

storiesOf('Alerts&Events/ticket-detail/EF Dialog/C', module)
    .addDecorator(muiTheme([theme]))
    .addDecorator(story => <Provider store={store}>{story()}</Provider>)
    .add('Miner-1', () => getTicketDetail(C, EF, miner_1, false, [], [], [], null, []))
    .add('Miner-2', () => getTicketDetail(C, EF, miner_2, false, [], [], [], null, []))
    .add('Miner-3', () => getTicketDetail(C, EF, miner_3, false, [], [], [], null, []))
    .add('Miner-4', () => getTicketDetail(C, EF, miner_4, false, [], [], [], null, []))
    .add('Authority-1', () => getTicketDetail(C, EF, authority_1, false, [], [], [], null, []))
    .add('Authority-2', () => getTicketDetail(C, EF, authority_2, false, [], [], [], null, []))
    .add('Authority-3', () => getTicketDetail(C, EF, authority_3, false, [], [], [], null, []))

storiesOf('Alerts&Events/ticket-detail/EF Dialog/D', module)
    .addDecorator(muiTheme([theme]))
    .addDecorator(story => <Provider store={store}>{story()}</Provider>)
    .add('Miner-1', () => getTicketDetail(D, EF, miner_1, false, [], [], [], null, []))
    .add('Miner-2', () => getTicketDetail(D, EF, miner_2, false, [], [], [], null, []))
    .add('Miner-3', () => getTicketDetail(D, EF, miner_3, false, [], [], [], null, []))
    .add('Miner-4', () => getTicketDetail(D, EF, miner_4, false, [], [], [], null, []))
    .add('Authority-1', () => getTicketDetail(D, EF, authority_1, false, [], [], [], null, []))
    .add('Authority-2', () => getTicketDetail(D, EF, authority_2, false, [], [], [], null, []))
    .add('Authority-3', () => getTicketDetail(D, EF, authority_3, false, [], [], [], null, []))

storiesOf('Alerts&Events/ticket-detail/EF Dialog/YELLOW', module)
    .addDecorator(muiTheme([theme]))
    .addDecorator(story => <Provider store={store}>{story()}</Provider>)
    .add('Miner-1', () => getTicketDetail(YELLOW_ALERT, EF, miner_1, false, [], [], [], null, []))
    .add('Miner-2', () => getTicketDetail(YELLOW_ALERT, EF, miner_2, false, [], [], [], null, []))
    .add('Miner-3', () => getTicketDetail(YELLOW_ALERT, EF, miner_3, false, [], [], [], null, []))
    .add('Authority-1', () => getTicketDetail(YELLOW_ALERT, EF, authority_1, false, [], [], [], null, []))
    .add('Authority-2', () => getTicketDetail(YELLOW_ALERT, EF, authority_2, false, [], [], [], null, []))
    .add('Authority-3', () => getTicketDetail(YELLOW_ALERT, EF, authority_3, false, [], [], [], null, []))

storiesOf('Alerts&Events/ticket-detail/EF Dialog/RED', module)
    .addDecorator(muiTheme([theme]))
    .addDecorator(story => <Provider store={store}>{story()}</Provider>)
    .add('Miner-1', () => getTicketDetail(RED_ALERT, EF, miner_1, false, [], [], [], null, []))
    .add('Miner-2', () => getTicketDetail(RED_ALERT, EF, miner_2, false, [], [], [], null, []))
    .add('Miner-3', () => getTicketDetail(RED_ALERT, EF, miner_3, false, [], [], [], null, []))
    .add('Miner-4', () => getTicketDetail(RED_ALERT, EF, miner_4, false, [], [], [], null, []))
    .add('Authority-1', () => getTicketDetail(RED_ALERT, EF, authority_1, false, [], [], [], null, []))
    .add('Authority-2', () => getTicketDetail(RED_ALERT, EF, authority_2, false, [], [], [], null, []))
    .add('Authority-3', () => getTicketDetail(RED_ALERT, EF, authority_3, false, [], [], [], null, []))

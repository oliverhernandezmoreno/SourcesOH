import React from 'react';
import theme from '@authorities/theme';
import {storiesOf} from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import RequestListCard from '@alerts_events/components/requests/RequestListCard';
import {getRequest} from '../@alerts_events/data/authorizationRequests';
import {getTicket} from '../@alerts_events/data/Ticket';
import { PENDING, APPROVED, DENIED } from '@alerts_events/constants/authorizationStates';
import {getUser} from '../data/User';


storiesOf('Authorities/RequestListCard', module)
    .addDecorator(muiTheme([theme]))
    .add('Pending request', () => (
        <RequestListCard
            request={getRequest(null, {
                ticket: getTicket(null),
                status: PENDING,
                created_by: getUser({username: 'Usuario solicitante'})
            })}
            onClick={() => {}}
        />
    ))
    .add('Approved request', () => (
        <RequestListCard
            request={getRequest(null, {
                ticket: getTicket(null),
                status: APPROVED,
                created_by: getUser({username: 'Usuario solicitante'}),
                resolved_by: getUser({username: 'Usuario autorizador'})
            })}
            onClick={() => {}}
        />
    ))
    .add('Denied request', () => (
        <RequestListCard
            request={getRequest(null, {
                ticket: getTicket(null),
                status: DENIED,
                created_by: getUser({username: 'Usuario solicitante'}),
                resolved_by: getUser({username: 'Usuario autorizador'})
            })}
            onClick={() => {}}
        />
    ));

import React from 'react';
import theme from '@miners/theme';
import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import PublicMessageSection from '@alerts_events/components/ticket/detail/PublicMessageSection';
import {getTicket, ticket} from './data/Ticket';
import { YELLOW_ALERT, RED_ALERT } from '@alerts_events/constants/ticketGroups';


const divStyle = {
    backgroundColor: theme.palette.secondary.light,
    color: '#ffffff'
};

const EF = 'EF';
const EMAC = 'EMAC';

function getMessage(alert_type, scope) {
    return {
        alert_type,
        content: 'Mensaje de alerta (' + alert_type + ' con scope ' + scope + ')',
        created_at: "2020-04-01T14:50:20.585513Z",
        created_by: "un usuario",
        id: 0,
        target: "el-mauro",
        scope: scope
    }
}

const publicMessages = [
    getMessage(YELLOW_ALERT, EF),
    getMessage(YELLOW_ALERT, EF),
    getMessage(YELLOW_ALERT, EF),
    getMessage(RED_ALERT, EF),
    getMessage(RED_ALERT, EF),
    getMessage(RED_ALERT, EF),
    getMessage(YELLOW_ALERT, EMAC),
    getMessage(YELLOW_ALERT, EMAC),
    getMessage(YELLOW_ALERT, EMAC),
    getMessage(RED_ALERT, EMAC),
    getMessage(RED_ALERT, EMAC),
    getMessage(RED_ALERT, EMAC)
];

function getPublicMessageSection(state, level, updateButton, scope) {
    return (<div style={divStyle}>
        <PublicMessageSection
            ticket={getTicket({
                state,
                result_state: {...ticket.result_state, level},
                public_alert_abstract: 'Resumen mensaje ' + state
            })}
            updateButton={updateButton}
            messages={publicMessages}
            currentMessage={''}
            onUpdate={() => {}}
            onChangeMessage={() => {}}
            scope={scope}
        />
    </div>);
}


storiesOf('Alerts&Events/ticket-detail/PublicMessageSection/EF', module)
    .addDecorator(muiTheme([theme]))
    .add(' Yellow alert readOnly (3 messages)', () => getPublicMessageSection(YELLOW_ALERT, 5, false, EF))
    .add(' Red alert readOnly (3 messages)', () => getPublicMessageSection(RED_ALERT, 6, false, EF))
    .add('Yellow alert (3 messages)', () => getPublicMessageSection(YELLOW_ALERT, 5, true, EF))
    .add('Red alert (3 messages)', () => getPublicMessageSection(RED_ALERT, 6, true, EF))

storiesOf('Alerts&Events/ticket-detail/PublicMessageSection/EMAC', module)
    .addDecorator(muiTheme([theme]))
    .add(' Yellow alert readOnly (3 messages)', () => getPublicMessageSection(YELLOW_ALERT, 5, false, EMAC))
    .add(' Red alert readOnly (3 messages)', () => getPublicMessageSection(RED_ALERT, 6, false, EMAC))
    .add('Yellow alert (3 messages)', () => getPublicMessageSection(YELLOW_ALERT, 5, true, EMAC))
    .add('Red alert (3 messages)', () => getPublicMessageSection(RED_ALERT, 6, true, EMAC))

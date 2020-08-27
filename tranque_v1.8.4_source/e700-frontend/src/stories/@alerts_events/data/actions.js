import { event_states, alert_states } from '@alerts_events/constants/ticketGroups';
import { MIN_2, MIN_3, AUT_2, AUT_3 } from '@alerts_events/constants/profiles';
import { PERMS } from '@app/permissions';


function getActions() {
    let actions = [];
    const levels = [MIN_2, MIN_3, AUT_2, AUT_3];
    // escalate
    event_states.forEach(state => {
        levels.forEach(level => {
            event_states.forEach(toState => {
                if (state !== toState) {
                    actions.push('ticket.' + state + '.escalate.' + toState + '.authorization.' + level + '.request');
                    actions.push('ticket.' + state + '.escalate.' + toState + '.authorization.' + level + '.resolve');
                    actions.push('ticket.' + state + '.escalate.' + toState);
                }
            })
        })
    })
    alert_states.forEach(state => {
        levels.forEach(level => {
            event_states.forEach(toState => {
                if (state !== toState) {
                    actions.push('ticket.' + state + '.escalate.' + toState + '.authorization.' + level + '.request');
                    actions.push('ticket.' + state + '.escalate.' + toState + '.authorization.' + level + '.resolve');
                    actions.push('ticket.' + state + '.escalate.' + toState);
                }
            })
        })
    })
    // close
    event_states.forEach(state => {
        levels.forEach(level => {
            actions.push('ticket.' + state + '.close.authorization.' + level + '.request');
            actions.push('ticket.' + state + '.close.authorization.' + level + '.resolve');
            actions.push('ticket.' + state + '.close');
        })
    })
    // archive
    event_states.forEach(state => {
        levels.forEach(level => {
            actions.push('ticket.' + state + '.archive.authorization.' + level + '.request');
            actions.push('ticket.' + state + '.archive.authorization.' + level + '.resolve');
            actions.push('ticket.' + state + '.archive');
        })
    })
    // event comments
    event_states.forEach(state => {
        actions.push('ticket.' + state + '.event_management_comment.write');
        actions.push('ticket.' + state + '.event_management_comment.read');
    })
    // alert comments
    alert_states.forEach(state => {
        actions.push('ticket.' + state + '.public_alert_messages.write');
        actions.push('ticket.' + state + '.public_alert_messages.read');
        actions.push('ticket.' + state + '.alert_management_comment.read');
        actions.push('ticket.' + state + '.alert_management_comment.write');
        actions.push('ticket.' + state + '.alert_complementary_comment.read');
        actions.push('ticket.' + state + '.alert_complementary_comment.write');
    })
    actions.push('ticket.' + alert_states[1] + '.close_report_comment.read');
    actions.push('ticket.' + alert_states[1] + '.close_report_comment.write');
    return actions;
}

export const actions = getActions();

export const authority_1_actions = [
    PERMS.authority.e700, PERMS.authority.ef, PERMS.authority.emac,

    'ticket.YELLOW.public_alert_messages.read',
    'ticket.RED.public_alert_messages.read',

    'ticket.A.event_management_comment.read',
    'ticket.B.event_management_comment.read',
    'ticket.C.event_management_comment.read',
    'ticket.D.event_management_comment.read',

    'ticket.YELLOW.alert_management_comment.read',
    'ticket.RED.alert_management_comment.read',

    'ticket.YELLOW.alert_complementary_comment.read',
    'ticket.RED.alert_complementary_comment.read',

    'ticket.RED.close_report_comment.read'
];

export const authority_2_actions = [
    PERMS.authority.e700, PERMS.authority.ef, PERMS.authority.emac,

    'ticket.YELLOW.public_alert_messages.read',
    'ticket.RED.public_alert_messages.read',

    'ticket.A.event_management_comment.read',
    'ticket.B.event_management_comment.read',
    'ticket.C.event_management_comment.read',
    'ticket.D.event_management_comment.read',

    'ticket.YELLOW.alert_management_comment.read',
    'ticket.YELLOW.alert_management_comment.write',
    'ticket.RED.alert_management_comment.read',
    'ticket.RED.alert_management_comment.write',

    'ticket.YELLOW.alert_complementary_comment.read',
    'ticket.RED.alert_complementary_comment.read',

    'ticket.RED.close_report_comment.read',
    'ticket.RED.close_report_comment.write',

    'ticket.B.escalate.C.authorization.authority-3.request',
    'ticket.B.escalate.D.authorization.authority-3.request',
    'ticket.C.escalate.D.authorization.authority-3.request',
    'ticket.YELLOW.escalate.RED.authorization.authority-3.request',

    'ticket.B.escalate.C',
    'ticket.B.escalate.D',
    'ticket.C.escalate.D',
    'ticket.YELLOW.escalate.RED',

    'ticket.A.archive.authorization.authority-2.resolve',
    'ticket.B.archive.authorization.authority-2.resolve',
    'ticket.C.archive.authorization.authority-2.resolve',
    'ticket.D.archive.authorization.authority-2.resolve',

    'ticket.YELLOW.close.authorization.authority-3.request',
    'ticket.RED.close.authorization.authority-3.request',

    'ticket.YELLOW.close',
    'ticket.RED.close',

    'ticket.C.close.authorization.authority-2.resolve',
    'ticket.D.close.authorization.authority-2.resolve',

    'ticket.RED.escalate.YELLOW.authorization.authority-3.request',
    'ticket.RED.escalate.YELLOW'
];

export const authority_3_actions = [
    PERMS.authority.e700, PERMS.authority.ef, PERMS.authority.emac,

    'ticket.YELLOW.public_alert_messages.read',
    'ticket.RED.public_alert_messages.read',
    'ticket.YELLOW.public_alert_messages.write',
    'ticket.RED.public_alert_messages.write',

    'ticket.A.event_management_comment.read',
    'ticket.B.event_management_comment.read',
    'ticket.C.event_management_comment.read',
    'ticket.D.event_management_comment.read',

    'ticket.YELLOW.alert_management_comment.read',
    'ticket.RED.alert_management_comment.read',

    'ticket.YELLOW.alert_complementary_comment.read',
    'ticket.RED.alert_complementary_comment.read',

    'ticket.RED.close_report_comment.read',

    'ticket.B.escalate.C.authorization.authority-3.resolve',
    'ticket.B.escalate.D.authorization.authority-3.resolve',
    'ticket.C.escalate.D.authorization.authority-3.resolve',
    'ticket.YELLOW.escalate.RED.authorization.authority-3.resolve',
    'ticket.RED.escalate.YELLOW.authorization.authority-3.resolve',

    'ticket.YELLOW.close.authorization.authority-3.resolve',
    'ticket.RED.close.authorization.authority-3.resolve'
];

export const miner_1_actions = [
    PERMS.miner.e700, PERMS.miner.ef, PERMS.miner.emac,

    'ticket.YELLOW.public_alert_messages.read',
    'ticket.RED.public_alert_messages.read',

    'ticket.A.event_management_comment.write',
    'ticket.A.event_management_comment.read',
    'ticket.B.event_management_comment.write',
    'ticket.B.event_management_comment.read',
    'ticket.C.event_management_comment.write',
    'ticket.C.event_management_comment.read',
    'ticket.D.event_management_comment.write',
    'ticket.D.event_management_comment.read',

    'ticket.YELLOW.alert_complementary_comment.read',
    'ticket.RED.alert_complementary_comment.read',

    'ticket.A.escalate.B.authorization.miner-2.request',
    'ticket.A.escalate.C.authorization.miner-2.request',
    'ticket.A.escalate.D.authorization.miner-2.request',
    'ticket.B.escalate.C.authorization.miner-2.request',
    'ticket.B.escalate.D.authorization.miner-2.request',
    'ticket.C.escalate.D.authorization.miner-2.request',

    'ticket.A.escalate.B',
    'ticket.A.escalate.C',
    'ticket.A.escalate.D',
    'ticket.B.escalate.C',
    'ticket.B.escalate.D',
    'ticket.C.escalate.D',

    'ticket.A.archive.authorization.authority-2.request',
    'ticket.B.archive.authorization.authority-2.request',
    'ticket.C.archive.authorization.authority-2.request',
    'ticket.D.archive.authorization.authority-2.request',

    'ticket.A.archive',
    'ticket.B.archive',
    'ticket.C.archive',
    'ticket.D.archive',

    'ticket.C.close.authorization.authority-2.request',
    'ticket.D.close.authorization.authority-2.request',

    'ticket.A.close',
    'ticket.B.close',
    'ticket.C.close',
    'ticket.D.close'
];

export const miner_2_actions = [
    PERMS.miner.e700, PERMS.miner.ef, PERMS.miner.emac,

    'ticket.YELLOW.public_alert_messages.read',
    'ticket.RED.public_alert_messages.read',

    'ticket.A.event_management_comment.read',
    'ticket.B.event_management_comment.read',
    'ticket.C.event_management_comment.read',
    'ticket.D.event_management_comment.read',

    'ticket.YELLOW.alert_complementary_comment.read',
    'ticket.RED.alert_complementary_comment.read',

    'ticket.A.escalate.B.authorization.miner-2.resolve',
    'ticket.A.escalate.C.authorization.miner-2.resolve',
    'ticket.A.escalate.D.authorization.miner-2.resolve',
    'ticket.B.escalate.C.authorization.miner-2.resolve',
    'ticket.B.escalate.D.authorization.miner-2.resolve',
    'ticket.C.escalate.D.authorization.miner-2.resolve',

    'ticket.C.close.authorization.miner-2.resolve',
    'ticket.D.close.authorization.miner-2.resolve'
];

export const miner_3_actions = [
    PERMS.miner.e700, PERMS.miner.ef, PERMS.miner.emac,

    'ticket.YELLOW.public_alert_messages.read',
    'ticket.RED.public_alert_messages.read',

    'ticket.A.event_management_comment.read',
    'ticket.B.event_management_comment.read',
    'ticket.C.event_management_comment.read',
    'ticket.D.event_management_comment.read',

    'ticket.YELLOW.alert_complementary_comment.read',
    'ticket.RED.alert_complementary_comment.read',
    'ticket.YELLOW.alert_complementary_comment.write',
    'ticket.RED.alert_complementary_comment.write',

    'ticket.B.escalate.C.authorization.miner-3.resolve',
    'ticket.B.escalate.D.authorization.miner-3.resolve',
    'ticket.C.escalate.D.authorization.miner-3.resolve',
];

export const miner_4_actions = [
    PERMS.miner.e700, PERMS.miner.ef, PERMS.miner.emac,

    'ticket.YELLOW.public_alert_messages.read',
    'ticket.RED.public_alert_messages.read',

    'ticket.A.event_management_comment.read',
    'ticket.B.event_management_comment.read',
    'ticket.C.event_management_comment.read',
    'ticket.D.event_management_comment.read',

    'ticket.YELLOW.alert_complementary_comment.read',
    'ticket.RED.alert_complementary_comment.read',
];

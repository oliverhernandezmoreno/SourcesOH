import { YELLOW_ALERT_LEVEL, RED_ALERT_LEVEL,
    NO_ALERT_COLOR, YELLOW_ALERT_COLOR, RED_ALERT_COLOR, DISCONNECTED_ALERT_COLOR,
    NO_ALERT_LABEL, YELLOW_ALERT_LABEL, RED_ALERT_LABEL, DISCONNECTED_ALERT_LABEL } from '@authorities/constants/alerts';
import { CLOSED } from '@alerts_events/constants/ticketGroups';


/**
 * Get all tickets of a specific target from a ticket list
 *
 * @param tickets tickets list
 * @param target target canonical name
 * @returns tickets list of a target
 */
export function getTargetTickets(targetcanonicalname, ticketlist) {
    return ticketlist.filter((ticket) => ticket.target.canonical_name === targetcanonicalname);
}

/**
 * Check if ticket is active or not
 *
 * @param ticket ticket
 * @returns true if ticket is active false if not
 */
export function checkTicketActive(ticket) {
    return !ticket.archived && ticket.evaluable && ticket.state !== CLOSED;
}

/**
 * Get ticket status
 *
 * @param ticket ticket
 * @returns status in {open, archived, unevaluable, closed}
 */
export function getTicketStatus(ticket) {
    if (!ticket.archived && ticket.evaluable && ticket.state !== CLOSED) return 'open';
    else if (ticket.archived && ticket.evaluable && ticket.state !== CLOSED) return 'archived';
    else if (!ticket.evaluable) return 'unevaluable';
    else if (ticket.state === CLOSED) return 'closed';
}

/**
 * Get worst alert color of a profile (ef or emac)
 *
 * @param ticketlist ticket list to check worst alert color
 * @param profile profile to filter tickets
 * @returns worst ticket alert color of the ticket list
 */
export function getAlertColor(ticketlist, profile) {
    const profileactiveticketlist = ticketlist ? ticketlist.filter(ticket => checkTicketActive(ticket) && ticket.base_module.split('.')[0] === profile) : [];
    let worst_ticketlevel = 0;
    profileactiveticketlist.forEach(ticket => {
        if (ticket.result_state.level >= YELLOW_ALERT_LEVEL && ticket.result_state.level >= worst_ticketlevel){
            worst_ticketlevel = ticket.result_state.level;
        }
    });

    switch (worst_ticketlevel) {
        case YELLOW_ALERT_LEVEL:
            return YELLOW_ALERT_COLOR;
        case RED_ALERT_LEVEL:
            return RED_ALERT_COLOR;
        default:
            return NO_ALERT_COLOR;
    }
}

/**
 * Get worst alert of a profile (ef or emac)
 *
 * @param ticketlist ticket list to check worst alert color
 * @param profile profile to filter tickets
 * @returns worst ticket of the ticket list
 */
export function getWorstActiveAlert(ticketlist, profile) {
    const profileactivealerts = (ticketlist || []).filter(ticket => (
        ticket.base_module.split('.')[0] === profile &&
        checkTicketActive(ticket) && 
        ticket.result_state.level >= YELLOW_ALERT_LEVEL
    ));

    if (profileactivealerts.length === 0) return null;

    let worstticket = profileactivealerts[0];
    profileactivealerts.forEach(ticket => {
        if (ticket.result_state.level >= worstticket.result_state.level){
            worstticket = ticket;
        }
    });

    return worstticket;
}

/**
 * Reduce tickets count with a specific level for a ticket list
 *
 * @param ticketlist ticket list
 * @param level ticket level to reduce
 * @param profile type of index to reduce (ef or emac)
 * @returns tickets count of the ticket list by ticket/alert level and profile
 */
export function getTicketsCount(ticketlist, level, profile) {
    const profileactiveticketlist = ticketlist ? ticketlist.filter(ticket => checkTicketActive(ticket) && ticket.base_module.split('.')[0] === profile) : [];
    return profileactiveticketlist.reduce((acc, ticket) => (ticket.result_state.level === level ? acc + 1 : acc), 0);
}

/**
 * Get label by color code
 *
 * @param color color hex code
 * @returns label for the especific color
 */
export function getAlertLabel(color) {
    switch (color) {
        default:
        case NO_ALERT_COLOR:
            return NO_ALERT_LABEL;
        case YELLOW_ALERT_COLOR:
            return YELLOW_ALERT_LABEL;
        case RED_ALERT_COLOR:
            return RED_ALERT_LABEL;
        case DISCONNECTED_ALERT_COLOR:
            return DISCONNECTED_ALERT_LABEL;
    }
}

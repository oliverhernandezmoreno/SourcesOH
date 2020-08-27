// English strings according to backend
export const RED_ALERT = 'RED';
export const YELLOW_ALERT = 'YELLOW';
export const NO_ALERT = 'GREEN';
export const DISCONNECTED_ALERT = 'GRAY';
export const A = 'A';
export const B = 'B';
export const C = 'C';
export const D = 'D';
export const CLOSED = 'system.closed';

export const event_states = [A, B, C, D];
export const alert_states = [YELLOW_ALERT, RED_ALERT];

export const groupNames = {
    [A]: 'Anomalía',
    [B]: 'Incidente',
    [C]: 'Incidente Importante',
    [D]: 'Incidente Grave',
    [YELLOW_ALERT]: 'Alerta Amarilla',
    [RED_ALERT]: 'Alerta Roja'
}

export const groupPluralNames = {
    [A]: 'Anomalías',
    [B]: 'Incidentes',
    [C]: 'Incidentes Importantes',
    [D]: 'Incidentes Graves',
    [YELLOW_ALERT]: 'Alertas Amarillas',
    [RED_ALERT]: 'Alertas Rojas'
}

export function getGroup(ticket) {
    if (!ticket.result_state) return -1;
    const level = ticket.result_state.level;
    switch (level) {
        case 0: return CLOSED;
        case 1: return A;
        case 2: return B;
        case 3: return C;
        case 4: return D;
        case 5: return YELLOW_ALERT;
        case 6: return RED_ALERT;
        default: return -1;
    }
}

export function isAlert(group) {
    return group === YELLOW_ALERT ||
        group === RED_ALERT;
}
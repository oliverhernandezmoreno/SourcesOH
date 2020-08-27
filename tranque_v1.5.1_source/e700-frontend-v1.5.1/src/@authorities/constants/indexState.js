import {COLORS} from '@authorities/theme';

export const NONE = -2;
export const NOT_CONFIGURED = -1;
export const WITHOUT_ALERT = 0;
export const WITH_EVENTS = 1;
export const YELLOW_ALERT = 2;
export const RED_ALERT = 3;

export function getIndexStateLabel(state) {
    switch (state) {
        case WITHOUT_ALERT:
            return 'No afectado';
        case WITH_EVENTS:
        case YELLOW_ALERT:
        case RED_ALERT:
            return 'Afectado';
        case NOT_CONFIGURED:
        case NONE:
        default:
            return 'No habilitado';
    }
}

export function getIndexStateColor(state) {
    switch (state) {
        case WITHOUT_ALERT:
            return COLORS.success.main;
        case WITH_EVENTS:
        case YELLOW_ALERT:
        case RED_ALERT:
            return COLORS.error.main;
        case NOT_CONFIGURED:
        case NONE:
        default:
            return COLORS.disabled.main;
    }
}

export function indexStateToAffectedState(state) {
    switch (state) {
        case WITHOUT_ALERT:
            return 0;
        case WITH_EVENTS:
        case YELLOW_ALERT:
        case RED_ALERT:
            return 1;
        case NOT_CONFIGURED:
        case NONE:
        default:
            return -1;
    }
}

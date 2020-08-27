import {SAVE_USER_FILTER_CHECKS} from '@alerts_events/actions/userFilterChecks.actionTypes';

function saveUserFilterChecks(checks, store_variable) {
    return {
        type: SAVE_USER_FILTER_CHECKS,
        checks, store_variable
    }
}
export const userFilterChecksActions = {
    saveUserFilterChecks
};

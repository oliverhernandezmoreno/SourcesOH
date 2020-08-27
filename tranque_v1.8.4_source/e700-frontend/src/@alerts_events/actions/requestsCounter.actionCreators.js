import {UPDATE_REQUESTS_COUNTER} from '@alerts_events/actions/requestsCounter.actionTypes';

function setRequestsCounterUpdating(update) {
    return {
        type: UPDATE_REQUESTS_COUNTER,
        update
    }
}
export const requestsCounterActions = {
    setRequestsCounterUpdating
};

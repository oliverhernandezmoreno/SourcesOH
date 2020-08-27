import { SAVE_ACTION_TAB } from '@alerts_events/actions/currentComments.actionTypes';

function saveCurrentActionTab(tab) {
    return {
        type: SAVE_ACTION_TAB,
        tab
    }
}

export const currentTabActions = {
    saveCurrentActionTab
};

import {REVANCHA_OPERACIONAL_RADIO_VALUE} from '@miners/actions/dashboard.actionTypes';

/**
 * Action creator to save revancha operacional radio value for param card
 */
function saveRevanchaOperacionalRadioValue(value) {
    return {type: REVANCHA_OPERACIONAL_RADIO_VALUE, value};
}


/**
 * Selected action creators to export
 */
export const radioActions = {
    saveRevanchaOperacionalRadioValue
};

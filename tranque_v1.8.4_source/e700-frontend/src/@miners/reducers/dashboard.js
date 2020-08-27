import {REVANCHA_OPERACIONAL_RADIO_VALUE} from '@miners/actions/dashboard.actionTypes';

/**
 * Initial state for the reducer
 */
export const initialState = {
    revancha_operacional_radio_value: 'ef-mvp.m2.parameters.revancha-operacional.minimo'
};


const dashboardReducer = (state = initialState, action = {}) => {
    if (action.type === REVANCHA_OPERACIONAL_RADIO_VALUE) {
        return {
            revancha_operacional_radio_value: action.value
        };
    } else {
        return state;
    }
}

export default dashboardReducer;

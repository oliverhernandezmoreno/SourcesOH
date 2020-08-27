import {MENU_UPDATE} from '@miners/actions/menu.actionTypes';

/**
 * Initial state for the reducer
 */
export const initialState = {
    menuItems: []
};

/**
 * Authentication reducer
 */
function menuReducer(state = initialState, action = {}) {
    if (action.type === MENU_UPDATE) {
        return {
            menuItems: action.payload
        };
    } else {
        return state;
    }
}

export default menuReducer;

import {MENU_UPDATE} from '@miners/actions/menu.actionTypes';

/**
 * Action creator to update main menu
 */
function menuUpdate(items) {
    return {type: MENU_UPDATE, payload: items};
}


/**
 * Selected action creators to export
 */
export const menuActions = {
    menuUpdate
};

import * as actionTypes from '@communities/actions';
import * as config from '@app/config';

function getState() {
    return {
        windowInnerWith: window.innerWidth,
        isMobile: window.innerWidth <= config.MOBILE_WIDTH
    };
}

export const initialState = getState();

const resizeWindowReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.RESIZE_WINDOW: {
            return getState();
        }
        default: {
            return state;
        }
    }
};

export default resizeWindowReducer;

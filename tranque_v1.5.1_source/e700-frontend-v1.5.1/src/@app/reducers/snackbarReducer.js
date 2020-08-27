import {OPEN_SNACKBAR, CLOSE_SNACKBAR} from '@app/actions/snackbar.actionTypes';

export const initialState = {
    open_snackbar: false,
    snackbar_variant: 'info',
    snackbar_message: '',
    snackbar_anchorOrigin: null,
    snackbar_autoHideDuration: 3000    
};

const snackbarReducer = (state = initialState, action) => {
    switch (action.type) {
        case OPEN_SNACKBAR: {
            return {...state, open_snackbar: action.open, 
                snackbar_variant: action.variant, 
                snackbar_message: action.message, 
                snackbar_anchorOrigin: action.anchorOrigin,
                snackbar_autoHideDuration: action.autoHideDuration
            };
        }    
        case CLOSE_SNACKBAR: {
            return {...state, open_snackbar: action.open };
        }               
        default: {
            return state;
        }
    }
};

export default snackbarReducer;

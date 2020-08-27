import {OPEN_SNACKBAR, CLOSE_SNACKBAR} from '@app/actions/snackbar.actionTypes';

function openSnackbar(message, variant, anchorOrigin, autoHideDuration) {
    return {
        type: OPEN_SNACKBAR,
        message,
        variant,
        anchorOrigin,
        autoHideDuration,
        open: true
    }
}

function closeSnackbar() {
    return {
        type: CLOSE_SNACKBAR,
        open: false
    }
}


export const snackbarActions = {
    closeSnackbar,
    openSnackbar
};







import {combineReducers} from 'redux';
import auth from '@app/reducers/auth';
import {minersReducer} from '@miners/reducers';
import resizeWindow from '@communities/reducers/resizeWindow';
import filterReducer from '@authorities/reducers/homeFilters';
import snackbarReducer from '@app/reducers/snackbarReducer';
import ticketsReducer from '@alerts_events/reducers/tickets';

/**
 * Root reducer
 *
 * New reducer which combines the "slice reducers"
 * defined to manage specific slices of the state
 *
 */
const rootReducer = combineReducers({
    auth,
    miners: minersReducer,
    public: resizeWindow,
    authorities: filterReducer,
    globalSnackbar: snackbarReducer,
    tickets: ticketsReducer
});

export default rootReducer;

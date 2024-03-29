import {combineReducers} from 'redux';
import menu from '@miners/reducers/menu';
import timeSeries from '@miners/reducers/timeseries';
import dashboard from '@miners/reducers/dashboard';

/**
 * Root reducer
 *
 * New reducer which combines the "slice reducers"
 * defined to manage specific slices of the state
 *
 */
export const minersReducer = combineReducers({
    timeSeries,
    menu,
    dashboard
});

import {ADD_SERIE_CANONICAL_NAME} from '@miners/actions/timeseries.actionTypes';

/*
 * Action Add template_name to Time series View component
 */

export function addSerieCanonicalName(group) {
    return {type: ADD_SERIE_CANONICAL_NAME, serie_canonical_name: group};
}

//export default addTemplateName;

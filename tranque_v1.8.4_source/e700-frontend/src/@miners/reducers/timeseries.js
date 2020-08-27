import * as actionTypes from '@miners/actions/timeseries.actionTypes';

const initialState = {
    serie_canonical_name: ''
};

function timeseriesReducer(state = initialState, action = {}) {
    switch (action.type) {
        case actionTypes.ADD_SERIE_CANONICAL_NAME: {
            return {
                ...state,
                serie_canonical_name: action.serie_canonical_name
            };
        }
        default: {
            return state;
        }
    }
}

export default timeseriesReducer;

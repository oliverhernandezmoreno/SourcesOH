import { SAVE_MANAGER_COMMENT, SAVE_TRACING_COMMENT,
    SAVE_BACKGROUND_COMMENT, SAVE_CLOSING_ACT_COMMENT,
    SAVE_AUTHORIZE_COMMENT, SAVE_ACTION_TAB,
    SAVE_PUBLIC_ALERT_MESSAGE} from '@alerts_events/actions/currentComments.actionTypes';
import { UPDATE_REQUESTS_COUNTER } from '@alerts_events/actions/requestsCounter.actionTypes';
import { SAVE_USER_FILTER_CHECKS } from '@alerts_events/actions/userFilterChecks.actionTypes';

export const initialState = {
    manager_comment: '',
    manager_files: [],
    tracing_comment: '',
    tracing_files: [],
    background_comment: '',
    background_files: [],
    closing_act_comment: '',
    closing_act_files: [],
    authorize_comment: '',
    authorize_files: [],
    current_action_tab: '',
    public_alert_message: '',
    update_request_counter: true,

    pending_received_ef_checks: {},
    resolved_received_ef_checks_petitioner: {},
    resolved_received_ef_checks_authorizer: {},
    resolved_requested_ef_checks: {},

    pending_received_emac_checks: {},
    resolved_received_emac_checks_petitioner: {},
    resolved_received_emac_checks_authorizer: {},
    resolved_requested_emac_checks: {},

    pending_received_checks: {},
    resolved_received_checks_petitioner: {},
    resolved_received_checks_authorizer: {},
    resolved_requested_checks: {},
};

const ticketsReducer = (state = initialState, action) => {
    switch (action.type) {
        case SAVE_MANAGER_COMMENT: {
            return {...state, manager_comment: action.content, manager_files: action.files };
        }
        case SAVE_TRACING_COMMENT: {
            return {...state, tracing_comment: action.content, tracing_files: action.files };
        }
        case SAVE_BACKGROUND_COMMENT: {
            return {...state, background_comment: action.content, background_files: action.files };
        }
        case SAVE_CLOSING_ACT_COMMENT: {
            return {...state, closing_act_comment: action.content, closing_act_files: action.files };
        }
        case SAVE_AUTHORIZE_COMMENT: {
            return {...state, authorize_comment: action.content, authorize_files: action.files };
        }
        case SAVE_ACTION_TAB: {
            return {...state, current_action_tab: action.tab};
        }
        case SAVE_PUBLIC_ALERT_MESSAGE: {
            return {...state, public_alert_message: action.content}
        }
        case UPDATE_REQUESTS_COUNTER: {
            return {...state, update_request_counter: action.update}
        }
        case SAVE_USER_FILTER_CHECKS: {
            return {...state, [action.store_variable]: action.checks}
        }
        default: {
            return state;
        }
    }
};

export default ticketsReducer;

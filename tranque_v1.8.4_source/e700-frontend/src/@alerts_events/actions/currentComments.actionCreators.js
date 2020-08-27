import { SAVE_MANAGER_COMMENT, SAVE_TRACING_COMMENT,
    SAVE_BACKGROUND_COMMENT, SAVE_CLOSING_ACT_COMMENT,
    SAVE_AUTHORIZE_COMMENT, SAVE_PUBLIC_ALERT_MESSAGE} from '@alerts_events/actions/currentComments.actionTypes';

function saveCurrentManagerComment(content, files) {
    return {
        type: SAVE_MANAGER_COMMENT,
        content,
        files
    }
}

function saveCurrentTracingComment(content, files) {
    return {
        type: SAVE_TRACING_COMMENT,
        content,
        files
    }
}

function saveCurrentBackgroundComment(content, files) {
    return {
        type: SAVE_BACKGROUND_COMMENT,
        content,
        files
    }
}

function saveCurrentClosingActComment(content, files) {
    return {
        type: SAVE_CLOSING_ACT_COMMENT,
        content,
        files
    }
}

function saveCurrentAuthorizeComment(content, files) {
    return {
        type: SAVE_AUTHORIZE_COMMENT,
        content,
        files
    }
}

function saveCurrentPublicAlertMessage(content) {
    return {
        type: SAVE_PUBLIC_ALERT_MESSAGE,
        content
    }
}


export const currentCommentsActions = {
    saveCurrentManagerComment,
    saveCurrentTracingComment,
    saveCurrentBackgroundComment,
    saveCurrentClosingActComment,
    saveCurrentAuthorizeComment,
    saveCurrentPublicAlertMessage
};

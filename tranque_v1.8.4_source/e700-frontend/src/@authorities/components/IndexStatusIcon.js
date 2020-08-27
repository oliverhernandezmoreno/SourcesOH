import React from 'react';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/core/styles';
import {
    NONE,
    NOT_CONFIGURED,
    RED_ALERT,
    WITH_EVENTS,
    WITHOUT_ALERT,
    YELLOW_ALERT
} from '@authorities/constants/indexState';
import {Check, Close, NotInterested} from '@material-ui/icons';
import {COLORS} from '@authorities/theme';

const useStyles = makeStyles(theme => ({
    error: {
        fill: COLORS.error.main
    },
    success: {
        fill: COLORS.success.main
    },
    warning: {
        fill: COLORS.warning.main
    },
    disabled: {
        fill: COLORS.disabled.main
    },
    transparent: {
        visibility: 'hidden'
    }
}));

export function IndexStatusIcon({status, size}) {
    const classes = useStyles();
    let icon, className, fontSize;
    if (size) fontSize = size;
    else fontSize = 'inherit';
    switch (status) {
        case WITHOUT_ALERT:
            icon = Check;
            className = classes.success;
            break;
        case WITH_EVENTS:
        case YELLOW_ALERT:
        case RED_ALERT:
            icon = Close;
            className = classes.error;
            break;
        case NOT_CONFIGURED:
        case NONE:
        default:
            icon = NotInterested;
            className = classes.disabled;
            break;
    }
    
    return React.createElement(icon, {fontSize: fontSize, className});
}

IndexStatusIcon.propTypes = {
    marker: PropTypes.bool,
    status: PropTypes.oneOf([
        NONE,
        NOT_CONFIGURED,
        RED_ALERT,
        WITH_EVENTS,
        WITHOUT_ALERT,
        YELLOW_ALERT
    ])
};

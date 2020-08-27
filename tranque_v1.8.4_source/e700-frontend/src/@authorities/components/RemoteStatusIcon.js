import React from 'react';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/core/styles';
import {Power} from '@material-ui/icons';
import {COLORS} from '@authorities/theme';
import {CONNECTED, FAILED, NOT_IN_SMC} from '@authorities/constants/connectionState';

const useStyles = makeStyles(theme => ({
    success: {
        fill: COLORS.success.main
    },
    warning: {
        fill: COLORS.warning.main
    },
    disabled: {
        fill: COLORS.disabled.main
    }
}));

export function RemoteStatusIcon({status, size}) {
    const classes = useStyles();
    let className, fontSize;
    if (size) fontSize = size;
    else fontSize = 'inherit';
    switch (status) {
        case CONNECTED:
            className = classes.success;
            break;
        case FAILED:
            className = classes.warning;
            break;
        case NOT_IN_SMC:
        default:
            className = classes.disabled;
    }
    return React.createElement(Power, {fontSize: fontSize, className});
}

RemoteStatusIcon.propTypes = {
    status: PropTypes.oneOf([CONNECTED, FAILED, NOT_IN_SMC])
};

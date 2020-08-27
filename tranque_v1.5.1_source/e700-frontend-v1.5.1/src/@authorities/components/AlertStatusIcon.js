import React from 'react';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/core/styles';
import {
    NO_ALERT_COLOR,
    YELLOW_ALERT_COLOR,
    RED_ALERT_COLOR,
    DISCONNECTED_ALERT_COLOR
} from '@authorities/constants/alerts';

import {Lens, RoomTwoTone} from '@material-ui/icons';
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
    }
}));

export function AlertStatusIcon({color, size, disconnected, marker, id}) {
    const classes = useStyles();
    let className, fontSize;
    
    if (size) fontSize = size;
    else fontSize = 'inherit';

    const icon = Lens;
    switch (color) {
        case YELLOW_ALERT_COLOR:
            className = classes.warning;
            break;
        case RED_ALERT_COLOR:
            className = classes.error;
            break;
        case NO_ALERT_COLOR:
        default:
            className = classes.success
            break;
    }

    if (marker){
        className = disconnected ? classes.disabled : className;
        return React.createElement(RoomTwoTone, {fontSize, className});
    }

    let iconComponent;
    // Disconnected Alert Case
    if (disconnected){
        const disconnectedIconComponent = React.createElement(icon, {key: id+Math.floor(Math.random()*100000), fontSize, className: classes.disabled});
        iconComponent = React.createElement(icon, {key: id, className, style: {position: 'absolute', top: 0, fontSize: '0.75rem'}});
        return React.createElement('div', {style: {position: 'relative', display: 'inline-block', marginRight: 12}}, [disconnectedIconComponent, iconComponent]);
    }else{
        iconComponent = React.createElement(icon, {key: id, fontSize, className});
        return iconComponent;
    }
}

AlertStatusIcon.propTypes = {
    color: PropTypes.oneOf([
        NO_ALERT_COLOR,
        YELLOW_ALERT_COLOR,
        RED_ALERT_COLOR,
        DISCONNECTED_ALERT_COLOR
    ])
};

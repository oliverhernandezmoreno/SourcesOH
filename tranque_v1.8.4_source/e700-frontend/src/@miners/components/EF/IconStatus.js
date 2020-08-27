import React from 'react';
import {Brightness1Rounded} from '@material-ui/icons';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import { LOWER, UPPER } from '@miners/constants/thresholdTypes';

const styles = theme => ({
    green: {
        color: '#38E47B'
    },
    yellow: {
        color: '#FDFF3F'
    },
    without__threshold: {
        color: '#D3D3D3'
    }
});

export function isYellow(type, value, threshold) {
    if (threshold === null) return false; // green
    switch(type) {
        case LOWER:
            return parseFloat(value) <= parseFloat(threshold);
        case UPPER:
            return parseFloat(value) >= parseFloat(threshold);
        default:
            return null;
    }
}

function IconStatus({classes, value, threshold, type, iconProps}) {
    let statusClass;
    const yellow = isYellow(type, value, threshold);
    if (value !== undefined && value != null && !isNaN(parseFloat(value))) {
        if (yellow) {
            statusClass = classes.yellow;
        }
        else if (yellow === null) {
            statusClass = classes.without__threshold;
        }
        else statusClass = classes.green;
    }
    else statusClass = classes.without__threshold;
    return <Brightness1Rounded className={statusClass} {...iconProps}/>;
}

IconStatus.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(IconStatus);

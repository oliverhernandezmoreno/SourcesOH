import React from 'react';
import PropTypes from 'prop-types';
import {Chip, Typography, withStyles} from '@material-ui/core';
import IconStatus, {isYellow} from '@miners/components/EF/IconStatus';
import { UPPER } from '@miners/constants/thresholdTypes';

const styles = theme => ({
    chip: {
        padding:"10px",
        backgroundColor: '#323232'
    },
    name: { fontSize: 12 }
});

function ListSensor({classes, value}) {
    if (typeof value === 'undefined') return null;
    const yellow = isYellow(UPPER, value.values, value.threshold);
    return  <Chip variant="outlined" className={classes.chip}
        icon={
            <IconStatus
                value={value.values}
                threshold={value.threshold}
                type={UPPER}
                iconProps={{ style: { fontSize:10 } }}
            />
        }
        clickable={false}
        label={
            <Typography
                style={yellow ? { color: '#fdff41' } : undefined}
                className={classes.name}
                variant='body1'>
                {value.name}
            </Typography>
        }
    />;
}

ListSensor.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ListSensor);

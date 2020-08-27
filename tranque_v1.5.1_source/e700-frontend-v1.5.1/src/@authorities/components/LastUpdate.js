import React from 'react';

import {CircularProgress, makeStyles, Tooltip, Typography} from '@material-ui/core';
import {Info} from '@material-ui/icons';

const useStyles = makeStyles(theme => ({
    tooltip: {
        marginLeft: theme.spacing(1)
    },
    progress: {
        marginRight: theme.spacing(1),
        width: theme.spacing(3),
        color: theme.palette.textSecondary
    },
    updateMsg: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end'
    }
}));

/**
 * A component for rendering a message with the last data update.
 */
export function LastUpdate({loading, date}) {
    const classes = useStyles();
    return (
        <div className={classes.updateMsg}>
            <div className={classes.progress}>
                {loading && <CircularProgress size={20} color="inherit"/>}
            </div>
            <Typography align="right" color="textSecondary" variant="caption" noWrap>
                Última actualización: {date}
            </Typography>
            <Tooltip
                title={<Typography variant="caption">Los datos se actualizan cada 1 minuto</Typography>}>
                <Info className={classes.tooltip} fontSize="small" color="inherit"/>
            </Tooltip>
        </div>
    );
}

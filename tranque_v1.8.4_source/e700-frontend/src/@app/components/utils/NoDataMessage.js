import React from 'react';
import {Announcement} from '@material-ui/icons';
import { Grid, Typography, makeStyles } from '@material-ui/core';


const useStyles = makeStyles(theme => ({
    noData: {
        color: theme.palette.secondary.light,
        backgroundColor: theme.palette.secondary.dark,
        padding: 10
    }
}));


/**
 * A no data message box.
 *
 * @version 1.0.0
 * @author [Natalia Vidal](https://gitlab.com/nattoV)
 */
export default function NoDataMessage({message}) {
    const classes = useStyles();
    const renderedMessage = message || "Sin datos disponibles";
    return (
        <Grid item xs={12} container direction='column' alignItems='center' className={classes.noData}>
            <Grid item><Announcement/></Grid>
            <Grid item><Typography variant="h6">{renderedMessage}</Typography></Grid>
        </Grid>
    );

}

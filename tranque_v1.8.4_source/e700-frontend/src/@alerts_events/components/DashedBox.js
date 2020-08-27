import React from 'react';
import { Box, withStyles } from '@material-ui/core';

const styles = theme => ({
    noActionsBox: {
        margin: 10,
        marginTop: 10,
        padding: 10,
        border: 1,
        borderStyle: 'dashed',
        borderRadius: 5,
        width: '100%'
    }
});

const DashedBox = ({content, classes}) => (
    <Box className={classes.noActionsBox}>
        {content}
    </Box>
);


export default withStyles(styles)(DashedBox);


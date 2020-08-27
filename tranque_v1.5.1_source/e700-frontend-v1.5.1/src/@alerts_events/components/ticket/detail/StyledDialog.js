import React from 'react';
import { Dialog, DialogContent, Typography, withStyles} from '@material-ui/core';
import {COLORS} from '@miners/theme';

const styles = theme => ({
    title: {
        paddingBottom: 20
    },
    dialog: {
        backgroundColor: '#43484e',
        borderTop: '5px solid',
        borderColor: COLORS.buttons.contained,
        paddingBottom: 10
    }
});

const StyledDialog = ({classes, open, onClose, content, title, dialogProps}) =>  {
    return (
        <Dialog fullWidth
            maxWidth='lg'
            open={open}
            onClose={onClose}
            classes={{paper: classes.dialog}}
            {...dialogProps}
        >
            <DialogContent>
                <Typography variant='h6' className={classes.title}>
                    {title}
                </Typography>
                {content}
            </DialogContent>
        </Dialog>);
}


export default withStyles(styles)(StyledDialog);
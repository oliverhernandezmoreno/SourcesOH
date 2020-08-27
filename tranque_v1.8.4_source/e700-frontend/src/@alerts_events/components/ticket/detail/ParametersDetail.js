import React from 'react';
import PropTypes from 'prop-types';
import {Button, withStyles} from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import {ParametersTable} from '@alerts_events/components/ticket/detail/ParametersTable';

const styles = theme => ({
    button: {
        marginTop:20
    },
    subtitle:{
        paddingLeft:20
    }
});

function ParametersDetail(props) {
    const { classes, onClose, open } = props;

    const handleClose = () => {
        onClose();
    };
    const TITLE = "Parámetros asociados"
    const SUBTITLE = "Variables que excedieron un valor de referencia de umbral"
    const TEXTBUTTON = "Ver mas Datos"

    return (
        <Dialog onClose={handleClose}
            aria-labelledby="dialog-title"
            open={open}
            maxWidth="xl">
            <DialogTitle id="dialog-title">{TITLE}</DialogTitle>
            <DialogContentText id= "dialog-subtitle" className={classes.subtitle}>
                {SUBTITLE}
            </DialogContentText>
            <DialogContent>
                <ParametersTable data={[]}/>
            </DialogContent>
            <DialogActions>
                <Button variant='contained' color='primary' className={classes.button}>
                    {TEXTBUTTON}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

ParametersDetail.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired
};

export default withStyles(styles)(ParametersDetail)

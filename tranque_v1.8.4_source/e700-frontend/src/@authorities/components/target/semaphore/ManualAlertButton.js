import React, {Component} from 'react';
import { Button, FormControl, TextField, withStyles, 
    Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText
} from '@material-ui/core';
import {BlueButton} from '@authorities/theme';
import {groupNames, RED_ALERT} from '@alerts_events/constants/ticketGroups';

const styles = theme => ({
    root: {
        height: '100%'
    },
    redAlert: {
        color: theme.palette.error.main
    },
    yellowAlert: {
        color: theme.palette.warning.main
    },
});

/**
 * A component for rendering a button that handles the connection of a semaphore
 */
class ManualAlertButton extends Component {

    state = {
        openDialog: false,
        manualAlertComment: '',
        manualAlertCommentBlank: false
    };

    handleOpenDialog = () => {
        const {validateTextField} = this.props;
        if (validateTextField()){
            this.setState({openDialog: true});
        }
    };
    handleCloseDialog = () => {
        this.setState((state) => ({openDialog: false}));
    };

    handleRequest = () => {
        const {handleAlertCreation, target, scope, alertType, newPublicMessage, files} = this.props;
        const {manualAlertComment} = this.state;
        if (manualAlertComment !== "") {
            handleAlertCreation(target, scope, alertType, newPublicMessage, files, manualAlertComment);
            this.setState({openDialog: false});
        }else {
            this.setState({manualAlertCommentBlank: true});
        }
    }

    renderDialog() {
        const {classes, scope, alertType, newPublicMessage} = this.props;
        const {openDialog, manualAlertComment, manualAlertCommentBlank} = this.state;
        return (<Dialog open={openDialog} onClose={this.handleCloseDialog}>
            <DialogTitle>Confirmar creación de alerta manual</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <b>Ámbito de monitoreo seleccionado: </b> {scope.toUpperCase()}<br></br>
                    <b>Tipo de alerta a crear: </b> 
                    <span className={alertType === RED_ALERT ? classes.redAlert : classes.yellowAlert}>{groupNames[alertType]}</span>
                    <br></br>
                    <b>Detalle del mensaje en el sitio público: </b><br></br>
                    {newPublicMessage}
                </DialogContentText>
                <hr></hr>
                <DialogContentText>
                    Escriba la justificación de la creación de esta alerta.<br></br>
                    <b>(esta justificación no se muestra en el sitio público)</b><br></br>
                </DialogContentText>
                <FormControl fullWidth variant="outlined" component="span"> 
                    <TextField
                        error={manualAlertCommentBlank}
                        id="manual-alert-public-message"
                        label="Justificación"
                        InputLabelProps={{color: 'secondary'}}
                        placeholder="Justificación de prueba" 
                        multiline 
                        variant="outlined"
                        value={manualAlertComment}
                        helperText={manualAlertCommentBlank ? "Debe ingresar una justficación" : null}
                        onChange={e => this.setState({
                            manualAlertComment: e.target.value,
                            manualAlertCommentBlank: e.target.value === ""
                        })}/>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={this.handleRequest} variant='contained' color="primary">Continuar</Button>
                <Button onClick={this.handleCloseDialog} variant='contained' color="primary">Cancelar</Button>
            </DialogActions>
        </Dialog>);
    }

    render() {
        const {classes} = this.props;
        return (<>
            <BlueButton className={classes.root} disableElevation onClick={this.handleOpenDialog}>
                Crear Alerta
            </BlueButton>
            {this.renderDialog()}
        </>);
    }
}

export default withStyles(styles)(ManualAlertButton);

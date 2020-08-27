import React, {Component} from 'react';
import { Button, FormControl, TextField, withStyles, 
    Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText
} from '@material-ui/core';
import {BlueButton} from '@authorities/theme';

const styles = theme => ({
    root: {
        height: '100%'
    },
    dateFilter: {
        marginRight: theme.spacing(2),
        marginBottom: theme.spacing(3)
    },
});

/**
 * A component for rendering a button that handles the connection of a semaphore
 */
class DisconnectSemaphoreButton extends Component {

    state = {
        openDialog: false,
        disconnectionComment: '',
        disconnectionCommentBlank: false
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
        const {handleDisconnection, target, scope, disconnectionPublicMessage, files} = this.props;
        const {disconnectionComment} = this.state;
        if (disconnectionComment !== "") {
            handleDisconnection(target, scope, disconnectionPublicMessage, files, disconnectionComment);
            this.setState({openDialog: false});
        }else {
            this.setState({disconnectionCommentBlank: true});
        }
    }

    renderDialog() {
        const {scope, disconnectionPublicMessage} = this.props;
        const {openDialog, disconnectionComment, disconnectionCommentBlank} = this.state;
        return (<Dialog open={openDialog} onClose={this.handleCloseDialog}>
            <DialogTitle>Confirmar Desconexión de Semáforo</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <b>Ámbito de monitoreo seleccionado: </b> {scope.toUpperCase()}<br></br>
                    <b>Detalle del mensaje en el sitio público: </b><br></br>
                    {disconnectionPublicMessage}
                </DialogContentText>
                <hr></hr>
                <DialogContentText>
                    Escriba la justificación para realizar la desconexión.<br></br>
                    <b>(esta justificación no se muestra en el sitio público)</b><br></br>
                </DialogContentText>
                <FormControl fullWidth variant="outlined" component="span"> 
                    <TextField
                        error={disconnectionCommentBlank}
                        id="disconnection-public-message"
                        label="Justificación"
                        InputLabelProps={{color: 'secondary'}}
                        placeholder="Justificación de prueba" 
                        multiline 
                        variant="outlined"
                        value={disconnectionComment}
                        helperText={disconnectionCommentBlank ? "Debe ingresar una justficación" : null}
                        onChange={e => this.setState({
                            disconnectionComment: e.target.value,
                            disconnectionCommentBlank: e.target.value === ""
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
                Desconectar semáforo
            </BlueButton>
            {this.renderDialog()}
        </>);
    }
}

export default withStyles(styles)(DisconnectSemaphoreButton);

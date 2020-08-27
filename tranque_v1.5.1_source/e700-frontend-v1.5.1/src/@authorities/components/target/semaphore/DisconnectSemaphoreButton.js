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
        disconnectionComment: ''
    };

    handleOpenDialog = () => {
        this.setState({openDialog: true});
    };
    handleCloseDialog = () => {
        this.setState((state) => ({openDialog: false}));
    };

    handleRequest = () => {
        const {handleDisconnection} = this.props;
        const {disconnectionComment} = this.state;
        handleDisconnection(disconnectionComment);
        this.setState({openDialog: false});
    }

    renderDialog() {
        const {scope, publicMessage} = this.props;
        const {openDialog, disconnectionComment} = this.state;
        return (<Dialog open={openDialog} onClose={this.handleCloseDialog}>
            <DialogTitle>Confirmar Desconexión de Semáforo</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <b>Ámbito de monitoreo seleccionado: </b> {scope.toUpperCase()}<br></br>
                    <b>Detalle del mensaje en el sitio público: </b><br></br>
                    {publicMessage}
                </DialogContentText>
                <hr></hr>
                <DialogContentText>
                    Escriba la justificación para realizar la desconexión.<br></br>
                    <b>(esta justificación no se muestra en el sitio público)</b><br></br>
                </DialogContentText>
                <FormControl fullWidth variant="outlined" component="span"> 
                    <TextField
                        id="disconnection-public-message"
                        label="Justificación"
                        InputLabelProps={{color: 'secondary'}}
                        placeholder="Justificación de prueba" 
                        multiline 
                        variant="outlined"
                        value={disconnectionComment}
                        onChange={e => this.setState({disconnectionComment: e.target.value})}/>
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

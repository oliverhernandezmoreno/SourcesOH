import React, {Component} from 'react';
import {history} from '@app/history';
import {reverse} from '@app/urls';
import { Button, FormControl, TextField, 
    Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, 
    withStyles} from '@material-ui/core';
import {BlueButton} from '@authorities/theme';

const styles = theme => ({
    root: {
        height: '100%'
    },
});

/**
 * A component for rendering a button that handles the update of an alert public message
 */
class UpdatePublicMessageButton extends Component {

    state = {
        openDialog: false,
        newPublicMessage: '',
        publicMessageBlank: false
    };

    handleOpenDialog = () => {
        this.setState({openDialog: true});
    };
    handleCloseDialog = () => {
        this.setState({openDialog: false});
    };

    handleRequest = () => {
        const {updatePublicAlertMessage, scope} = this.props;
        const {newPublicMessage} = this.state;
        if (newPublicMessage !== ""){
            updatePublicAlertMessage(newPublicMessage, scope, "GREEN");
            this.setState({openDialog: false});
        }else{
            this.setState({publicMessageBlank: true})
        }
    }

    handleUpdatePublicMessage() {
        const {scope, target, ticket} = this.props;
        if (ticket){
            history.push(reverse('authorities.target.tickets.'+scope+'.open.detail', {target, ticketId: ticket.id}));
        }else{
            this.handleOpenDialog();
        }
    }

    renderDialog() {
        const {openDialog, publicMessageBlank} = this.state;
        return (<Dialog open={openDialog} onClose={this.handleCloseDialog}>
            <DialogTitle>Mensaje a mostrar en el sitio público</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Ingrese el mensaje que será mostrado en el sitio público una vez que confirme su acción:
                </DialogContentText>
                <FormControl fullWidth variant="outlined" component="span"> 
                    <TextField
                        error={publicMessageBlank}
                        id="public-message"
                        label="Mensaje"
                        InputLabelProps={{color: 'secondary'}}
                        placeholder="Escriba su mensaje..." 
                        multiline 
                        variant="outlined"
                        helperText={publicMessageBlank ? "Debe ingresar el mensaje a mostrar en el sitio público" : null}
                        onChange={e => this.setState({
                            newPublicMessage: e.target.value,
                            publicMessageBlank: e.target.value === ""
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
        const {classes, ticket} = this.props;
        return (<>
            <BlueButton className={classes.root} disableElevation onClick={() => this.handleUpdatePublicMessage()}>
                {ticket ? 'Actualizar mensaje desde ticket' : 'Actualizar mensaje'}
            </BlueButton>
            {this.renderDialog()}
        </>);
    }
}



export default withStyles(styles)(UpdatePublicMessageButton);

import React, {Component} from 'react';
import {Button, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, withStyles} from '@material-ui/core';
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
class ConnectSemaphoreButton extends Component {

    state = {
        openDialog: false,
    };

    handleOpenDialog = () => {
        this.setState({openDialog: true});
    };
    handleCloseDialog = () => {
        this.setState((state) => ({openDialog: false}));
    };

    handleRequest = () => {
        const {target, disconnection, handleConnection} = this.props;
        handleConnection(target, disconnection.id);
        this.setState({openDialog: false});
    }

    renderDialog() {
        const {scope, target} = this.props;
        const {openDialog} = this.state;
        return (<Dialog open={openDialog} onClose={this.handleCloseDialog}>
            <DialogTitle>Confirmar Conexión de Semáforo</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Al confirmar esta acción el semáforo <strong>{(scope || "null").toUpperCase()}</strong> del
                    depósito <strong>{target || "null"}</strong> será conectado nuevamente.
                </DialogContentText>
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
                Conectar semáforo
            </BlueButton>
            {this.renderDialog()}
        </>);
    }
}



export default withStyles(styles)(ConnectSemaphoreButton);

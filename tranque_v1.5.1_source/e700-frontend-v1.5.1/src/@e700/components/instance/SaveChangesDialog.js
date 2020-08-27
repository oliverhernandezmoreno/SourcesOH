import React from 'react';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/core/styles';
import {Button, CircularProgress, Dialog, DialogContent, DialogTitle, Typography} from '@material-ui/core';


const useStyles = makeStyles(theme => ({
    buttons: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        marginTop: theme.spacing(4),
        marginBottom: theme.spacing(1)
    },
    button: {
        width: '240px'
    },
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: theme.spacing(1)
    },
    loading: {
        color: theme.palette.primary.main,
        marginRight: theme.spacing(1)
    }
}));

export function SaveChangesDialog({onClose, open, loading, errors}) {
    const classes = useStyles();


    return (
        <Dialog open={open} disableBackdropClick={true} disableEscapeKeyDown={true}>
            <DialogTitle disableTypography>
                <Typography variant="h6">Guarda tu avance</Typography>
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1">
                    {errors ?
                        'El formulario contiene errores.\nPresiona "PERMANECER AQUI" para volver y corregirlos.' :
                        'Presiona "GUARDAR" para que no tengas que volver a llenar los campos' +
                        ' en caso de que salgas del formulario.'
                    }
                </Typography>
                <div className={classes.buttons}>
                    <div className={classes.loadingContainer}>
                        {loading &&
                        <CircularProgress className={classes.loading} size={20}/>
                        }
                        <Button
                            disabled={loading}
                            className={classes.button}
                            onClick={() => {
                                onClose(true);
                            }} variant="contained">
                            {errors ? 'PERMANECER AQUI' : 'GUARDAR Y CONTINUAR'}
                        </Button>
                    </div>
                    <Button
                        disabled={loading}
                        className={classes.button}
                        onClick={() => {
                            onClose(false);
                        }} variant="outlined">
                        CONTINUAR SIN GUARDAR
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

SaveChangesDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired
};

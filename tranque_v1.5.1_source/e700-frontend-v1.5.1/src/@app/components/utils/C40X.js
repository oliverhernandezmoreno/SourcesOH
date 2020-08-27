import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import {Button, Container, Typography} from '@material-ui/core';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';
import {reverse} from '@app/urls';

const styles = theme => ({
    root: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    button: {
        color: '#616469',
        marginTop: '50px',
        padding: '8px 32px',
        textTransform: 'none',
        fontSize: 20
    }
});

const C40X = withStyles(styles)(({classes, error, logout}) => {
    let errorCode = error || 404;
    let msg;
    switch (errorCode) {
        case 401:
            msg = 'Lo sentimos, tu sesión ha expirado por lo que no puedes acceder a esta página';
            break;
        case 403:
            msg = 'Lo sentimos, no tienes permisos para acceder a esta página';
            break;
        case 404:
            msg = 'Lo sentimos, esta página no existe';
            break;
        default:
            msg = 'Lo sentimos';
    }
    return (
        <Container classes={{root: classes.root}} maxWidth="sm">
            <Typography variant="h5">
                Error {errorCode}
            </Typography>
            <Typography variant="body1">
                {msg}
            </Typography>
            {logout ? 
                <Button
                    variant="outlined" color="primary" className={classes.button}
                    onClick={(e) => logout()}>
                    Cerrar sesión
                </Button> : null}
            <Button
                variant="outlined" color="primary" className={classes.button}
                component={Link} to={reverse('home')}>
                Volver al inicio
            </Button>
        </Container>
    );
});

C40X.propTypes = {
    error: PropTypes.number
};

export default C40X;

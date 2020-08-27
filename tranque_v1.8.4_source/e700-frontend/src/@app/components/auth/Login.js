import React, {Component} from 'react';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Button from '@material-ui/core/Button';
import {withStyles} from '@material-ui/core/styles';
import classNames from 'classnames';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = theme => ({
    root: {
        height: '100%',
        color: '#CACACA'
    },
    buttonContainer: {
        marginTop: theme.spacing(4),
        marginLeft: theme.spacing(5)
    },
    button: {
        minWidth: '140px',
        color: '#FFFFFF',
        backgroundColor: '#1A76D1',
        '&:hover': {
            backgroundColor: '#1c98ff'
        },
        '&.disabled': {
            backgroundColor: '#134985'
        }
    },
    progress: {
        marginLeft: theme.spacing(1),
        '&.hide': {
            visibility: 'hidden'
        }
    },
    progressColor: {
        color: '#1A76D1'
    },
    form: {
        width: '100%',
        padding: theme.spacing(4),
        marginTop: theme.spacing(16),
        color: 'rgba(255, 255, 255, 0.5)'
    },
    errorText: {
        marginTop: theme.spacing(2),
        color: theme.palette.error.main
    }
});

/**
 * The login component.
 *
 * @version 1.0.0
 * @author [Nicolás Aguilera](https://gitlab.com/naguilera)
 */
class Login extends Component {
    /**
     * Constructor of this class.
     *
     * @param {props} the input properties
     * @public
     */
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            submitting: false,
            error: {},
            showPassword: false,
            isAuthenticated: false
        };
    }

    /**
     * Function triggered on change of the input, transmits the new value of the
     * input to where the Input Field is embedded.
     *
     * @param {props} the input properties
     * @public
     */
    handleChange = prop => event => {
        this.setState({[prop]: event.target.value});
    };

    /**
     * Function triggered on change of the show password icon, transmits the new
     * value of the state if the password is showed or not.
     *
     * @public
     */
    handleShowPassword = () => {
        this.setState(state => ({showPassword: !state.showPassword}));
    };

    /**
     * Function triggered on sumit of the form.
     *
     * @public
     */
    handleSubmit = event => {
        if (event) {
            event.preventDefault();
        }
        const {username, password} = this.state;
        const error = {};
        let hasErrors = false;
        if (!Boolean(username)) {
            error.username = 'Campo requerido';
            hasErrors = true;
        }
        if (!Boolean(password)) {
            error.password = 'Campo requerido';
            hasErrors = true;
        }
        if (hasErrors) {
            this.setState({submitting: false, error});
            return;
        }
        this.setState({submitting: true, error: {}});
        if (this.props.actions) {
            this.props.actions.login(username, password).subscribe(
                () => {
                    // Success, do nothing because LoginContainer will perform a redirect
                },
                (err) => {
                    const s = {submitting: false};
                    if (!err || err.status !== 401) {
                        s.error = {request: 'Se produjo un error al iniciar la sesión'};
                    } else {
                        s.error = {request: 'Usuario o contraseña incorrecta'};
                    }
                    this.setState(s);
                }
            );
        }
    };

    /**
     * Function triggered with the enter key.
     *
     * @param {ev} the event
     * @public
     */
    catchEnter = (ev) => {
        if (ev.key === 'Enter') {
            // Do code here
            ev.preventDefault();
            this.handleSubmit();
        }
    };

    /**
     * Render this component.
     *
     * @public
     */
    render() {
        const {classes} = this.props;
        const {submitting, error} = this.state;
        const passwordIcon = this.state.showPassword ? <Visibility id="visible-password"/> :
            <VisibilityOff id="hidden-password"/>;

        const usernameProps = {
            error: Boolean(error.username),
            helperText: error.username || ' '
        };
        const passwordProps = {
            error: Boolean(error.password),
            helperText: error.password || ' '
        };

        return (
            <Container classes={{root: classes.root}} maxWidth="sm">
                <CssBaseline/>
                <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center"
                    className={classes.root}>
                    <Typography variant="h4">Plataforma Tranque</Typography>
                    <Box display="flex" flexDirection="column" className={classes.form}>
                        <TextField
                            label="Usuario"
                            margin="dense"
                            autoComplete="username"
                            {...usernameProps}
                            value={this.state.username}
                            onChange={this.handleChange('username')}/>
                        <TextField
                            label="Contraseña"
                            margin="dense"
                            type={this.state.showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            {...passwordProps}
                            value={this.state.password}
                            onChange={this.handleChange('password')}
                            onKeyPress={this.catchEnter}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">
                                    <IconButton
                                        id="visibility-password-button"
                                        aria-label="Toggle password visibility"
                                        onClick={this.handleShowPassword}>
                                        {passwordIcon}
                                    </IconButton>
                                </InputAdornment>
                            }}/>
                    </Box>
                    <Box className={classes.buttonContainer} display="flex" alignItems="center">
                        <Button type="submit" variant="contained" onClick={this.handleSubmit}
                            disabled={submitting}
                            className={classNames(classes.button, {disabled: submitting})}>
                            ENTRAR
                        </Button>
                        <CircularProgress classes={{colorPrimary: classes.progressColor}}
                            className={classNames(classes.progress, {hide: !submitting})}/>
                    </Box>
                    <Typography className={classes.errorText} variant="subtitle1">{error.request || ' '}</Typography>
                </Box>
            </Container>
        );
    }
}

export default withStyles(styles)(Login);

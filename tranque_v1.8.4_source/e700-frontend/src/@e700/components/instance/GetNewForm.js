import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import * as config from '@app/config';

import * as moment from 'moment/moment';
import 'moment/locale/es';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import Box from '@material-ui/core/Box';
import FormControl from '@material-ui/core/FormControl';
import {SingleSelect} from 'react-select-material-ui';
import {ArrowDropDown} from '@material-ui/icons';

import PropTypes from 'prop-types';
import * as FormService from '@app/services/backend/form';
import TextField from '@material-ui/core/TextField';
import {Typography} from '@material-ui/core';

import {snackbarActions} from '@app/actions/snackbar.actionCreators';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {stylesFn} from '../registry/CreateInstanceButton';
import {OPEN, ANSWER_TO_VALIDATE, ANSWER_RECEIVED, ANSWER_REVIEWED} from '@e700/constants/reportFormStates';

const inputLabelStyles = {
    div: {
        backgroundColor: "#444444",
        padding: "20px 20px 200px 20px"
    },
    label: {
        color: "#ffffff"
    }
};

const styles = theme => ({
    select: {
        minWidth: '120px',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(1)
    },
    dialogContent: {
        paddingTop: theme.spacing(0),
        paddingLeft: theme.spacing(4),
        paddingRight: theme.spacing(4),
        paddingBottom: theme.spacing(5)
    },
    dropdownArrow: {
        color: '#6D6D6D'
    },
    btnSolicitar: {
        color: '#ffffff',
        backgroundColor: '#1A76D1',
        width: '220px'
    },
    txtSolicitar: {
        textTransform: 'capitalize',
    },
});


export const GetNewForm = withStyles(styles)(class extends SubscribedComponent {

    state = {
        openSnack: false,
        snackVariant: 'success',
        snackMessage: '',
        open: false,
        comment: '',
        id: '',
        requesting: ''
    };

    constructor(props) {
        super(props);
        moment.locale(config.MOMENT_LOCALE);
    }

    handlePeriodChange = event => {
        this.setState({id: event});
    };

    handleCommentChange = event => {
        this.setState({comment: event.target.value});
    };

    handleClickOpen = () => {
        this.setState({
            open: true,
            start_date: null,
            end_date: null,
            description: ''
        });
    };

    handleClose = () => {
        this.setState(state => {
            if (state.requesting) {
                return null;
            }
            return {open: false};
        });
    };

    handleSnackClose = () => {
        this.setState({openSnack: false});
    };

    createRequest = () => {
        const {onCreate, actions} = this.props;
        const {comment, id} = this.state;
        this.setState({requesting: true, showError: false});
        this.subscribe(
            FormService.createRequest({
                form_codename: 'e700',
                id: id,
                comment: comment
            }),
            (newRequest) => {
                actions.openSnackbar('Solicitud creada.', 'success', null, 6000);
                this.setState({open: false});
                if (onCreate) onCreate(newRequest, id);
            },
            response => {
                if (response.data[0] === 'Can\'t request reassignment if there is a request pending') {
                    this.setState({
                        showError: true,
                        requesting: false
                    });
                } else {
                    actions.openSnackbar('Hubo un error al crear la solicitud.', 'error', null, 6000);
                    this.setState({requesting: false});
                }
            },
            () => {
                this.setState({requesting: false});
            });
    };

    findPeriods = (instances, periods) => {
        let new_periods = periods;
        instances.forEach(i => periods.forEach(p => {
            if ((i.state === OPEN || i.state === ANSWER_TO_VALIDATE) && i.period===p.period){
                let d_index = new_periods.indexOf(p);
                if (d_index > -1){
                    new_periods.splice(d_index,1);
                }
            }
        }));

        let noDuplicated = [];
        new_periods.forEach( p => {
            if (!noDuplicated.some(n => n.period === p.period)) {
                noDuplicated.push(p)
            }});

        return noDuplicated.map(i => {return {label: i.period, value: i.id}});
    };

    render() {
        const {instances, classes} = this.props;
        const {period, showError} = this.state;

        const periods = instances.filter(i =>
            i.state === ANSWER_RECEIVED ||
          i.state === ANSWER_REVIEWED);

        const filterPeriods = this.findPeriods(instances, periods);

        return (
            <>
                <Button className={classes.btnSolicitar} onClick={this.handleClickOpen}>
                    <Typography className={classes.txtSolicitar}>Solicitar editar formulario</Typography>
                </Button>
                <Dialog
                    open={this.state.open}
                    onClose={this.handleClose}
                    fullWidth={true}
                    maxWidth="sm"
                >
                    <DialogTitle id="form-dialog-title">Solicitar formulario</DialogTitle>
                    <DialogContent className={classes.dialogContent}>
                        <Box display="flex" flexDirection="column">
                            <Typography>
                                Si ya enviaste un formulario a SERNAGEOMIN, <strong>de manera excepcional </strong>
                                puedes soliciar un nuevo formulario para el mismo trimestre. SERNAGEOMIN puede aprobar
                                o rechazar esta solicitud.
                            </Typography>
                            <FormControl className={classes.select}>
                                <SingleSelect
                                    SelectProps={{
                                        msgNoOptionsAvailable: 'No hay más periodos disponibles',
                                        msgNoOptionsMatchFilter: 'No hay periodos que coincidan con el filtro',
                                        components: {
                                            DropdownIndicator: () => <ArrowDropDown className={classes.dropdownArrow}/>,
                                            IndicatorSeparator: () => null
                                        },
                                        styles: stylesFn
                                    }}
                                    InputLabelProps={{ style: inputLabelStyles.label }}
                                    label="Periodo"
                                    options={filterPeriods}
                                    value={period}
                                    onChange={this.handlePeriodChange}
                                />
                            </FormControl>
                            <FormControl>
                                <TextField
                                    label="Detalla el motivo de la solicitud"
                                    onChange={this.handleCommentChange}
                                />
                            </FormControl>
                            {showError && <Typography variant="caption" color="error" align="right">
                                Ya existe una solicitud abierta para este periodo
                            </Typography>}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} variant='outlined'>
                            Cancelar
                        </Button>
                        <Button
                            onClick={this.createRequest}
                            variant='outlined'>
                            Aceptar
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    }
});

GetNewForm.propTypes = {
    onCreate: PropTypes.func
};

function mapDispatchToProps(dispatch) {
    return {actions: bindActionCreators(snackbarActions, dispatch)};
}

export default connect(null, mapDispatchToProps)(GetNewForm);

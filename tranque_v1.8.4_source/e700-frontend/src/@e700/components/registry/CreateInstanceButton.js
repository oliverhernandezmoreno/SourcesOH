import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import { Button, Box,
    Dialog, DialogActions, DialogContent, DialogTitle,
    InputLabel, FormControl, Select, MenuItem,
    TextField, Typography } from '@material-ui/core';
import {SingleSelect} from 'react-select-material-ui';
import * as config from '@app/config';
import * as moment from 'moment/moment';
import 'moment/locale/es';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import * as TargetService from '@app/services/backend/target';
import * as FormService from '@app/services/backend/form';
import {ArrowDropDown} from '@material-ui/icons';
import {snackbarActions} from '@app/actions/snackbar.actionCreators';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import theme from '@e700/theme';


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
        color: '#6D6D6D',
        marginRight: 25
    },
    singleSelect: {
        [theme.breakpoints.up('sm')]: {
            width: '561px'
        },
        [theme.breakpoints.up('xs')]: {
            width: '105%'
        },
        minWidth: '250px',
        maxWidth: '561px',
    },
});

const inputLabelStyles = {
    div: {
        backgroundColor: "#444444",
        padding: "20px 20px 200px 20px"
    },
    label: {
        color: "#ffffff"
    }
};

export const stylesFn: StylesConfig = {
    control: (base: any, state: any) => ({
        ...base,
        background: "transparent",
        borderBottom: state.isFocused ? theme.palette.white.default : theme.palette.white.dark,
        borderBottomWidth: 2,
        borderBottomStyle: "solid",
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
        borderRadius: 0,
        boxShadow: "none",
        marginRight: 25,
        "&:hover": { borderBottom: theme.palette.white.default, borderBottomWidth: 2, borderBottomStyle: "solid" }
    }),
    placeholder: (base: any, state: any) => ({
        ...base,
        backgroundColor: theme.palette.white.default
    }),
    dropdownIndicator: (base: any) => ({
        ...base,
        color: theme.palette.white.dark,
        "&:hover": { color: theme.palette.white.default }
    }),
    menuList: (base: any) => ({
        ...base,
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.white.default
    }),
    option: (base: any, { isSelected }) => ({
        ...base,
        backgroundColor: isSelected ? theme.palette.primary.light : theme.palette.primary.main,
        color: theme.palette.white.default,
        "&:hover": { backgroundColor: theme.palette.primary.light, color: theme.palette.white.default }
    }),
    singleValue: (base: any) => ({
        ...base,
        color: theme.palette.white.main
    })
};




/**
 * The "Asignar nueva instancia de formulario" button launchs a popup with
 * the form.
 *
 * @version 1.0.0
 * @author [Nicolás Aguilera](https://gitlab.com/naguilera)
 */
export const CreateInstanceButton = withStyles(styles)(class extends SubscribedComponent {

    state = {
        trimester: 1,
        year: moment().year(),
        target: '',
        version: '',
        versionOptions: [],
        targetOptions: [],
        open: false,
        requesting: false
    };

    constructor(props) {
        super(props);
        moment.locale(config.MOMENT_LOCALE);
    }

    componentDidMount() {
        this.subscribe(
            TargetService.listAll({cache: config.DEFAULT_CACHE_TIME}),
            (targets) => this.setState({targetOptions: targets})
        );

        this.subscribe(
            FormService.listAllVersions({form_codename: 'e700'}),
            (versions) => this.setState({versionOptions: versions})
        );
    }

    handleChangeV = event => {
        this.setState({version: event.target.value});
    };

    handleChangeT = event => {
        this.setState({target: event});
    };

    handleTrimesterChange = event => {
        this.setState({trimester: +event.target.value});
    };

    handleYearChange = event => {
        this.setState({year: (event.target.value + '').replace(/\D/g, '')});
    };

    createInstance = () => {
        const {onCreate, actions} = this.props;
        const {trimester, year, version, target} = this.state;
        this.setState({requesting: true, showError: false});
        this.subscribe(
            FormService.createInstance({
                form_codename: 'e700',
                trimester: trimester,
                year: year,
                version: version,
                target_canonical_name: target
            }),
            (newInstance) => {
                actions.openSnackbar('Instancia creada.', 'success', null, 6000);
                this.setState({ open: false });
                if (onCreate) onCreate(newInstance);
            },
            response => {
                if (response.data[0] === 'An open instance already exists') {
                    this.setState({
                        showError: true,
                        requesting: false
                    });
                } else {
                    actions.openSnackbar('Hubo un error al crear la instancia.', 'error', null, 6000);
                    this.setState({ requesting: false });
                }
            },
            () => {
                this.setState({requesting: false});
            });
    };

    handleClickOpen = () => {
        this.setState({
            open: true,
            start_date: null,
            end_date: null,
            target: '',
            version: ''
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


    render() {
        const {classes} = this.props;
        const {versionOptions, targetOptions,
            year, trimester, version, target,
            open, requesting, showError} = this.state;
        const versions = versionOptions.map((v, index) => (
            <MenuItem key={index} value={v.id}>{v.title}</MenuItem>
        ));
        const targets = targetOptions.map(t => {
            if (t.meta && t.meta.id_sngm) return {label: t.name +
                  " - " + t.meta.id_sngm.value, value: t.canonical_name};
            else return {label: t.name, value: t.canonical_name};
        });
        const disableCreate = !(year && trimester && version && target);

        return (
            <>
                <Button variant="outlined" onClick={this.handleClickOpen}>
                    <Typography>Asignar nueva instancia de formulario</Typography>
                </Button>
                <Dialog open={open} onClose={this.handleClose} fullWidth={true} maxWidth="sm">
                    <DialogTitle id="form-dialog-title">Asignar nueva instancia de formulario</DialogTitle>
                    <DialogContent className={classes.dialogContent}>
                        <Box display="flex" flexDirection="column">
                            <FormControl className={classes.select} disabled={targets.length < 1 || requesting}>
                                <SingleSelect
                                    SelectProps={{
                                        isDisabled: targets.length < 1 || requesting,
                                        msgNoOptionsAvailable: 'No hay más depósitos disponibles',
                                        msgNoOptionsMatchFilter: 'No hay depósitos que coincidan con el filtro',
                                        components: {
                                            DropdownIndicator: () => <ArrowDropDown className={classes.dropdownArrow}/>,
                                            IndicatorSeparator: () => null
                                        },
                                        styles: stylesFn
                                    }}
                                    InputLabelProps={{ style: inputLabelStyles.label }}
                                    className={classes.singleSelect}
                                    label="Depósito"
                                    options={targets}
                                    value={target}
                                    onChange={this.handleChangeT}
                                />
                            </FormControl>
                            <FormControl className={classes.select} disabled={versions.length < 1 || requesting}>
                                <InputLabel htmlFor="version">Versión</InputLabel>
                                <Select
                                    value={version}
                                    onChange={this.handleChangeV}
                                    inputProps={{
                                        id: 'version'
                                    }}>
                                    {versions}
                                </Select>
                            </FormControl>
                            <FormControl className={classes.select} disabled={requesting}>
                                <InputLabel htmlFor="trimester">Trimestre</InputLabel>
                                <Select
                                    value={trimester}
                                    onChange={this.handleTrimesterChange}
                                    inputProps={{
                                        id: 'trimester'
                                    }}>
                                    <MenuItem value={1}>1</MenuItem>
                                    <MenuItem value={2}>2</MenuItem>
                                    <MenuItem value={3}>3</MenuItem>
                                    <MenuItem value={4}>4</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                label="Año"
                                disabled={requesting}
                                inputProps={{
                                    type: 'number',
                                    min: 1900,
                                    step: 1
                                }}
                                value={year}
                                onChange={this.handleYearChange}
                                margin="normal"
                                fullWidth
                            />
                            {showError && <Typography variant="caption" color="error" align="right">
                                Ya existe un formulario abierto para este trimestre
                            </Typography>}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} disabled={requesting} variant='outlined'>
                            Cancelar
                        </Button>
                        <Button onClick={this.createInstance} disabled={disableCreate || requesting} variant='outlined'>
                            Asignar
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    }
});

CreateInstanceButton.propTypes = {
    onCreate: PropTypes.func
};

function mapDispatchToProps(dispatch) {
    return { actions: bindActionCreators(snackbarActions, dispatch) };
}

export default connect(null, mapDispatchToProps)(CreateInstanceButton);

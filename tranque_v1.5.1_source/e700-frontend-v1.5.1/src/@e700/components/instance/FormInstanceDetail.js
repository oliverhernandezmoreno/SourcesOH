import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import {Button, Box, Container, Grid, Step, StepButton, Stepper, Typography} from '@material-ui/core';
import {CheckCircle, Home, KeyboardArrowLeft, KeyboardArrowRight, Save} from '@material-ui/icons';
import FormInstanceStep from '@e700/components/instance/FormInstanceStep';
import {FormInstanceAnnexes} from '@e700/components/instance/FormInstanceAnnexes';
import FormInstanceDispatch from '@e700/components/instance/FormInstanceDispatch';
import { canEditForm, canValidateForm, canSendForm } from '@e700/constants/userActions';

import {history} from '@app/history';
import {reverse} from '@app/urls';
import {isDisabled} from '@e700/e700';
import * as FormService from '@app/services/backend/form';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import sum from 'hash-sum';
import {SaveChangesDialog} from '@e700/components/instance/SaveChangesDialog';
import CircularProgress from '@material-ui/core/CircularProgress';

import {snackbarActions} from '@app/actions/snackbar.actionCreators';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';


const styles = theme => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
    },
    container: {
        maxWidth: '1000px',
        flexGrow: 1
    },
    footer: {
        flexGrow: 1,
        backgroundColor: "#424242"
    },
    stepLabel: {
        color: '#ffffff',
        [theme.breakpoints.up('xs')]: {
            display: 'none'
        },
        [theme.breakpoints.up('sm')]: {
            display: 'block'
        }
    },
    stepTitle: {
        color: '#ffffff',
        paddingLeft: 30,
        paddingTop: 30
    },
    buttons: {
        height: theme.spacing(15),
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonSave: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        color: '#ffffff'
    },
    buttonSteps: {
        backgroundColor: theme.palette.secondary.main,
        minWidth: theme.spacing(18),
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        marginLeft: theme.spacing(1)
    },
    reasonBox: {
        backgroundColor: theme.palette.secondary.main,
        marginLeft: '30px',
        marginRight: '30px',
        borderRadius: '2px',
    },
});

function removeKeysWithEmptyStrings(obj) {
    if (obj === null) {
        return {};
    }
    return Object.entries(obj).reduce(
        (acc, [key, value]) => {
            if (typeof value === 'object') {
                const newValue = removeKeysWithEmptyStrings(value);
                if (Object.keys(newValue).length > 0) {
                    return {...acc, [key]: newValue};
                }
            } else if (value !== null && value !== '') {
                return {...acc, [key]: value};
            }
            return acc;
        },
        {}
    );
}

class FormInstanceDetail extends SubscribedComponent {
    state = {
        form: undefined,
        steps: [],
        answers: {},
        formCodename: 'e700',
        newFiles: {},
        showSaveDialog: false,
        hasErrors: false,
        onCloseDialog: () => ({}),
        saving: false,
        originalHash: sum({}),
        originalAnswers: {}
    };

    componentDidMount() {
        const id = this.props.match.params.id;
        const targetCanonicalName = this.props.match.params.target_canonical_name;
        const {formCodename} = this.state;
        const activeStep = (+this.props.match.params.step - 1) || 0;
        this.subscribe(
            FormService.readInstance({form_codename: formCodename, id}),
            form => {
                const steps = form.version_schema.steps.map(step => step.title).concat('Anexos', 'Envío');
                const answers = removeKeysWithEmptyStrings(form.answer);
                this.setState({
                    form,
                    steps,
                    answers,
                    answersHash: sum(answers),
                    originalAnswers: JSON.parse(JSON.stringify(answers))
                });
                history.replace(reverse('e700.form', {
                    target_canonical_name: targetCanonicalName,
                    id: this.props.match.params.id,
                    step: activeStep >= 0 && activeStep < steps.length ? activeStep + 1 : 1
                }));
            });
    }

    answersHasChanged() {
        return this.state.answersHash !== sum(this.state.answers);
    }

    updateAnswers() {
        return (key, value) => {
            this.setState({
                answers: removeKeysWithEmptyStrings({
                    ...this.state.answers,
                    [key]: value
                })
            });
        };
    }

    updateValidator = (failureState) => {
        this.setState({hasErrors: (failureState && Object.keys(failureState).length > 0) || false});
    };

    saveAnswers(callback) {
        const {answers, formCodename} = this.state;
        this.setState({saving: true});
        this.subscribe(
            FormService.saveAnswers({answer: answers,
                id: this.props.match.params.id,
                form_codename: formCodename}),
            () => {
                this.props.actions.openSnackbar('Datos guardados correctamente.',
                    'success', null, null);
                this.setState({
                    originalAnswers: JSON.parse(JSON.stringify(answers)),
                    answersHash: sum(answers),
                    saving: false
                });
                if (typeof callback === 'function') {
                    callback();
                }
            }
        );
    }

    handleSend = () => {
        const {params} = this.props.match;
        this.subscribe(
            FormService.sendForm({form_codename: this.state.formCodename, id: params.id}),
            response => {
                this.props.actions.openSnackbar('Respuestas enviadas exitosamente.', 'success', null, null);
                history.push(reverse('e700.target', { target_canonical_name: params.target_canonical_name }));
            },
            (err) => this.props.actions.openSnackbar('Se produjo un error en el envío. Intente más tarde.', 'error', null, null)
        );
    };

    updateInstanceState(inst_state){
        return (event) => {
            event.preventDefault();
            const {formCodename, form} = this.state;
            const {params} = this.props.match;
            this.subscribe(
                FormService.updateFormState({
                    state: inst_state,
                    id: form.id,
                    form_codename: formCodename
                }),
                response => {
                    this.props.actions.openSnackbar('El formulario se ha actualizado existosamente.', 'success', null, null);
                    history.push(reverse('e700.target', { target_canonical_name: params.target_canonical_name }));
                },
                (err) => this.props.actions.openSnackbar('Se produjo un error al actualizar el formulario. Intente más tarde.', 'error', null, null)
            );
        };
    };

    getActiveSections = () => {
        const activeStep = +this.props.match.params.step - 1;
        const step = this.state.form.version_schema.steps[activeStep];
        return step ? step.sections : [];
    };

    goTo(step) {
        history.push(reverse('e700.form', {target_canonical_name: this.props.match.params.target_canonical_name,
            id: this.props.match.params.id, step: step + 1
        }));
        window.scrollTo({top: 0});
    }

    handleDialogClose(step) {
        return (save) => {
            if (save && !this.state.hasErrors) {
                // save changes
                this.saveAnswers(() => {
                    this.goTo(step);
                    this.setState({showSaveDialog: false});
                });
            } else if (!save) {
                // discard changes
                const answers = removeKeysWithEmptyStrings(this.state.originalAnswers);
                this.setState({showSaveDialog: false, answers, answersHash: sum(answers)});
                this.goTo(step);
            } else {
                // stay in page to fix changes
                this.setState({showSaveDialog: false});
            }
        };
    }

    checkGoTo(step) {
        if (!this.answersHasChanged()) {
            this.goTo(step);
        } else {
            this.setState({
                showSaveDialog: true,
                onCloseDialog: this.handleDialogClose(step)
            });
        }
    }

    handleNext = () => {
        const activeStep = +this.props.match.params.step - 1;
        const changed = this.answersHasChanged();
        if (changed && !this.state.hasErrors) {
            this.saveAnswers(() => this.goTo(activeStep + 1));
        } else if (!changed) {
            this.goTo(activeStep + 1);
        } else {
            this.checkGoTo(activeStep + 1);
        }
    };

    handleBack = () => {
        const activeStep = +this.props.match.params.step - 1;
        this.checkGoTo(activeStep - 1);
    };

    handleStep = step => () => {
        this.checkGoTo(step);
    };

    handleInit = event => {
        event.preventDefault();
        const {params} = this.props.match;
        if (history) {
            history.push(reverse('e700.target', { target_canonical_name: params.target_canonical_name }));
        }
    };


    uploadFiles = ({annex, files}) => {
        const {formCodename, form} = this.state;
        // newFiles is a dict with annexes as keys and as value an array of {file, status, doc, reason}
        if (files.length > 0) {
            // add newFiles to state
            this.setState(state => {
                const newFiles = state.newFiles;
                return {
                    newFiles: {
                        ...newFiles,
                        [annex]: [...(newFiles[annex] || []),
                            ...files.map(f => ({file: f, status: 'uploading'}))]
                    }
                };
            });
            files.forEach(file => {
                // for each file start uploading immediately, and after response update status accordingly
                this.subscribe(
                    FormService.uploadInstanceFile({
                        file,
                        id: form.id,
                        form_codename: formCodename,
                        meta: {annex: {value: annex}}
                    }),
                    doc => {
                        this.setState(state => {
                            const newFiles = state.newFiles;
                            return {
                                newFiles: {
                                    ...newFiles,
                                    [annex]: newFiles[annex].map(f =>
                                        f.file === file ? {
                                            file: f.file,
                                            status: 'done',
                                            doc: doc
                                        } : f)
                                }
                            };
                        });
                    },
                    error => {
                        let msg = 'Error al intentar cargar el archivo';
                        if (error && error.status && error.status === 413) {
                            msg = 'El archivo excede el tamaño soportado';
                        } else if (error && error.status && error.status === 400 && error.data[0] === 'File already exists') {
                            msg = 'El archivo ya existe';
                        }
                        this.setState(state => {
                            const newFiles = state.newFiles;
                            return {
                                newFiles: {
                                    ...newFiles,
                                    [annex]: newFiles[annex].map(f =>
                                        f.file === file ? {
                                            file: f.file,
                                            status: 'error',
                                            reason: msg
                                        } : f)
                                }
                            };
                        });
                    }
                );
            });
        }
    };

    deleteFile = (doc) => {
        const {formCodename, form} = this.state;
        const annex = doc.meta && doc.meta.annex ? doc.meta.annex.value : '-';
        // TODO add confirmation with warning "this cannot be undone"
        this.subscribe(
            FormService.deleteInstanceFile({
                form_codename: formCodename,
                form_id: form.id,
                id: doc.id
            }),
            () => {
                this.setState(state => ({
                    form: {
                        ...state.form,
                        documents: state.form.documents.filter(d => d.id !== doc.id)
                    },
                    newFiles: {
                        ...state.newFiles,
                        [annex]: (state.newFiles[annex] || []).filter(file => file.doc.id !== doc.id)
                    }
                }));
            }
        );
    };

    renderStep() {
        const activeStep = +this.props.match.params.step - 1;
        const {steps} = this.state;
        const {user} = this.props;
        if (activeStep === steps.length - 2) {
            const annexesProps = {
                form: this.state.form,
                uploadFiles: this.uploadFiles,
                newFiles: this.state.newFiles,
                deleteFile: this.deleteFile,
                user: user
            };
            return <FormInstanceAnnexes {...annexesProps}/>;
        }
        if (activeStep === steps.length - 1) {
            return (
                <FormInstanceDispatch
                    newFiles={this.state.newFiles}
                    schema={this.state.form.version_schema}
                    answers={this.state.answers}
                    documents={this.state.form.documents}/>
            );
        }
        if (activeStep < steps.length - 2) {
            return (
                <FormInstanceStep
                    stepTitle={steps[activeStep]}
                    sections={this.getActiveSections()}
                    updateAnswers={this.updateAnswers()}
                    updateValidator={this.updateValidator}
                    answers={this.state.answers}
                    form={this.state.form}
                    user={user}/>
            );
        }
    }

    renderFooterButtons() {
        const {classes, user} = this.props;
        const disabled = isDisabled(this.state.form.state, canEditForm(user));
        const {steps, saving, hasErrors} = this.state;
        const activeStep = +this.props.match.params.step - 1;
        const saveDisabled = disabled ||
                             !this.answersHasChanged() ||
                             activeStep === steps.length - 2 ||
                             hasErrors ||
                             saving;

        const noShowButtons = this.state.form.state !== 'answer_to_validate' ||
          this.state.form.state !== 'answer_validated';

        const editState = this.state.form.state === 'open';
        const validateState = this.state.form.state === 'answer_to_validate';
        const sendState = this.state.form.state === 'answer_validated';

        const showInitButton =  (canEditForm(user) && !editState) ||
                                (canValidateForm(user) && !validateState) ||
                                (canSendForm(user) && !sendState);
        return <>
            {/*"save" in all steps*/}
            <Grid item container xs={6} className={classes.buttons}>
                {canEditForm(user) &&
                <Button
                    disabled={saveDisabled}
                    className={classes.buttonSave}
                    variant="contained"
                    color='secondary'
                    startIcon={saving ? <CircularProgress size={25}/> : <Save/>}
                    onClick={() => this.saveAnswers()}>
                    Guardar
                </Button>}
            </Grid>
            {/*"back" disabled in first step*/}
            <Grid item container xs={6} className={classes.buttons}>
                <Button
                    disabled={activeStep === 0 || saving}
                    variant="outlined"
                    onClick={this.handleBack}
                    startIcon={<KeyboardArrowLeft/>}
                    className={classes.buttonSteps}>
                    Atrás
                </Button>
                {/*"continue" not in last step*/}
                {activeStep < steps.length - 1 && canEditForm(user) &&
                  noShowButtons && (
                    <Button
                        disabled={saving}
                        variant="outlined"
                        onClick={this.handleNext}
                        startIcon={<KeyboardArrowRight/>}
                        className={classes.buttonSteps}>
                        {saveDisabled ? 'Continuar' : 'Guardar y continuar'}
                    </Button>
                )}
                {activeStep < steps.length - 1 && (canValidateForm(user) || canSendForm(user)) && (
                    <Button
                        disabled={saving}
                        variant="outlined"
                        onClick={this.handleNext}
                        startIcon={<KeyboardArrowRight/>}
                        className={classes.buttonSteps}>
                        Continuar
                    </Button>
                )}
                {/*"send" only in last step*/}{/*If there are no answers, this button is disabled*/}
                {activeStep === steps.length - 1 && (
                    <>
                        {canEditForm(user) && editState &&
                    <Button
                        disabled={saving || Object.keys(this.state.answers).length === 0}
                        variant="outlined"
                        onClick={this.updateInstanceState('answer_to_validate')}
                        startIcon={<CheckCircle/>}
                        className={classes.buttonSteps}>
                        Finalizar edición
                    </Button>}
                        {canValidateForm(user) && validateState &&
                      (<Button
                          disabled={saving || Object.keys(this.state.answers).length === 0}
                          variant="outlined"
                          onClick={this.updateInstanceState('answer_validated')}
                          startIcon={<CheckCircle/>}
                          className={classes.buttonSteps}>
                          Validar
                      </Button>)}
                        {canSendForm(user) && sendState &&
                      <Button
                          disabled={saving || Object.keys(this.state.answers).length === 0}
                          variant="outlined"
                          onClick={this.handleSend}
                          startIcon={<CheckCircle/>}
                          className={classes.buttonSteps}>
                          Enviar
                      </Button>}
                        {showInitButton && (
                            <Button
                                variant="outlined"
                                onClick={this.handleInit}
                                startIcon={<Home/>}
                                className={classes.buttonSteps}>
                            Volver al inicio
                            </Button>
                        )}
                    </>
                )}
            </Grid>
        </>;
    }


    render() {
        if (this.state.form === undefined) return <div>Cargando...</div>;
        const {classes} = this.props;
        const {steps, showSaveDialog, onCloseDialog, saving, hasErrors, form} = this.state;
        const activeStep = +this.props.match.params.step - 1;
      
        return (
            <div className={classes.root}>
                <Container className={classes.container}>
                    <Stepper alternativeLabel nonLinear activeStep={activeStep}>
                        {steps.map((label, index) => {
                            return (
                                <Step key={label}>
                                    <StepButton disabled={saving} onClick={this.handleStep(index)}>
                                        <div className={classes.stepLabel}>{label}</div>
                                    </StepButton>
                                </Step>
                            );
                        })}
                    </Stepper>
                    {form.reason.length > 0 &&
                      <Box className={classes.reasonBox}>
                          <Typography>{form.reason}</Typography>
                      </Box>
                    }
                    <Typography className={classes.stepTitle} variant="h6">{steps[activeStep]}</Typography>
                    {this.renderStep()}
                </Container>
                <div className={classes.footer}>
                    <Container>
                        <Grid container>
                            {this.renderFooterButtons()}
                        </Grid>
                    </Container>
                </div>
                <SaveChangesDialog open={showSaveDialog}
                    onClose={onCloseDialog}
                    loading={saving}
                    errors={hasErrors}/>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        isAuthenticated: state.auth.isAuthenticated,
        user: state.auth.user
    };
}

function mapDispatchToProps(dispatch) {
    return { actions: bindActionCreators(snackbarActions, dispatch) };
}

FormInstanceDetail.propTypes = {
    classes: PropTypes.object
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(FormInstanceDetail));

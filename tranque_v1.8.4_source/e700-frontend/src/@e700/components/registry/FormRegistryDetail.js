import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import {Stepper, Step, StepButton,
    Button, Typography, Grid, Container} from '@material-ui/core';
import {KeyboardArrowLeft, KeyboardArrowRight} from '@material-ui/icons';

import FormRegistryStep from '@e700/components/registry/FormRegistryStep';
import FormRegistryObservations from '@e700/components/registry/FormRegistryObservations';
import {HttpClient} from '@app/services';
import {history} from '@app/history';
import * as config from '@app/config';
import {reverse} from '@app/urls';
import {FormInstanceAnnexes} from '@e700/components/instance/FormInstanceAnnexes';

const styles = theme => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
    },
    stepLabel: {
        [theme.breakpoints.up('xs')]: {
            display: 'none'
        },
        [theme.breakpoints.up('sm')]: {
            display: 'block'
        }
    },
    stepTitle: {
        paddingLeft: 30,
        paddingTop: 30,
    },
    button2: {
        marginTop: '40px',
        backgroundColor: theme.palette.secondary.main,
        borderRadius: '4px',
        width: '147px',
        height: '45px',
        marginRight: '10px'
    },
    button3: {
        marginTop: '40px',
        backgroundColor: theme.palette.secondary.main,
        borderRadius: '4px',
        width: '147px',
        height: '45px'
    },
    button4: {
        marginTop: '40px',
        backgroundColor: theme.palette.secondary.main,
        borderRadius: '4px',
        width: '147px',
        height: '45px'
    },
    buttons: {
        height: theme.spacing(15),
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    completed: {
        display: 'inline-block'
    },
    instructions: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        maxWidth: '1000px'
    },
    footer: {
        flexGrow: 1,
        backgroundColor: "#424242"
    },
    container: {
        maxWidth: '100%'
    },
    textVolver: {
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: '500',
        letterSpacing: '1.25px',
        lineHeight: '16px',
        width: '91px',
        textAlign: 'center'
    },
    textContinuar: {
        fontSize: '14px',
        fontWeight: '500',
        letterSpacing: '1.25px',
        lineHeight: '16px',
        width: '91px',
        textAlign: 'center'
    },
    arrows: {
        color: '#ffffff'
    },
});

class FormRegistryDetail extends React.Component {
    state = {
        form: undefined,
        activeStep: 0,
        completed: new Set(),
        skipped: new Set(),
        answers: {},
        formVersion: 'e700',
        cases: [],
    };

    componentDidMount() {
        this.fetchCases();
        this.fetchInstance();
    }

    fetchInstance = () => {
        this._isMounted = true;
        let id = this.props.match.params.id;
        const url = `${config.API_HOST}/v1/form/${this.state.formVersion}/instance/${id}/`;
        HttpClient.get(url).subscribe(obj => {
            this.setIntanceState(obj);
        });
    };

    setIntanceState = (obj) => {
        if (this._isMounted) {
            const _answers = obj.data.answer || {};
            this.setState({
                form: obj.data,
                answers: _answers
            });
        }
    };

    onCommentCreate = comment=>{
        this.setState(state=>({
            form: {
                ...state.form,
                comments: [...state.form.comments, comment]
            }
        }))
    }

    fetchCases = () => {
        const casesUrl = `${config.API_HOST}/v1/form-case/`;
        HttpClient
            .get(casesUrl)
            .subscribe(obj => {
                if (this._isMounted) {
                    if (obj.data && obj.data.results) {
                        this.setState({
                            cases: obj.data.results.sort((a, b) => {
                                return a.created_at > b.created_at ? -1 : 1;
                            })
                        });
                    }
                }
            });
    };

    componentWillUnmount() {
        this._isMounted = false;
    }

    getSteps = () => {
        return this.state.form.version_schema.steps.map(step => {
            return step.title;
        });
    };

    lastSteps = () => {
        return this.getSteps().concat('Anexos', 'Observaciones');
    };

    getSections = () => {
        return this.state.form.version_schema.steps[this.state.activeStep].sections;
    };

    totalSteps = () => this.getSteps().length;

    totalAllSteps = () => this.lastSteps().length;

    handleNext = () => {
        this.setState(state => ({
            activeStep: state.activeStep + 1
        }));
    };

    handleBack = () => {
        this.setState(state => ({
            activeStep: state.activeStep - 1
        }));
    };

    handleStep = step => () => {
        this.setState({
            activeStep: step
        });
    };

    handleInit = event => {
        event.preventDefault();
        if (history) {
            history.push(reverse('e700.registry'));
        }
    };

    skippedSteps() {
        return this.state.skipped.size;
    }

    isStepSkipped(step) {
        return this.state.skipped.has(step);
    }

    isStepComplete(step) {
        return this.state.completed.has(step);
    }

    completedSteps() {
        return this.state.completed.size;
    }

    allStepsCompleted() {
        return this.completedSteps() === this.totalSteps() - this.skippedSteps();
    }

    isLastStep() {
        return this.state.activeStep === this.totalAllSteps() - 1;
    }

    renderFooterButtons() {
        const {classes} = this.props;
        const {activeStep} = this.state;
        return (<>
            <Grid item container xs={6} className={classes.buttons}>
                <Button
                    disabled={activeStep === 0}
                    onClick={this.handleBack}
                    className={classes.button2}
                    variant="outlined"
                >
                    <KeyboardArrowLeft className={classes.arrows}/>
                    <Typography className={classes.textVolver}>Atrás</Typography>
                </Button>
            </Grid>
            <Grid item container xs={6} className={classes.buttons}>
                {this.totalAllSteps() - 1 === this.state.activeStep ? (
                    <Button
                        variant="outlined"
                        onClick={this.handleInit}
                        className={classes.button4}
                    >
                        <Typography className={classes.textContinuar}>Volver al inicio</Typography>
                    </Button>
                ) : (
                    <Button
                        variant="outlined"
                        onClick={this.handleNext}
                        className={classes.button3}
                    >
                        <KeyboardArrowRight className={classes.arrows}/>
                        <Typography className={classes.textContinuar}>Siguiente</Typography>
                    </Button>
                )}
            </Grid>
        </>
        );
    }

    render() {
        if (this.state.form === undefined) return null;
        const {classes} = this.props;
        const steps = this.lastSteps();
        const {activeStep} = this.state;
        const totalSteps = this.totalAllSteps();

        let filterCases = this.state.cases.filter(e => e.form_instance === this.props.match.params.id);

        return (
            <div className={classes.root}>
                <Container className={classes.instructions}>
                    <Stepper alternativeLabel nonLinear activeStep={activeStep}>
                        {steps.map((label, index) => {
                            const props = {};
                            const buttonProps = {};
                            if (this.isStepSkipped(index)) {
                                props.completed = false;
                            }
                            return (
                                <Step key={label} {...props}>
                                    <StepButton
                                        onClick={this.handleStep(index)}
                                        completed={this.isStepComplete(index)}
                                        {...buttonProps}
                                    >
                                        <div className={classes.stepLabel}>{label}</div>
                                    </StepButton>
                                </Step>
                            );
                        })}
                    </Stepper>

                    <Typography className={classes.stepTitle} variant="h6">{steps[activeStep]}</Typography>

                    <div className={classes.instructions}>
                        {this.state.activeStep === totalSteps - 2 &&
                            <FormInstanceAnnexes
                                form={this.state.form}
                                registry={true}
                                newFiles={{}}                                />
                        }
                        {this.state.activeStep === totalSteps - 1 &&
                            <FormRegistryObservations
                                id={this.props.match.params.id}
                                schema={this.state.form.version_schema}
                                answers={this.state.answers}
                                comments={this.state.form.comments}
                                casesList={filterCases}
                                fetchCases={this.fetchCases}
                                fetchInstance={this.fetchInstance}
                                onCommentCreate={this.onCommentCreate}
                                form={this.state.form}
                                newFiles={{}}/>
                        }
                        {this.state.activeStep !== totalSteps - 1 && this.state.activeStep !== totalSteps - 2 &&
                            <FormRegistryStep stepTitle={steps[activeStep]} sections={this.getSections()}
                                answers={this.state.answers}/>
                        }
                    </div>
                </Container>
                <div className={classes.footer}>
                    <Container className={classes.container}>
                        <Grid container>
                            {this.renderFooterButtons()}
                        </Grid>
                    </Container>
                </div>
            </div>
        );
    }
}

FormRegistryDetail.propTypes = {
    classes: PropTypes.object
};

export default withStyles(styles)(FormRegistryDetail);

import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import MaterialStepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Typography from '@material-ui/core/Typography';

import BaseVoucher from '@miners/containers/etl/BaseVoucher';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import * as etlService from '@app/services/backend/etl';

const styles = (theme) => ({
    loadingContainer: {
        textAlign: 'center',
    },
    loading: {
        color: 'white',
        marginTop: '1rem',
    },
    stepBody: {
        marginTop: '1rem',
    },
    stepper: {
        backgroundColor: '#161719',
    },
});

const steps = ['Subir archivo de datos', 'Validar datos antes de la carga', 'Comprobante'];

const pristineState = {
    activeStep: 0,
    executorObject: null,
    operationObject: null,
    loadExecutorError: false,
    loadOperationError: false,
};

/**
 * The main wrapper for every ETL process. This component should be
 * rendered with:
 * - target: the target's canonical name
 * - executor: the executor key
 * - executors: the list of executors to match agains, each containing:
 * - executors[].executor: the key of each executor in the catalog
 * - executors[].loader: the component that handles the load phase,
 *   which will get the *target* and *executor* properties
 * - executors[].validator: the component that handles the validation
 *   phase, which will get the *operation* object in addition to
 *   target and executor, as well as an *updateOperation* callback.
 * - executors[].voucher: the component that handles the voucher phase,
 *   which gets the same properties as executors.validator (except
 *   updateOperation)
 * - operation (optional): the id of the operation to inspect
 *
 * The users should not attempt to control the form steps, and give
 * only valid executor and operation props. The stepper will deal with
 * changing the form step.
 */
class Stepper extends SubscribedComponent {
    state = {
        ...pristineState,
    };

    componentDidMount() {
        this.loadExecutor();
        if (this.props.operation) {
            this.setState({...pristineState, activeStep: 2});
            this.loadOperation();
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.executor !== this.props.executor) {
            this.setState({...pristineState});
            this.componentDidMount();
        } else if (prevProps.operation !== this.props.operation) {
            if (typeof this.props.operation !== 'undefined') {
                this.setState((state) => ({
                    ...pristineState,
                    activeStep: 2,
                    executorObject: state.executorObject,
                    loadExecutorError: state.loadExecutorError,
                }));
                this.loadOperation();
            } else {
                this.setState((state) => ({
                    ...pristineState,
                    executorObject: state.executorObject,
                    loadExecutorError: state.loadExecutorError,
                }));
            }
        }
    }

    updateExecutor(executorObject) {
        this.setState((state) => ({
            ...pristineState,
            activeStep: state.activeStep,
            executorObject,
            operationObject: state.operationObject,
            loadExecutorError: executorObject === null,
            loadOperationError: state.loadOperationError,
        }));
    }

    updateOperation(operationObject) {
        this.setState((state) => ({
            ...pristineState,
            activeStep: operationObject && operationObject.state === 'success' ? 2 : 1,
            executorObject: state.executorObject,
            operationObject,
            loadExecutorError: state.loadExecutorError,
            loadOperationError: operationObject === null,
        }));
    }

    loadExecutor() {
        this.subscribe(
            etlService.readExecutor({
                target: this.props.target,
                executor: this.props.executor,
                cache: 1000 * 60 * 10, // cache for a lot of time (10 minutes), since the resource is mostly static
            }),
            this.updateExecutor.bind(this),
            (err) => this.setState({loadExecutorError: true})
        );
    }

    loadOperation() {
        this.subscribe(
            etlService.read({
                target: this.props.target,
                operation: this.props.operation,
            }),
            this.updateOperation.bind(this),
            (err) => this.setState({loadOperationError: true})
        );
    }

    renderLoading() {
        const {classes} = this.props;
        return (
            <div className={classes.loadingContainer}>
                <CircularProgress className={classes.loading} />
            </div>
        );
    }

    renderStep(spec) {
        const {target, executor, classes} = this.props;
        if (this.state.activeStep === 0) {
            if (this.state.executorObject === null) {
                return this.renderLoading();
            }
            return (
                <div className={classes.stepBody}>
                    {React.createElement(spec.loader, {
                        target,
                        executor: this.state.executorObject,
                        spec,
                    })}
                </div>
            );
        }
        if (this.state.operationObject === null) {
            return this.renderLoading();
        }
        if (this.state.activeStep === 1) {
            return (
                <div className={classes.stepBody}>
                    {React.createElement(spec.validator, {
                        target,
                        executor,
                        operation: this.state.operationObject,
                        updateOperation: this.updateOperation.bind(this),
                        spec,
                    })}
                </div>
            );
        }
        if (this.state.activeStep === 2) {
            return (
                <div className={classes.stepBody}>
                    {React.createElement(spec.voucher, {
                        target,
                        executor,
                        operation: this.state.operationObject,
                        spec,
                    })}
                </div>
            );
        }
        return null;
    }

    render() {
        if (this.state.loadExecutorError) {
            return (
                <>
                    <Typography variant="h6" color="error">
                        No se pudo cargar el servicio de carga de datos.
                    </Typography>
                    <Typography>
                        Compruebe el estado de su conexión e inténtelo nuevamente más tarde. De persistir el
                        problema, contáctese con el equipo técnico a cargo del sistema.
                    </Typography>
                </>
            );
        }
        if (this.state.loadOperationError) {
            return (
                <>
                    <Typography variant="h6" color="error">
                        No se pudo cargar la operación.
                    </Typography>
                    <Typography>
                        Compruebe el estado de su conexión e inténtelo nuevamente más tarde.
                    </Typography>
                </>
            );
        }
        const {executors, executor, operation} = this.props;
        const spec = executors.find((s) =>
            this.state.operationObject
                ? this.state.operationObject.executor === s.executor
                : executor === s.executor
        );
        if (typeof spec === 'undefined') {
            if (!operation) {
                return (
                    <>
                        <Typography variant="h6">
                            No se pueden cargar datos con la planilla especificada
                        </Typography>
                        <Typography color="error">
                            <code>{executor}</code>
                        </Typography>
                        <Typography>
                            Use una planilla soportada por la plataforma seleccionando desde el menú.
                        </Typography>
                    </>
                );
            } else {
                return this.state.operationObject === null ? (
                    this.renderLoading()
                ) : (
                    <BaseVoucher operation={this.state.operationObject} />
                );
            }
        }
        return (
            <>
                <MaterialStepper
                    activeStep={this.state.activeStep}
                    alternativeLabel
                    className={this.props.classes.stepper}
                >
                    {steps.map((label, index) => (
                        <Step key={`step-${index}`} completed={this.state.activeStep > index}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </MaterialStepper>
                {this.renderStep(spec)}
            </>
        );
    }
}

export default withStyles(styles)(Stepper);

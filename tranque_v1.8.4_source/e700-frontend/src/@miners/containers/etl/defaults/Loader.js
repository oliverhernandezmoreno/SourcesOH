import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import {
    Avatar,
    Button,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    Grid,
    IconButton,
    Link,
    Typography,
} from '@material-ui/core';
import Clear from '@material-ui/icons/Clear';
import Error from '@material-ui/icons/Error';
import Warning from '@material-ui/icons/Warning';
import Refresh from '@material-ui/icons/Refresh';
import UnarchiveOutlinedIcon from '@material-ui/icons/UnarchiveOutlined';

import {history} from '@app/history';
import {reverse} from '@app/urls';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import DownloadDataFileButton from '@miners/containers/etl/DownloadDataFileButton';
import GroupDatasetHelper from '@miners/containers/etl/defaults/dataset-helpers/GroupDatasetHelper';
import SourceDatasetHelper from '@miners/containers/etl/defaults/dataset-helpers/SourceDatasetHelper';
import ParameterDatasetHelper from '@miners/containers/etl/defaults/dataset-helpers/ParameterDatasetHelper';
import * as etlService from '@app/services/backend/etl';
import {AttachFile, GetApp} from '@material-ui/icons';

const styles = (theme) => ({
    assistanceBlock: {
        marginTop: theme.spacing(10),
    },
    assistanceBlockButton: {
        marginTop: theme.spacing(2),
    },
    link: {
        'whiteSpace': 'nowrap',
        '&:hover': {
            textDecoration: 'none',
        },
    },
    icon: {
        marginRight: theme.spacing(0.6),
    },
    container: {
        marginTop: theme.spacing(2),
        display: 'flex',
        alignItems: 'flex-start',
    },
    verticalContainer: {
        marginTop: theme.spacing(2),
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'column',
    },
    processButton: {
        marginLeft: theme.spacing(4),
    },
    errorIcon: {
        paddingRight: '5px',
        color: theme.palette.error.main,
    },
    warningIcon: {
        paddingRight: '5px',
        color: theme.palette.warning.main,
    },
    loadingContainer: {
        textAlign: 'center',
        marginLeft: '50px',
    },
    loading: {
        color: 'white',
    },
});

const pristineState = {
    file: null,
    dataFile: null,
    errorLoading: false,
    errorCreating: null,
    creating: false,
};

class Loader extends SubscribedComponent {
    state = {
        ...pristineState,
        loading: false,
    };

    setFile(event) {
        if (event.target.files.length > 0) {
            this.setState({...pristineState, file: event.target.files[0]}, this.loadDataFile.bind(this));
        }
    }

    loadDataFile() {
        this.setState({loading: true});
        if (this.state.file !== null) {
            this.subscribe(
                etlService.uploadDataFile({file: this.state.file}),
                (dataFile) =>
                    this.setState({
                        ...pristineState,
                        dataFile,
                    }),
                () => this.setState({errorLoading: true, loading: false})
            );
        }
    }

    renderLoading() {
        const {classes} = this.props;
        return (
            <div className={classes.loadingContainer}>
                <CircularProgress className={classes.loading} />
            </div>
        );
    }

    clearFile() {
        this.setState({...pristineState});
    }

    createOperation(event) {
        const {target, executor, spec} = this.props;
        this.setState({creating: true, loading: true});
        event.preventDefault();
        this.subscribe(
            etlService.create({
                target,
                executor: executor.name,
                dataFileId: this.state.dataFile.id,
                context: spec.context,
            }),
            ({id: operation}) =>
                history.push(
                    reverse(spec.loaderRoute, {
                        target,
                        executor: executor.name,
                        operation,
                    })
                ),
            () =>
                this.setState({
                    creating: false,
                    errorCreating: 'No se pudo precargar el archivo. Inténtelo nuevamente más tarde',
                })
        );
    }

    needsDatasets = () => {
        const requiredDatasets = this.props.executor.required_datasets;
        return (
            typeof requiredDatasets?.counts?.group !== 'undefined' ||
            typeof requiredDatasets?.counts?.source !== 'undefined' ||
            typeof requiredDatasets?.counts?.parameter !== 'undefined'
        );
    };

    renderExecutableWarning() {
        const {classes} = this.props;
        const executable = this.props.executor.required_datasets?.executable ?? false;
        if (executable) {
            if (!this.needsDatasets()) {
                return null;
            }
            return (
                <div className={classes.container}>
                    <Typography>
                        Según los datos a ingresar, para llenar esta planilla necesitarás ingresar el NOMBRE
                        EXACTO de:
                    </Typography>
                </div>
            );
        }
        return (
            <div className={classes.container}>
                <Grid container direction="row" alignItems="center">
                    <Grid item>
                        <Warning className={classes.warningIcon} />
                    </Grid>
                    <Grid item>
                        <Typography color="warning">
                            No es posible realizar esta carga de datos por falta de configuración.
                        </Typography>
                    </Grid>
                </Grid>
            </div>
        );
    }

    renderGroupDatasetAnchor(groupCount) {
        if (groupCount === 0) {
            return (
                <Typography color="warning">
                    No hay agrupaciones suficientes para esta carga de datos.
                </Typography>
            );
        }
        return <GroupDatasetHelper target={this.props.target} executor={this.props.executor} />;
    }

    renderGroupSourceDatasetAnchor(sourceCount) {
        if (sourceCount === 0) {
            return (
                <Typography color="warning">
                    No hay puntos de monitoreo o instrumentos suficientes para esta carga de datos.
                </Typography>
            );
        }
        return <SourceDatasetHelper target={this.props.target} executor={this.props.executor} />;
    }

    renderParameterDatasetAnchor(parameterCount) {
        if (parameterCount === 0) {
            return (
                <Typography color="warning">
                    No hay parámetros configurados para esta carga de datos.
                </Typography>
            );
        }
        return <ParameterDatasetHelper target={this.props.target} executor={this.props.executor} />;
    }

    renderDatasetsAnchor() {
        const {classes} = this.props;
        const requiredDatasets = this.props.executor.required_datasets;
        if (!this.needsDatasets()) {
            return null;
        }
        const components = [
            typeof requiredDatasets?.counts?.group !== 'undefined' &&
            typeof requiredDatasets?.counts?.source === 'undefined'
                ? this.renderGroupDatasetAnchor(requiredDatasets?.counts?.group)
                : null,
            typeof requiredDatasets?.counts?.source !== 'undefined'
                ? this.renderGroupSourceDatasetAnchor(requiredDatasets?.counts?.source)
                : null,
            typeof requiredDatasets?.counts?.parameter !== 'undefined'
                ? this.renderParameterDatasetAnchor(requiredDatasets?.counts?.parameter)
                : null,
        ]
            .filter((c) => c !== null)
            .map((c, index) => React.cloneElement(c, {key: `helper-${index}`}));
        return <div className={classes.verticalContainer}>{components}</div>;
    }

    render() {
        const {classes} = this.props;
        return (
            <Card>
                <CardHeader
                    avatar={
                        <Avatar>
                            <UnarchiveOutlinedIcon />
                        </Avatar>
                    }
                    title={this.props.spec.header}
                    titleTypographyProps={{variant: 'h6'}}
                    subheader={this.props.spec.subheader}
                />
                <CardContent>
                    <form onSubmit={this.createOperation.bind(this)}>
                        <Typography align="left">Escoge el archivo desde tu computador:</Typography>
                        <div className={classes.container}>
                            <div>
                                {!this.state.dataFile && (
                                    <>
                                        <input
                                            accept=".xls,.xlsx"
                                            onChange={this.setFile.bind(this)}
                                            style={{display: 'none'}}
                                            id="contained-button-file"
                                            type="file"
                                        />
                                        <label htmlFor="contained-button-file">
                                            <Button variant="contained" component="span" size="large">
                                                <AttachFile className={classes.icon} />
                                                Elegir archivo
                                            </Button>
                                        </label>
                                    </>
                                )}
                                {this.state.file && !this.state.errorLoading && (
                                    <Typography>Cargando archivo ...</Typography>
                                )}
                                {this.state.file && this.state.errorLoading && (
                                    <Grid container direction="row" alignItems="center">
                                        <Grid item>
                                            <Typography color="error">
                                                No se pudo cargar el archivo
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <IconButton
                                                onClick={this.loadDataFile.bind(this)}
                                                title="Reintentar"
                                            >
                                                <Refresh />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                )}
                                {this.state.dataFile && (
                                    <>
                                        <DownloadDataFileButton dataFile={this.state.dataFile} />
                                        <IconButton onClick={this.clearFile.bind(this)}>
                                            <Clear />
                                        </IconButton>
                                    </>
                                )}
                            </div>
                            <div className={classes.processButton}>
                                <Button
                                    type="submit"
                                    size="large"
                                    variant="contained"
                                    color="primary"
                                    disabled={!this.state.dataFile || this.state.creating}
                                >
                                    Precargar datos
                                </Button>
                                {this.state.errorCreating && (
                                    <Grid container direction="row" alignItems="center">
                                        <Grid item>
                                            <Error className={classes.errorIcon} />
                                        </Grid>
                                        <Grid item>
                                            <Typography color="error">{this.state.errorCreating}</Typography>
                                        </Grid>
                                    </Grid>
                                )}
                            </div>
                            {this.state.creating && this.state.loading && this.renderLoading()}
                        </div>
                        <div className={classes.assistanceBlock}>
                            <Typography>{this.props.spec.description}</Typography>
                            {this.props.executor.sample_files.length > 0 && (
                                <Typography>
                                    Las instrucciones de llenado se encuentran en el mismo archivo.
                                </Typography>
                            )}
                            {this.props.executor.sample_files.map((link, index) => (
                                <div key={index} className={classes.assistanceBlockButton}>
                                    <Link href={link} className={classes.link}>
                                        <Button size="large" variant="outlined">
                                            <GetApp className={classes.icon} />
                                            Descargar planilla
                                            {this.props.executor.sample_files.length > 1
                                                ? `#${index + 1}`
                                                : ''}
                                        </Button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </form>
                    {this.renderExecutableWarning()}
                    {this.renderDatasetsAnchor()}
                </CardContent>
            </Card>
        );
    }
}

export default withStyles(styles)(Loader);

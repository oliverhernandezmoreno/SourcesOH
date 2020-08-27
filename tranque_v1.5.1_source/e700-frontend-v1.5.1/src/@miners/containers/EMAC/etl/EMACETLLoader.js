import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import Clear from '@material-ui/icons/Clear';
import Error from '@material-ui/icons/Error';
import Refresh from '@material-ui/icons/Refresh';
import UnarchiveOutlinedIcon from '@material-ui/icons/UnarchiveOutlined';

import {history} from '@app/history';
import {reverse} from '@app/urls';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import DownloadDataFileButton from '@miners/containers/etl/DownloadDataFileButton';
import * as etlService from '@app/services/backend/etl';
import {AttachFile, GetApp} from '@material-ui/icons';

const styles = (theme) => ({
    assistanceBlock: {
        marginTop: theme.spacing(10)
    },
    assistanceBlockButton: {
        marginTop: theme.spacing(2)
    },
    link: {
        whiteSpace: 'nowrap',
        '&:hover': {
            textDecoration: 'none'
        }
    },
    icon: {
        marginRight: theme.spacing(0.6)
    },
    container: {
        marginTop: theme.spacing(2),
        display: 'flex',
        alignItems: 'flex-start'
    },
    processButton: {
        marginLeft: theme.spacing(4)
    },
    errorIcon: {
        paddingRight: '5px',
        color: theme.palette.error.main
    },
    loadingContainer: {
        textAlign: 'center',
        marginLeft: '50px'
    },
    loading: {
        color: 'white'
    },
});

const pristineState = {
    file: null,
    dataFile: null,
    errorLoading: false,
    errorCreating: null,
    creating: false,
};

class EMACETLLoader extends SubscribedComponent {
    state = {
        ...pristineState,
        loading: false
    };

    setFile(event) {
        if (event.target.files.length > 0) {
            this.setState(
                {...pristineState, file: event.target.files[0]},
                this.loadDataFile.bind(this)
            );
        }
    }

    loadDataFile() {
        this.setState({loading: true});
        if (this.state.file !== null) {
            this.subscribe(
                etlService.uploadDataFile({file: this.state.file}),
                (dataFile) => this.setState({
                    ...pristineState,
                    dataFile
                }),
                () => this.setState({errorLoading: true, loading: false})
            );
        }
    }

    renderLoading() {
        const {classes} = this.props;
        return (
            <div className={classes.loadingContainer}>
                <CircularProgress className={classes.loading}/>
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
                executor,
                dataFileId: this.state.dataFile.id,
                context: spec.context,
            }),
            ({id: operation}) => history.push(reverse(spec.loaderRoute, {target, executor, operation})),
            () => this.setState({
                creating: false,
                errorCreating: 'No se pudo precargar el archivo. Inténtelo nuevamente más tarde'
            })
        );
    }

    render() {
        const {classes} = this.props;
        return (
            <Card>
                <CardHeader
                    avatar={<Avatar><UnarchiveOutlinedIcon /></Avatar>}
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
                                            type="file"/>
                                        <label htmlFor="contained-button-file">
                                            <Button variant="contained" component="span" size="large">
                                                <AttachFile className={classes.icon}/>
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
                                            <Typography color="error">No se pudo cargar el archivo</Typography>
                                        </Grid>
                                        <Grid item>
                                            <IconButton
                                                onClick={this.loadDataFile.bind(this)}
                                                title="Reintentar">
                                                <Refresh/>
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                )}
                                {this.state.dataFile && (
                                    <>
                                        <DownloadDataFileButton dataFile={this.state.dataFile}/>
                                        <IconButton onClick={this.clearFile.bind(this)}>
                                            <Clear/>
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
                                    disabled={!this.state.dataFile || this.state.creating}>
                                    Precargar datos
                                </Button>
                                {this.state.errorCreating && (
                                    <Grid container direction="row" alignItems="center">
                                        <Grid item>
                                            <Error className={classes.errorIcon}/>
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
                            <Typography>
                                {this.props.spec.description}
                            </Typography>
                            <Typography>
                                Las instrucciones de llenado se encuentran en el mismo archivo.
                            </Typography>
                            <div className={classes.assistanceBlockButton}>
                                <Link href={this.props.sample} className={classes.link}>
                                    <Button size="large" variant="outlined">
                                        <GetApp className={classes.icon}/>
                                        Descargar plantilla
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        );
    }
}

export default withStyles(styles)(EMACETLLoader);

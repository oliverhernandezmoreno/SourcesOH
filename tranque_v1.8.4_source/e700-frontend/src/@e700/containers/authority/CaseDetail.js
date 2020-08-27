import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import {Grid, Typography, Chip, Button, TextField} from '@material-ui/core';
import CaseComments from '@e700/components/registry/CaseComments';
import {reverse} from '@app/urls';
import {Link} from 'react-router-dom';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import * as FormService from '@app/services/backend/form';
import {UploadFileButton} from '@app/components/utils/UploadFileButton';
import {Cloud, CloudDone, CloudUpload, Done, Error} from '@material-ui/icons';
import {IconTextGrid} from '@app/components/utils/IconTextGrid';
import TSelect from '@app/components/utils/TSelect';
import DataTable from '@app/components/utils/DataTable';
import theme from '@e700/theme';

import {snackbarActions} from '@app/actions/snackbar.actionCreators';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';


const styles = theme => ({
    root: {
        padding: '1em',
        maxWidth: '1000px'
    },
    container: {
        display: 'flex',
        justifyContent: 'center',
        paddingBottom: '3em'
    },
    text_form: {
        color: '#ffffff',
        fontFamily: 'Roboto',
        fontSize: '24px',
        fontWeight: '300',
        lineHeight: '29px',
        textAlign: 'left'
    },
    subtitle: {
        color: '#ffffff',
        fontWeight: '700',
        letterSpacing: '0.25px',
        lineHeight: '20px',
        textAlign: 'left',
        paddingBottom: '1.5em',
        paddingTop: '1em'
    },
    description: {
        fontFamily: 'Roboto',
        fontWeight: '400',
        letterSpacing: '0.4px',
        lineHeight: '16px',
        textAlign: 'left',
        whiteSpace: 'pre-line'
    },
    chip: {
        marginRight: theme.spacing(1),
        marginBottom: theme.spacing(1),
        maxWidth: '100%'
    },
    formControl: {
        width: '100px',
        marginRight: '30px',
    },
    select: {
        width: '100%',
        marginTop: 7
    },
    selectLabel: {
        fontWeight: '700',
        display: 'inline-block',
        paddingRight: '30px',
        paddingTop: 14
    },
    button: {
        backgroundColor: theme.palette.secondary.main,
        width: '220px',
        height: '28px',
        marginTop: 10
    },
    updateStateButtonWrapper: {
        display: 'inline-block',
    },
    text_button: {
        color: '#FFFFFF',
        backgroundColor: theme.palette.secondary.main,
        fontSize: '14px',
        fontWeight: '500',
        letterSpacing: '1.25px',
        lineHeight: '16px',
        textAlign: 'center',
        minWidth: '200px'
    },
    alignRight: {
        [theme.breakpoints.up('xs')]: {
            textAlign: 'left'
        },
        textAlign: 'right'
    },
    backButton: {
        fontWeight: '700'
    },
    topRow: {
        paddingBottom: '1em'
    },
    dateLabel: {
        display: 'inline-block',
        paddingRight: '0.5em',
        paddingBottom: '0'
    },
    dateValue: {
        display: 'inline-block'
    },
    fileName: {
        overflow: "hidden",
        textOverflow: "ellipsis"
    },
    uploadMessage: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        marginLeft: -theme.spacing(2),
        padding: theme.spacing(2),
        borderRadius: '5px'
    },
    requestText: {
        width: '100%',
    },
    textBtnRequest: {
        color: '#FFFFFF',
        fontSize: '14px',
        fontWeight: '500',
        letterSpacing: '0.58px',
        lineHeight: '17px',
        textAlign: 'center'
    },
    buttonRequest: {
        backgroundColor: theme.palette.primary.main,
        borderRadius: '4px',
        width: '230px',
        height: '45px',
        float: 'right'
    },
});

const caseStates = [{label: 'Abierto', value: 'open'}, {label: 'Cerrado', value: 'closed'}];

class CaseDetail extends SubscribedComponent {

    state = {
        state: 'open',
        newFiles: [],
        comments: [],
        commentFiles: [],
        caseFiles: [],
        reasonToReassign: '',
    };


    componentDidMount() {
        this.getCase();
        this.fetchComments();
    }

    getCase() {
        this.subscribe(
            FormService.readCase({id: this.props.match.params.id}),
            caseData => this.setState({...caseData}, () => this.getCommentFiles())
        );
    }

    setFormRequest = event => {
        this.setState({
            reasonToReassign: event.target.value
        });
    };

    getCommentFiles() {
        const {documents} = this.state;
        let commentFiles = [];
        let caseFiles = [];
        documents.forEach(doc => {
            if (doc.meta.comment) commentFiles.push(doc);
            else caseFiles.push(doc);
        });
        this.setState({ commentFiles: commentFiles, caseFiles: caseFiles });
    }

    /**
     * Fetch Data and return one Promise then give them to state comments.
     *
     * @public
     */
    fetchComments = () => {
        this.subscribe(FormService.ReadCaseComments({ id: this.props.match.params.id }),
            obj => {this.setState({comments: obj.data.results})}
        );
    };


    /**Expected an assignment or function call and instead saw an expression  no-unused-expressions
    * Sends the current commment.
    *
    * @public
    */
    sendComment = (comment, files) => {
        this.subscribe(
            FormService.commentCase(
                {
                    comment: comment,
                    id: this.props.match.params.id
                }),
            obj => {
                if (files.length > 0) {
                    files.forEach(file =>
                        this.subscribe(
                            FormService.uploadCaseFile({
                                file,
                                caseId: this.props.match.params.id,
                                meta: {comment: {value: obj.data.id}}
                            }),
                            doc => {
                                this.getCase();
                                this.fetchComments();
                            },
                            error => {
                                this.props.actions.openSnackbar('No se han podido subir los archivos.', 'error', null, null);
                            }
                        )
                    );
                }
                else {
                    this.getCase();
                    this.fetchComments();
                }
            }
        );
    };

    handleChange = event => {
        this.setState({ state: event.target.value });
    };

    updateState = event => {
        this.subscribe(FormService.updateCase(
            {
                id: this.props.match.params.id,
                state: this.state.state
            }),
        obj => {
            this.props.actions.openSnackbar('Se ha actualizado el estado.', 'success', null, null);
            const stateLabel = caseStates.find(item => item.value === this.state.state).label;
            this.subscribe(FormService.commentCase(
                {
                    comment: 'Se ha cambiado el estado a "' + stateLabel + '"',
                    id: this.props.match.params.id,
                }),
            obj => this.fetchComments()
            );
        }
        );
    };

    downloadFile(doc) {
        return () => {
            FormService.downloadCaseFile({
                caseId: this.props.match.params.id,
                id: doc.id,
                filename: doc.name
            }).subscribe();
        };
    }

    renderNewFileChip = ({file, status, doc}, index) => {
        let icon;
        switch (status) {
            case 'done':
                icon = <CloudDone style={{color: 'green'}}/>;
                break;
            case 'error':
                icon = <Error style={{color: 'red'}}/>;
                break;
            case 'uploading':
                icon = <CloudUpload/>;
                break;
            default:
                icon = <Cloud/>;
        }
        return <Chip className={this.props.classes.chip}
            icon={icon}
            key={index}
            label={<div className={this.props.classes.fileName}>{file.name}</div>}
            onClick={doc ? this.downloadFile(doc) : undefined}
        />;
    };

    renderUploadingFiles(newFiles) {
        if (newFiles.length > 0) {
            let msg;
            const errors = newFiles.filter(f => f.status === 'error');
            const allDone = newFiles.every(f => f.status === 'done' || f.status === 'error');
            const uploading = newFiles.filter(f => f.status === 'uploading');
            if (allDone > 0 && errors.length === 0) {
                msg = (<IconTextGrid icon={<Done/>}
                    text={<Typography>Archivos guardados exitosamente</Typography>}
                />);
            } else if (uploading.length === 0 && errors.length > 0) {
                msg = (<IconTextGrid icon={<Error/>}
                    text={<Typography>Hubo un error cargando archivo(s):</Typography>}
                />);
            } else {
                msg = (<Typography>
                          Cargando archivo(s)… no salgas de la página hasta que se complete la carga
                </Typography>);
            }
            return (<>
                {newFiles.map(this.renderNewFileChip)}
                <div className={this.props.classes.uploadMessage}>
                    {msg}
                    {errors.map(({file, reason}, index) => (
                        <Typography variant="caption" key={index}>"{file.name}": {reason}</Typography>
                    ))}
                </div>
            </>);
        } else {
            return null;
        }
    }



    onFileSelection = (files) => {
        // newFiles is an array of {file, status, reason}
        if (files.length > 0) {
            // add newFiles to state
            this.setState(state => {
                const newFiles = state.newFiles;
                return {
                    newFiles: [
                        ...newFiles,
                        ...files.map(f => ({file: f, status: 'uploading'}))
                    ]
                };
            });
            files.forEach(file => {
                // for each file start uploading immediately, and after response update status accordingly
                this.subscribe(
                    FormService.uploadCaseFile({
                        file,
                        caseId: this.state.id
                    }),
                    doc => {
                        this.setState(state => {
                            return {
                                newFiles: state.newFiles.map(f =>
                                    f.file === file ? {
                                        file: f.file,
                                        status: 'done',
                                        doc: doc
                                    } : f)
                            };
                        });
                    },
                    error => {
                        let msg = 'Error al intentar cargar el archivo';
                        if (error.status === 413) {
                            msg = 'El archivo excede el tamaño soportado';
                        } else if (error.status === 400 && error.data[0] === 'File already exists') {
                            msg = 'El archivo ya existe';
                        }
                        this.setState(state => {
                            return {
                                newFiles: state.newFiles.map(f =>
                                    f.file === file ? {
                                        file: f.file,
                                        status: 'error',
                                        reason: msg
                                    } : f)
                            };
                        });
                    }
                );
            });
        }
    };

    reassignForm() {
        return () => {
            this.subscribe(
                FormService.reassignForm(
                    {
                        reason: this.state.reasonToReassign,
                        id: this.props.match.params.id
                    }),
                response => {
                    this.props.actions.openSnackbar('Se ha enviado el formulario a la compañía minera para que revise los datos.', 'success', null, null);
                    this.subscribe(FormService.commentCase(
                        {
                            comment: 'El formulario fue enviado nuevamente a la compañía minera para su revisión.',
                            id: this.props.match.params.id,
                        }),
                    obj => {
                        this.getCase();
                        this.fetchComments()
                    }
                    );
                },
                (err) => this.props.actions.openSnackbar('No es posible enviar el formulario a la compañía minera para su revisión.', 'error', null, null)
            )
        };
    }

    render() {
        const {classes} = this.props;
        const {work_sites, target_name, created_at, title, state, description,
            caseFiles, newFiles, commentFiles, reasonToReassign} = this.state;
        const period = `${this.state.year} - Trimestre ${this.state.trimester}`;
        const entity = work_sites ? work_sites[0].entity.name : '';
        const faena = work_sites ? work_sites[0].name : '';
        const formattedDate = created_at ? created_at.split('T', 1)[0] : '';
        const reason = this.state.reassign_reason;
        const isReasonDisabled = reason && reason.length > 0 ? true : false;
        return (
            <div className={classes.container}>
                <Grid container spacing={1} className={classes.root}>
                    <Grid item xs={12} sm={8} className={classes.topRow}>
                        <Typography className={classes.text_form}>
                            {title}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4} className={[classes.alignRight, classes.topRow].join(' ')}>
                        <Button
                            variant="outlined"
                            className={classes.backButton}
                            component={Link} to={reverse('e700.registry.generated-cases')}>
                            &lt; Ir a lista de casos
                        </Button>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Typography className={[classes.subtitle, classes.dateLabel].join(' ')}>
                            Fecha de apertura:
                        </Typography>
                        <Typography className={classes.dateValue}>
                            {formattedDate}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} className={classes.alignRight}>
                        <Typography className={classes.selectLabel}>Estado</Typography>

                        <TSelect selectStyle={classes.select} formControlStyle={classes.formControl}
                            defaultValue={'open'}
                            hideDefault
                            menuItems={caseStates}
                            onChange={(event) => this.handleChange(event)}
                            selected={state}/>

                        <div className={classes.updateStateButtonWrapper}>
                            <Button
                                variant="contained"
                                size="medium"
                                onClick={this.updateState}
                                className={this.props.classes.button}
                            >
                                <Typography className={this.props.classes.text_button}>
                                    Actualizar estado
                                </Typography>
                            </Button>
                        </div>
                    </Grid>
                    <Grid item xs={12}/>
                    <Grid item xs={6}>
                        <Typography className={classes.subtitle}>Descripción</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography className={classes.description}>
                            {description}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography className={classes.subtitle}>Periodo Formulario Asociado</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography className={classes.description}>
                            {period}
                        </Typography>
                    </Grid>

                    <Grid item xs={12}>
                        <DataTable title='Datos Empresa'
                            items={[
                                {label: 'Fecha creación', data: formattedDate},
                                {label: 'Empresa', data: entity},
                                {label: 'Faena', data: faena},
                                {label: 'Depósito', data: target_name}
                            ]}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                            <Typography className={classes.subtitle}>Documentos</Typography>
                            <UploadFileButton
                                multiple
                                onFileSelection={this.onFileSelection}
                                label={<Typography variant='subtitle2' align='right'
                                    style={{fontWeight: 'bold', color: theme.palette.secondary.main}}>
                                  + Adjuntar documento</Typography>}
                                buttonProps={{variant: 'text'}}/>
                        </div>
                    </Grid>
                    <Grid item xs={12}>
                        {caseFiles.map((doc, index) => {
                            return (
                                <Chip
                                    className={classes.chip}
                                    key={index}
                                    label={<div className={classes.fileName}>{doc.name}</div>}
                                    onClick={this.downloadFile(doc)}
                                />
                            );
                        })}
                        {this.renderUploadingFiles(newFiles)}
                    </Grid>
                    <Grid item xs={12}>
                        <hr/>
                    </Grid>
                    <Grid item xs={12}>
                        <div>
                            <Typography className={classes.subtitle}>Solicitar corrección de formulario a mineras</Typography>
                            <TextField
                                disabled={isReasonDisabled}
                                label="Escribe la justificación de la solicitud AQUÍ"
                                value={isReasonDisabled ? reason : reasonToReassign}
                                onChange={this.setFormRequest}
                                className={classes.requestText}
                                margin="normal"
                                fullWidth
                                required
                            />
                            <Button
                                className={classes.buttonRequest}
                                onClick={this.reassignForm()}
                                disabled={isReasonDisabled}
                            >
                                <Typography className={classes.textBtnRequest}>Solicitar corrección de formulario</Typography>
                            </Button>
                        </div>
                    </Grid>
                    <Grid item xs={12}>

                        <CaseComments comments={this.state.comments}
                            onSend={this.sendComment}
                            files={commentFiles}
                            onDownload={(doc) => this.downloadFile(doc)}
                        />

                    </Grid>
                </Grid>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return { actions: bindActionCreators(snackbarActions, dispatch) };
}


export default connect(null, mapDispatchToProps)(withStyles(styles)(CaseDetail));

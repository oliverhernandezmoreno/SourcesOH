import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import {Chip, Grid, Typography} from '@material-ui/core';
import {isDisabled} from '@e700/e700';
import {UploadFileButton} from '@app/components/utils/UploadFileButton';
import {Cloud, CloudDone, CloudUpload, Done, Error, KeyboardArrowRight} from '@material-ui/icons';
import {IconTextGrid} from '@app/components/utils/IconTextGrid';
import * as FormService from '@app/services/backend/form';
import * as config from '@app/config';
import {canEditForm} from '@e700/constants/userActions';

const styles = theme => ({
    row: {
        display: 'flex',
        alignItems: 'center'
    },
    padding: {
        padding: theme.spacing(2)
    },
    annexes: {
        padding: theme.spacing(2),
        paddingTop: theme.spacing(0)
    },
    text: {
        flexGrow: 1,
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(2)
    },
    uploadButton: {
        whiteSpace: 'nowrap'
    },
    uploadMessage: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        marginLeft: -theme.spacing(2),
        padding: theme.spacing(2),
        backgroundColor: '#2C2C2C',
        color: 'white',
        borderRadius: '5px',
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.5)'
    },
    chip: {
        marginRight: theme.spacing(1),
        marginBottom: theme.spacing(1),
        maxWidth: '100%'
    },
    fileName: {
        overflow: "hidden",
        textOverflow: "ellipsis"
    },
    file: {
        textAlign: 'right',
        color: 'gray',
        fontSize: '12px',
        fontFamily: 'Roboto, Helvetica, Arial, sans-serif'
    }
});

export const FormInstanceAnnexes = withStyles(styles)(class extends Component {
    state = {
        annexesFiles: {}
    };

    static getDerivedStateFromProps(props, state) {
        if (props.form === undefined || props.form === null || props.form.documents === state.documents) {
            return null;
        }
        const annexesFiles = {};
        props.form.documents.forEach(doc => {
            if (doc.meta && doc.meta.annex && doc.meta.annex.value) {
                if (annexesFiles[doc.meta.annex.value] === undefined) {
                    annexesFiles[doc.meta.annex.value] = [];
                }
                annexesFiles[doc.meta.annex.value].push(doc);
            }
        });
        return {annexesFiles, documents: props.form.documents};
    }

    downloadFile(doc) {
        return () => {
            FormService.downloadInstanceFile({
                form_codename: this.props.form.version,
                form_id: this.props.form.id,
                id: doc.id,
                filename: doc.name
            }).subscribe();
        };
    }

    deleteFile(doc) {
        return () => {
            this.props.deleteFile(doc);
        };
    }

    uploadFiles(annexIndex) {
        return (newFiles) => {
            this.props.uploadFiles({annex: annexIndex, files: newFiles});
        };
    }

    renderUploadButton(annexIndex) {
        const {user} = this.props;
        if (this.props.registry) {
            return null;
        }
        return (
            <UploadFileButton
                disabled={isDisabled(this.props.form.state, canEditForm(user))}
                key={annexIndex}
                label={'Subir Archivo'}
                className={this.props.classes.uploadButton}
                onFileSelection={this.uploadFiles('anexo' + annexIndex)}
            />
        );
    }

    renderNewFileChip = ({file, status, doc}, index) => {
        const {form, classes} = this.props;
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
        return <Chip
            className={classes.chip}
            icon={icon}
            key={index}
            label={<div className={classes.fileName}>{file.name}</div>}
            onClick={doc ? this.downloadFile(doc) : undefined}
            onDelete={isDisabled(form.state) || !doc ? undefined : this.deleteFile(doc)}/>;
    };

    renderUploadingFiles(newFiles) {
        if (newFiles.length > 0) {
            let msg;
            const errors = newFiles.filter(f => f.status === 'error');
            const allDone = newFiles.every(f => f.status === 'done' || f.status === 'error');
            const uploading = newFiles.filter(f => f.status === 'uploading');
            if (allDone > 0 && errors.length === 0) {
                msg = (
                    <IconTextGrid
                        icon={<Done/>}
                        text={<Typography>Archivos guardados exitosamente</Typography>}/>
                );
            } else if (uploading.length === 0 && errors.length > 0) {
                msg = (
                    <IconTextGrid
                        icon={<Error/>}
                        text={<Typography>Hubo un error cargando archivo(s):</Typography>}/>
                );
            } else {
                msg =
                    <Typography>Cargando archivo(s)… no salgas de la página hasta que se complete la carga</Typography>;
            }
            return (
                <>
                    {newFiles.map(this.renderNewFileChip)}
                    <div className={this.props.classes.uploadMessage}>
                        {msg}
                        {errors.map(({file, reason}, index) => (
                            <Typography variant="caption" key={index}>"{file.name}": {reason}</Typography>
                        ))}
                    </div>
                </>
            );
        } else {
            return null;
        }
    }

    renderAnnexes(annex) {
        const files = (this.state.annexesFiles[annex] || []);
        const newFiles = (this.props.newFiles[annex] || []);
        const title = files.length > 0 || newFiles.length > 0 ?
            <Typography variant="subtitle1" color="textSecondary">Archivos adjuntos</Typography> :
            this.props.registry ?
                <Typography variant="subtitle1" color="error">No se adjuntaron anexos</Typography> :
                null;
        const disabled = isDisabled(this.props.form.state);
        return (
            <div className={this.props.classes.annexes}>
                {title}
                {/*files already uploaded*/}
                {files.map((doc, index) => {
                    return (
                        <Chip
                            className={this.props.classes.chip}
                            key={index}
                            label={<div className={this.props.classes.fileName}>{doc.name}</div>}
                            onClick={this.downloadFile(doc)}
                            onDelete={disabled ? undefined : this.deleteFile(doc)}
                        />
                    );
                })}
                {/*new files*/}
                {this.renderUploadingFiles(newFiles)}
            </div>
        );
    }

    render() {
        const {classes} = this.props;
        const rowAndPadding = `${classes.row} ${classes.padding}`;
        return (
            <Grid container>
                <Grid item xs={12}>
                    <div className={rowAndPadding}>
                        <Typography className={classes.text}>
                            {this.props.registry ?
                                'Estos son los documentos anexos adjuntados por la EMPRESA MINERA.' :
                                'Por favor adjunta los documentos que otorguen información a cada ítem, detallado a continuación:'
                            }
                        </Typography>
                    </div>
                </Grid>
                <Grid item xs={12}>
                    <div className={rowAndPadding}>
                        <KeyboardArrowRight/>
                        <Typography className={classes.text}>
                            Detalles de los trabajos de mantención mensual y durante el periodo realizado en
                            el depósito.
                        </Typography>
                        {this.renderUploadButton(1)}
                    </div>
                    {this.renderAnnexes('anexo1')}
                </Grid>
                <Grid item xs={12}>
                    <div className={rowAndPadding}>
                        <KeyboardArrowRight/>
                        <Typography className={classes.text}>
                            Detalles de los trabajos de operación mensual y durante el periodo realizado en
                            el depósito.
                        </Typography>
                        {this.renderUploadButton(2)}
                    </div>
                    {this.renderAnnexes('anexo2')}
                </Grid>
                <Grid item xs={12}>
                    <div className={classes.padding}>
                        <div className={classes.row}>
                            <KeyboardArrowRight/>
                            <Typography className={this.props.classes.text}>
                                Información de controles y estadísticas sobre monitoreos especiales
                                realizados al depósito durante el periodo si se dispone de los equipos:
                            </Typography>
                            {this.renderUploadButton(3)}
                        </div>
                        <ul>
                            <li><Typography>Acelerómetros</Typography></li>
                            <li><Typography>Celdas de asentamientos</Typography></li>
                            <li><Typography>Placas de corrimiento y nivelación</Typography></li>
                            <li><Typography>Inclinómetros</Typography></li>
                            <li><Typography>Otros</Typography></li>
                        </ul>
                    </div>
                    {this.renderAnnexes('anexo3')}
                    <div className={classes.file}>
                        Cada anexo no debe superar los {config.MAX_SIZE_FILE_MB} MB
                    </div>
                </Grid>
            </Grid>
        );
    }
});

export default FormInstanceAnnexes;

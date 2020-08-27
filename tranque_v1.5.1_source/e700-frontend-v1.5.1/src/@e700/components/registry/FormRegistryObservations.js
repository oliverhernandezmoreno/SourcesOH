import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import {Typography, AppBar, Grid, Box, TextField, Button, Tabs, Tab} from '@material-ui/core';
import TMaterialTable from '@app/components/utils/TMaterialTable';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import {history} from '@app/history';
import {ISO_DATE_FORMAT} from '@app/config';
import {OmittedFields} from '@e700/components/instance/FormInstanceDispatch';
import {reverse} from '@app/urls';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import * as FormService from '@app/services/backend/form';

import {snackbarActions} from '@app/actions/snackbar.actionCreators';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as moment from 'moment';
import {getDateSortNumber} from '@app/services/sorting';
import {ConsoleHelper} from '@app/ConsoleHelper';

const styles = theme => ({
    root: {
        padding: '5px'
    },
    button: {
        backgroundColor: theme.palette.primary.main,
        width: '140px',
        height: '36px'
    },
    text_button: {
        color: '#FFFFFF',
        fontSize: '14px',
        fontWeight: '500',
        letterSpacing: '1.25px',
        lineHeight: '16px',
        width: '102px',
        textAlign: 'center'
    },
    text: {
        textAlign: 'center',
        fontSize: '16px',
        fontWeight: '400',
        letterSpacing: '0.5px',
        lineHeight: '28px'
    },
    subtext: {
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: '400',
        letterSpacing: '0.25px',
        lineHeight: '20px',
    },
    text3: {
        marginTop: '15px',
        marginBottom: '15px'
    },
    obs: {
        backgroundColor: theme.palette.secondary.main,
        height: '214px',
        display: 'grid'
    },
    obsText: {
        width: '100%'
    },
    tabsContainer: {
        paddingTop: '1.5em'
    },
    tabContainer: {
        backgroundColor: theme.palette.secondary.main,
        padding: '2em'
    },
    tabObservations: {
        backgroundColor: theme.palette.secondary.main,
        padding: '2em',
        display: 'block',
    },
    tableTitle: {
        paddingBottom: '10px'
    },
    uploadButton: {
        color: '#ffffff',
        fontWeight: 'bold'
    },
    buttonObs: {
        backgroundColor: theme.palette.primary.main,
        borderRadius: '4px',
        width: '210px',
        height: '36px'
    },
    textAObs: {
        color: '#FFFFFF',
        fontSize: '14px',
        fontWeight: '500',
        letterSpacing: '0.58px',
        lineHeight: '17px',
        textAlign: 'center'
    },
    text_store: {
        color: '#ffffff',
        fontSize: '16px',
        fontWeight: '400',
        letterSpacing: '0.53px',
        lineHeight: '19px',
        marginBottom: '40px'
    },
    notInformedFields: {
        marginTop: theme.spacing(4),
        marginBottom: theme.spacing(4),
        backgroundColor: theme.palette.secondary.main,
        paddingLeft: '20px',
        paddingRight: '20px'
    },
    buttonOpenCase: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(1),
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2)
    },
    hintOpenCase: {
        color: theme.palette.text.hint
    }
});

class FormRegistryObservations extends SubscribedComponent {

    constructor(props) {
        super(props);
        this.state = {
            caseCreationStatus: '',
            selectedTab: 0,
            caseTitle: '',
            caseDescription: '',
            caseFiles: [],
            value: null,
            obs: '',
            formVersion: 'e700',
        };
    }

    setObs = event => {
        this.setState({
            obs: event.target.value
        });
    };

    setCaseTitle = event => {
        this.setState({
            caseTitle: event.target.value
        });
    };

    setCaseDescription = event => {
        this.setState({
            caseDescription: event.target.value
        });
    };

    handleTabChange = (event, newValue) => {
        this.setState({selectedTab: newValue});
    };

    finishCaseCreation = () => {
        // Popup o toast
        this.setState({
            caseTitle: '',
            caseDescription: '',
            caseFiles: [],
            caseCreationStatus: '',
            formVersion: 'e700'
        });
    };

    finishInstanceCommentCreation = () => {
        this.setState({
            obs: '',
            formVersion: 'e700'
        });
    };

    updateToReviewedState = event => {
        event.preventDefault();
        this.subscribe(
            FormService.updateFormState({
                state: 'answer_reviewed',
                id: this.props.id,
                form_codename: this.state.formVersion
            }),
            response => {
                this.setSnackBar();
                if (history) history.push(reverse('e700.registry'));
            },
            error => ConsoleHelper(error, "error")
        )
    };

    openCase = () => {
        if (this.state.caseTitle === '' || this.state.caseDescription === '') {
            this.setState({ caseCreationStatus: 'missing_fields' });
            return;
        }
        this.setState({ caseCreationStatus: 'creating' });
        this.subscribe(
            FormService.createCase({
                title: this.state.caseTitle,
                description: this.state.caseDescription,
                id: this.props.id
            }),
            response => {
                this.setSnackBar();
                this.finishCaseCreation();
                this.props.fetchCases();
            },
            error => {
                this.setState({uploadRequestError: true, caseCreationStatus: 'request_failed'});
            }
        )
    };

    saveObs() {
        return () => {
            this.subscribe(
                FormService.saveObservations(
                    {
                        comment: this.state.obs,
                        form_codename: this.state.formVersion,
                        id: this.props.id
                    }),
                response => {
                    this.setSnackBar();
                    this.finishInstanceCommentCreation();
                    this.props.onCommentCreate(response);
                    this.props.fetchInstance(response);
                }
            )
        };
    }

    setSnackBar() {
        this.props.actions.openSnackbar('Los cambios han sido guardados correctamente.', 'success', null, null);
    }

    TabContainer = props => {
        return <Typography component="div">{props.children}</Typography>;
    };

    handleOnClick(id) {
        return (event) => {
            event.preventDefault();
            if (history) {
                history.push(reverse('e700.case', {id}));
            }
        };
    };

    renderObservationsTable() {
        const {comments} = this.props;
        const columns = [
            { title: 'Observación',
                render: data =>  data.content,
                sorting: false
            },
            { title: 'Fecha de creación',
                render: data => moment(data.created_at).format(ISO_DATE_FORMAT),
                defaultSort: 'asc',
                customSort: (data1, data2) => getDateSortNumber(data1.created_at, data2.created_at),
            },
            { title: 'Creado por',
                render: data => data.created_by,
                sorting: false
            }
        ];
        return (<TMaterialTable
            data={comments}
            columns={columns}
            options={{toolbar: false, paging: false}}
            localization={{body: {emptyDataSourceMessage: 'No se encontraron observaciones'}}}
        />);
    }

    renderCasesTable() {
        const {casesList, classes} = this.props;
        const columns = [
            { title: 'Título del caso',
                field: 'title' },
            { title: 'Fecha de creación',
                render: data => data.created_at.split('T', 1) },
            { title: 'Estado',
                render: data => data.state === 'open' ? 'Abierto' : 'Cerrado' },
            { render: data => <Button component="span" className={classes.uploadButton}
                onClick={this.handleOnClick(data.id)}>
                                    VER CASO
            </Button>
            }
        ];
        return (<TMaterialTable
            data={casesList}
            columns={columns}
            options={{toolbar: false, paging: false, sorting: false}}
            localization={{body: {emptyDataSourceMessage: 'No se encontraron casos'}}}
        />);
    }



    render() {
        const {classes, form, schema, answers, newFiles} = this.props;
        const {selectedTab, caseTitle, caseCreationStatus, caseDescription, obs} = this.state;
        return (
            <Grid container className={classes.root}>
                <Grid item xs={12}>
                    <Typography className={classes.text}>Revisión Registro E700</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography className={classes.subtext}>
                        Ingresa las observaciones del registro o abre un caso a continuación:
                    </Typography>
                </Grid>
                <Grid item xs={12} className={classes.tabsContainer}>
                    <AppBar position="static">
                        <Tabs value={selectedTab} onChange={this.handleTabChange}>
                            <Tab label="Observaciones"/>
                            <Tab label="Casos"/>
                            {form.state !== 'answer_reviewed' ? <Tab label="Archivar Registro"/> : ''}
                        </Tabs>
                    </AppBar>
                    {/* Guardar Observacion */}
                    {this.state.selectedTab === 0 && (
                        <this.TabContainer>
                            <div className={classes.tabObservations}>
                                <div>
                                    <Typography className={classes.tableTitle}>Observaciones generadas desde este registro E700</Typography>
                                    {this.renderObservationsTable()}
                                </div>
                                <div>
                                    <TextField
                                        label="Añade observaciones a este registro E700 (opcional)"
                                        value={obs}
                                        onChange={this.setObs}
                                        className={classes.obsText}
                                        margin="normal"
                                        fullWidth
                                        required
                                    />
                                    <div>
                                        <Button className={classes.buttonObs} onClick={this.saveObs()}>
                                            <Typography className={classes.textAObs}>Añadir Observación</Typography>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </this.TabContainer>
                    )}
                    {/* Abrir caso */}
                    {selectedTab === 1 && (
                        <this.TabContainer>
                            <div className={classes.tabContainer}>
                                <div>
                                    <Typography className={classes.tableTitle}>
                                        Casos generados desde este registro E700
                                    </Typography>
                                    {this.renderCasesTable()}
                                </div>
                                <div>
                                    <TextField
                                        label="Título del caso"
                                        className={classes.textField}
                                        value={caseTitle}
                                        onChange={this.setCaseTitle}
                                        helperText={caseCreationStatus === 'missing_fields' ? 'Campo requerido' : ''}
                                        error={caseCreationStatus === 'missing_fields' && caseTitle === ''}
                                        margin="normal"
                                        fullWidth
                                        required
                                    />
                                </div>
                                <div>
                                    <TextField
                                        label="Descripción del caso"
                                        className={classes.textField}
                                        value={caseDescription}
                                        onChange={this.setCaseDescription}
                                        helperText={caseCreationStatus === 'missing_fields' ? 'Campo requerido' : ''}
                                        error={caseCreationStatus === 'missing_fields' && caseDescription === ''}
                                        margin="normal"
                                        fullWidth
                                        multiline
                                        required
                                    />
                                </div>
                                <div>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={this.openCase}
                                        className={classes.buttonOpenCase}
                                    >
                                        Abrir caso
                                    </Button>
                                </div>
                                <div>
                                    <Typography variant="body2" className={classes.hintOpenCase}>
                                        Una vez que abras un caso, podrás adjuntar archivos,
                                        comentar la bitácora y cambiar su estado cuando corresponda.
                                        Haz click en VER CASO para acceder a estas opciones
                                    </Typography>
                                </div>
                            </div>
                        </this.TabContainer>
                    )}
                    {selectedTab === 2 && (
                        <this.TabContainer>
                            <div className={classes.tabContainer}>
                                <Typography className={classes.text_store}>
                                    Este registro E700 no ha sido archivado y se encuentra en RECIBIDOS
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="medium"
                                    className={classes.button}
                                    onClick={this.updateToReviewedState}
                                >
                                    <Typography className={classes.text_button}>
                                        Archivar
                                    </Typography>
                                </Button>
                            </div>
                        </this.TabContainer>
                    )}
                </Grid>
                <Grid item xs={12}>
                    <Box display="flex" flexDirection="column" alignItems="center" className={classes.notInformedFields}>
                        <Box display="flex" alignItems="center">
                            <KeyboardArrowRight/>
                            <Typography className={classes.text3}>
                                Estos son los campos que la EMPRESA MINERA no informó:
                            </Typography>
                        </Box>

                        <OmittedFields schema={schema} answers={answers} documents={form.documents} newFiles={newFiles}/>

                    </Box>
                </Grid>
            </Grid>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return { actions: bindActionCreators(snackbarActions, dispatch) };
}

export default connect(null, mapDispatchToProps)(withStyles(styles)(FormRegistryObservations));

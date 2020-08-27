import React, {Component} from 'react';
import {Box, CircularProgress, Typography, Link, IconButton, Grid,
    Dialog, DialogTitle, DialogContent,
    TableContainer, Table, TableBody, TableHead,
    TableRow, TableCell,
    withStyles} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import {PanTool, CheckCircle, Warning} from '@material-ui/icons';
import {COLORS} from '@authorities/theme';
import RequestTargetDataButton from '@authorities/components/target/RequestTargetDataButton';

const styles = theme => ({
    root: {
        backgroundColor: theme.palette.primary.dark,
        border: `1px solid ${theme.palette.grey[600]}`,
        borderRadius: 4,
        padding: 16,
        marginTop: '30px'
    },
    titleMessage: {
        fontWeight: 'bold',
        fontSize: '1rem'
    },
    titleMessageIcon: {
        marginRight: theme.spacing(1),
        fontSize: '1rem'
    },
    textLink: {
        verticalAlign: 'inherit'
    },
    requestButton: {
        margin: 0
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
    },
    dialogContent: {
        paddingBottom: 20
    },
    loadingDataCaption: {
        verticalAlign: 'middle',
        marginLeft: theme.spacing(1)
    },
    closeRequestsBoxButton: {
        float: "right",
        padding: 0
    }
});

/**
 * A component for rendering the request box with all its subcomponents.
 *
 * @version 1.0.0
 */
class RequestsBox extends Component {

    state = {
        openRequestsBox: false,
        openRequestsDialog: false,
        openTimeConditionsDialog: false,
        dumpRequestsStatus: 1,
    };

    handleOpenRequestsBox = () => { this.setState({openRequestsBox: true}); };
    handleCloseRequestsBox = () => { this.setState({openRequestsBox: false}); };

    handleOpenRequestsDialog = () => { this.setState({openRequestsDialog: true}); };
    handleCloseRequestsDialog = () => { this.setState({openRequestsDialog: false}); };

    handleOpenTimeConditionsDialog = () => { this.setState({openTimeConditionsDialog: true}); };
    handleCloseTimeConditionsDialog = () => { this.setState({openTimeConditionsDialog: false}); };

    renderRequestsBox(status){
        const {classes, handleRequest, dataDumps} = this.props;
        const { dumpRequestsStatus } = this.state;

        const waitingDumps = dataDumps.some(dd => dd.state === 'waiting_response');

        const boxContent = [
            {
                state: 0,
                icon: <PanTool className={classes.titleMessageIcon}/>,
                title: "Visualización de datos incompleta",
                infoText: (<Box>Dentro del rango de fechas seleccionadas, existen&nbsp;
                    <Link className={classes.textLink}
                        component="button" underline="always" color="textPrimary"
                        onClick={this.handleOpenRequestsDialog}>
                            períodos en que no se solicitaron datos
                    </Link>.<br></br>
                    Para visualizar estos datos faltantes, primero debe solicitarlos (no requiere autorización).&nbsp;
                    {/* <Link className={classes.textLink}
                        component="button" underline="always" color="textPrimary"
                        onClick={this.handleOpenTimeConditionsDialog}> Saber más sobre tiempos de carga</Link>.
                    <br></br> */}
                    <Box mt={2}>
                        <RequestTargetDataButton className={classes.requestButton} handleRequest={handleRequest}/>
                        {waitingDumps ?
                            <Typography className={classes.loadingDataCaption} variant="caption"><CircularProgress size="1.5em"/> Hay datos que se están cargando desde los servidores de la compañía minera...</Typography>
                            : null}
                    </Box>
                </Box>)
            },
            {
                state: 1,
                icon: <CheckCircle style={{color: COLORS.success.main}} className={classes.titleMessageIcon}/>,
                title: "Datos cargados exitósamente para su visualización",
                infoText: null,
                closable: true
            },
            {
                state: -1,
                icon: <Warning style={{color: COLORS.error.main}} className={classes.titleMessageIcon}/>,
                title: "No fue posible traer los datos. Intente más tarde e informe a soporte técnico",
                infoText: null,
                closable: true
            },
        ];

        const selectedBoxContent = boxContent.find((c) => c.state === dumpRequestsStatus);
        return selectedBoxContent ? (<Box className={classes.root}>
            <Typography display="inline" className={classes.titleMessage}>{selectedBoxContent.icon}{selectedBoxContent.title}</Typography>
            {selectedBoxContent.infoText}
            {selectedBoxContent.closable ? <IconButton className={classes.closeRequestsBoxButton} onClick={this.handleCloseRequestsBox}><CloseIcon/></IconButton> : null}
        </Box>) : null;
    }

    renderRequestsDialog() {
        const {classes, dataGaps} = this.props;
        const {openRequestsDialog} = this.state;
        return (
            <Dialog fullWidth open={openRequestsDialog} onClose={this.handleCloseRequestsDialog}>
                <DialogTitle>
                    <Grid container>
                        <Grid item>
                            Períodos sin datos disponibles
                        </Grid>
                        <Grid item>
                            <IconButton className={classes.closeButton} onClick={this.handleCloseRequestsDialog}><CloseIcon/></IconButton>
                        </Grid>
                    </Grid>
                </DialogTitle>

                <DialogContent className={classes.dialogContent}>
                    <Typography>No se han realizado solicitudes de datos en los siguientes rangos de fechas:</Typography>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Desde</TableCell>
                                    <TableCell>Hasta</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                { (dataGaps || []).map((r, i) => (<TableRow key={i}>
                                    <TableCell>{r.startDate.format("DD-MM-YYYY HH:mm")}</TableCell>
                                    <TableCell>{r.endDate.format("DD-MM-YYYY HH:mm")}</TableCell>
                                </TableRow>)) }
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
            </Dialog>
        );
    }

    renderTimeConditionsDialog(){
        const {classes} = this.props;
        const {openTimeConditionsDialog} = this.state;

        return (
            <Dialog fullWidth open={openTimeConditionsDialog} onClose={this.handleCloseTimeConditionsDialog}>
                <DialogTitle>
                    <Grid container>
                        <Grid item>
                            Factores que influyen en los tiempos de carga
                        </Grid>
                        <Grid item>
                            <IconButton className={classes.closeButton} onClick={this.handleCloseTimeConditionsDialog}><CloseIcon/></IconButton>
                        </Grid>
                    </Grid>
                </DialogTitle>

                <DialogContent className={classes.dialogContent}>
                    <Typography>Los datos pueden demorar en cargar dependiendo de la velocidad de conexión
                        con los servidores de la compañía minera, la velocidad de su propia conexión y el rango de fechas 
                        en que se realizó la solcitiud.</Typography>
                </DialogContent>
            </Dialog>
        );
    }

    setRequestBoxStatus() {
        const {dataGaps, emptyDumps, failedDump} = this.props;
        if (failedDump){
            this.setState({
                dumpRequestsStatus: -1,
                openRequestsBox: true
            });
        }
        else if (!emptyDumps && dataGaps.length === 0){
            this.setState({
                dumpRequestsStatus: 1,
                openRequestsBox: true
            });
        }
        else{
            this.setState({
                dumpRequestsStatus: 0,
                openRequestsBox: true
            });
        }
    }

    componentDidMount(){
        this.setRequestBoxStatus();
    }

    componentDidUpdate(prevProps) {
        if (this.props.dataGaps !== prevProps.dataGaps){
            this.setRequestBoxStatus();
        }
    }

    render() {
        const {openRequestsBox} = this.state;
        return (<>
            {openRequestsBox ? 
                [this.renderRequestsBox(), this.renderRequestsDialog()] 
                : null}
        </>);
    }
}



export default withStyles(styles)(RequestsBox);

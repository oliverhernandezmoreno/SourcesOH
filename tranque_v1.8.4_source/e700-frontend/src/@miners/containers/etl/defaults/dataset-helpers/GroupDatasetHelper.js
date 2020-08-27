import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import {
    Button,
    CircularProgress,
    DialogActions,
    DialogTitle,
    Dialog,
    DialogContent,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Typography,
} from '@material-ui/core';
import OpenInNew from '@material-ui/icons/OpenInNew';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import * as etlService from '@app/services/backend/etl';

const styles = (theme) => ({
    instruction: {
        marginBottom: '10px',
    },
    loadingContainer: {
        textAlign: 'center',
    },
    loading: {
        color: 'white',
        marginTop: '1rem',
    },
    icon: {
        marginRight: theme.spacing(0.6),
    },
    dataTable: {
        overflowY: 'auto',
        height: '320px',
    },
    cell: {
        fontSize: '1.1rem',
    },
});

const pristineState = {
    groups: null,
    errorLoading: false,
    dialogOpen: false,
};

export default withStyles(styles)(
    class extends SubscribedComponent {
        state = {...pristineState};

        componentDidMount() {
            const {
                target,
                executor: {name: executor},
            } = this.props;
            this.subscribe(
                etlService.listExecutorGroups({target, executor}),
                (groups) =>
                    this.setState((state) => ({
                        ...pristineState,
                        groups,
                        dialogOpen: state.dialogOpen,
                    })),
                () =>
                    this.setState((state) => ({
                        ...pristineState,
                        errorLoading: true,
                        dialogOpen: state.dialogOpen,
                    }))
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

        renderGroups() {
            const {classes} = this.props;
            return (
                <div className={classes.dataTable}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell component="th">Nombre de agrupación</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.groups.map(({name}, index) => (
                                <TableRow key={`group-row-${index}`}>
                                    <TableCell className={classes.cell}>{name}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            );
        }

        render() {
            const {classes} = this.props;
            return (
                <>
                    <Button
                        size="medium"
                        variant="outlined"
                        onClick={() => this.setState({dialogOpen: true})}
                    >
                        <OpenInNew className={classes.icon} />
                        AGRUPACIONES
                    </Button>
                    <Dialog
                        onClose={() => this.setState({dialogOpen: false})}
                        open={this.state.dialogOpen}
                        maxWidth="md"
                        fullWidth={true}
                    >
                        <DialogTitle>Agrupaciones necesarias</DialogTitle>
                        <DialogContent>
                            <Typography className={classes.instruction}>
                                Para ingresar datos mediante un archivo MS Excel, debes tipear el nombre
                                correcto de Sectores, Perfiles, Instrumentos y Puntos de Monitoreo. A
                                continuación los nombres que el sistema reconocerá como válidos:
                            </Typography>
                            {this.state.errorLoading && (
                                <Typography color="error">
                                    Ocurrió un error al cargar los datos. Inténtelo más tarde.
                                </Typography>
                            )}
                            {!this.state.errorLoading && this.state.groups === null && this.renderLoading()}
                            {!this.state.errorLoading && this.state.groups !== null && this.renderGroups()}
                        </DialogContent>
                        <DialogActions>
                            <Button size="large" onClick={() => this.setState({dialogOpen: false})}>
                                ENTENDIDO
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            );
        }
    }
);

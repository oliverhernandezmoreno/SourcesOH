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
    parameters: null,
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
                etlService.listExecutorParameters({target, executor}),
                (parameters) =>
                    this.setState((state) => ({
                        ...pristineState,
                        parameters,
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

        renderParameters() {
            const {classes} = this.props;
            return (
                <div className={classes.dataTable}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell component="th">Nombre de parámetro</TableCell>
                                <TableCell component="th">Valor de parámetro</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.parameters.map(({name, value}, index) => (
                                <TableRow key={`group-row-${index}`}>
                                    <TableCell className={classes.cell}>{name}</TableCell>
                                    <TableCell className={classes.cell}>
                                        <code>{JSON.stringify(value)}</code>
                                    </TableCell>
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
                        PARÁMETROS AUXILIARES
                    </Button>
                    <Dialog
                        onClose={() => this.setState({dialogOpen: false})}
                        open={this.state.dialogOpen}
                        maxWidth="md"
                        fullWidth={true}
                    >
                        <DialogTitle>Parámetros necesarios</DialogTitle>
                        <DialogContent>
                            <Typography className={classes.instruction}>
                                En algunos casos, es necesario usar parámetros específicos para referirse a
                                características puntuales del depósito de relaves. Los siguientes parámetros
                                son usados en esta carga de datos y deben mencionarse como tal.
                            </Typography>
                            {this.state.errorLoading && (
                                <Typography color="error">
                                    Ocurrió un error al cargar los datos. Inténtelo más tarde.
                                </Typography>
                            )}
                            {!this.state.errorLoading &&
                                this.state.parameters === null &&
                                this.renderLoading()}
                            {!this.state.errorLoading &&
                                this.state.parameters !== null &&
                                this.renderParameters()}
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

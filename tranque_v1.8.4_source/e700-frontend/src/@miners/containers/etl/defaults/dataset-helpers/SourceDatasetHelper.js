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
import {forkJoin} from 'rxjs';

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
    sources: null,
    errorLoading: false,
    dialogOpen: false,
};

const assembleSources = ({groups, sources}) => {
    const groupMap = groups.reduce((acc, group) => ({...acc, [group.id]: group}), {});
    return sources.map((source) => ({
        ...source,
        groupName: source.groups.map((groupId) => groupMap[groupId]).filter((g) => g)[0]?.name,
    }));
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
                forkJoin({
                    groups: etlService.listExecutorGroups({target, executor}),
                    sources: etlService.listExecutorSources({target, executor}),
                }),
                (result) =>
                    this.setState((state) => ({
                        ...pristineState,
                        sources: assembleSources(result),
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

        renderSources() {
            const {classes} = this.props;
            return (
                <div className={classes.dataTable}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell component="th">Nombre de agrupación</TableCell>
                                <TableCell component="th">
                                    Nombre del punto de medición o instrumento
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.sources.map(({name, groupName}, index) => (
                                <TableRow key={`group-row-${index}`}>
                                    <TableCell className={classes.cell}>{groupName}</TableCell>
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
                        PUNTOS DE MEDICIÓN E INSTRUMENTOS
                    </Button>
                    <Dialog
                        onClose={() => this.setState({dialogOpen: false})}
                        open={this.state.dialogOpen}
                        maxWidth="md"
                        fullWidth={true}
                    >
                        <DialogTitle>Puntos de medición e instrumentos necesarios</DialogTitle>
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
                            {!this.state.errorLoading && this.state.sources === null && this.renderLoading()}
                            {!this.state.errorLoading && this.state.sources !== null && this.renderSources()}
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

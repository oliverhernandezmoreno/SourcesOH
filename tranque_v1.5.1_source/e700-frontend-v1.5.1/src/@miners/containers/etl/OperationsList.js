import React from 'react';
import moment from 'moment/moment';
import {withStyles} from '@material-ui/core/styles';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Done from '@material-ui/icons/Done';
import Error from '@material-ui/icons/Error';
import PlayCircleOutline from '@material-ui/icons/PlayCircleOutline';
import Visibility from '@material-ui/icons/Visibility';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Typography from '@material-ui/core/Typography';

import {history} from '@app/history';
import {formatInteger, formatUsername} from '@app/services/formatters';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import * as etlService from '@app/services/backend/etl';

const styles = (theme) => ({
    loadingContainer: {
        textAlign: 'center'
    },
    loading: {
        color: 'white',
        marginTop: '1rem'
    },
    neutralIcon: {
        marginRight: theme.spacing(1)
    },
    successIcon: {
        color: '#38e47b',
        marginRight: theme.spacing(1)
    },
    successText: {
        color: '#38e47b'
    },
    errorIcon: {
        color: '#fdff3f',
        marginRight: theme.spacing(1)
    },
    errorText: {
        color: '#fdff3f'
    }
});

const pristineState = {
    page: 1,
    pageSize: 15,
    operations: null,
    loadError: false
};


/**
 * An auxiliary view used to display old data load operations. This
 * component should be rendered with:
 * - target: the target's canonical name
 * - link: a function that generates a detail link given an operation
 *   object
 * - executors: a list of specs for the executors to include in the
 *   operations list.
 * - executors[].executor: the key for each executor
 * - executors[].title: the verbose name of each executor
 */
class OperationsList extends SubscribedComponent {
    state = {
        ...pristineState
    };

    componentDidMount() {
        this.loadOperations();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.executors.some((e) => !this.props.executors.some(({executor}) => e.executor === executor)) ||
            this.props.executors.some((e) => !prevProps.executors.some(({executor}) => e.executor === executor)))
        {
            this.setState({...pristineState});
            this.loadOperations();
        }
    }

    loadOperations() {
        this.subscribe(
            etlService.list({
                cache: 60 * 1000,
                target: this.props.target,
                executor: this.props.executors.map(({executor}) => executor),
                page: this.state.page,
                pageSize: this.state.pageSize
            }),
            (operations) => this.setState((state) => ({...pristineState, page: state.page, operations})),
            () => this.setState({loadError: true})
        );
    }

    etlTemplate(name) {
        return (this.props.executors.find(({executor}) => name === executor) || {title: name}).title;
    }

    setPage(page) {
        return () => this.setState({page, operations: null}, this.loadOperations.bind(this));
    }

    goToOperationDetail(operation) {
        return () => history.push(this.props.link(operation));
    }

    renderLoadError() {
        return (
            <Typography color="error">
                No se pudo cargar el registro. Inténtelo nuevamente más tarde.
            </Typography>
        );
    }

    renderLoading() {
        const {classes} = this.props;
        return (
            <div className={classes.loadingContainer}>
                <CircularProgress className={classes.loading}/>
            </div>
        );
    }

    renderStatusIcon(operation) {
        const {classes} = this.props;
        if (operation.state === 'success') {
            return (
                <Grid container direction="row" alignItems="center">
                    <Grid item>
                        <Done className={classes.successIcon}/>
                    </Grid>
                    <Grid item>
                        <Typography className={classes.successText}>Carga correcta</Typography>
                    </Grid>
                </Grid>
            );
        } else if (operation.deliverable) {
            return (
                <Grid container direction="row" alignItems="center">
                    <Grid item>
                        <PlayCircleOutline className={classes.neutralIcon}/>
                    </Grid>
                    <Grid item>
                        <Typography>Pendiente</Typography>
                    </Grid>
                </Grid>
            );
        } else {
            return (
                <Grid container direction="row" alignItems="center">
                    <Grid item>
                        <Error className={classes.errorIcon}/>
                    </Grid>
                    <Grid item>
                        <Typography className={classes.errorText}>
                            Con errores
                        </Typography>
                    </Grid>
                </Grid>
            );
        }
    }
    renderTable() {
        return (
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell component="th">
                            <IconButton disabled={this.state.page === 1}
                                onClick={this.setPage(this.state.page - 1)}>
                                <ChevronLeft/>
                            </IconButton>
                        </TableCell>
                        <TableCell component="th">
                            Inicio
                        </TableCell>
                        <TableCell component="th">
                            Plantilla
                        </TableCell>
                        <TableCell component="th">
                            Usuario
                        </TableCell>
                        <TableCell component="th">
                            Datos precargados
                        </TableCell>
                        <TableCell component="th">
                            Estado
                        </TableCell>
                        <TableCell component="th" align="right">
                            <IconButton
                                disabled={(this.state.page * this.state.pageSize) >= this.state.operations.count}
                                onClick={this.setPage(this.state.page + 1)}>
                                <ChevronRight/>
                            </IconButton>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {this.state.operations.results.map((operation, index) => (
                        <TableRow key={operation.id}>
                            <TableCell>
                                {this.state.operations.count - index - (this.state.pageSize * (this.state.page - 1))}
                            </TableCell>
                            <TableCell>
                                <Typography>{moment(operation.started).format('lll')}</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography>
                                    {this.etlTemplate(operation.executor)}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography>{formatUsername(operation.user)}</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography>
                                    {operation.state === 'success' ?
                                        formatInteger(operation.data_count) :
                                        '-'}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                {this.renderStatusIcon(operation)}
                            </TableCell>
                            <TableCell>
                                <IconButton onClick={this.goToOperationDetail(operation)} title="Ver detalle">
                                    <Visibility/>
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    }

    render() {
        return (
            <>
                <Typography variant="h6">Registro de ingreso de datos e inspecciones</Typography>
                {this.state.loadError ? this.renderLoadError() : null}
                {!this.state.loadError && this.state.operations === null ? this.renderLoading() : null}
                {this.state.operations ?
                    (this.state.operations.count > 0 ?
                        this.renderTable() :
                        <Typography>No hay registros.</Typography>) :
                    null}
            </>
        );
    }
}

export default withStyles(styles)(OperationsList);

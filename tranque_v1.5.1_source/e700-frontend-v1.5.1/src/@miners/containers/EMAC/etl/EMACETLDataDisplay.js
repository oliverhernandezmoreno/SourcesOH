import React from 'react';
import moment from 'moment';
import {withStyles} from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Typography from '@material-ui/core/Typography';
import Done from '@material-ui/icons/Done';
import Error from '@material-ui/icons/Error';
import Refresh from '@material-ui/icons/Refresh';

import {formatDecimal} from '@app/services/formatters';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import * as etlService from '@app/services/backend/etl';

const styles = (theme) => ({
    successBanner: {
        padding: theme.spacing(1),
        border: '2px darkgreen solid',
        borderRadius: '5px',
        marginBottom: theme.spacing(3)
    },
    successIcon: {
        color: 'darkgreen',
        marginRight: theme.spacing(1)
    },
    errorBanner: {
        padding: theme.spacing(1),
        border: '2px #fdff3f solid',
        borderRadius: '5px',
        marginBottom: theme.spacing(3)
    },
    errorIcon: {
        color: '#fdff3f',
        marginRight: theme.spacing(1)
    },
    loadingContainer: {
        textAlign: 'center'
    },
    loading: {
        color: 'white',
        marginTop: '1rem'
    },
    resultsSection: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3)
    },
    tableResult: {
        overflowY: 'auto',
        height: '200px'
    }
});

class EMACETLDataDisplay extends SubscribedComponent {
    state = {
        data: null,
        loading: false,
        error: false
    };

    loadData() {
        const {target, operation} = this.props;
        this.setState({loading: true, error: false});
        this.subscribe(
            etlService.data({
                cache: 3 * 60 * 1000,
                target,
                operation: operation.id
            }),
            (data) => this.setState({loading: false, error: false, data}),
            () => this.setState({loading: false, error: true, data: null})
        );
    }

    componentDidMount() {
        const {operation} = this.props;
        if (operation.data_count > 0) {
            this.loadData();
        }
    }

    renderBanner(bannerClass, icon, text, children) {
        return (
            <>
                <div className={bannerClass}>
                    <Grid container direction="row" alignItems="center">
                        <Grid item>
                            {icon}
                        </Grid>
                        <Grid item>
                            <Typography>{text}</Typography>
                        </Grid>
                    </Grid>
                </div>
                {children}
            </>
        );
    }

    renderErrorItem(error, index) {
        let primary = null;
        const secondary = (
            typeof error.linenumber !== 'undefined' ?
                `En línea ${error.linenumber} hoja '${error.sheet_name}'` :
                null
        );
        const symbols = {gt: '>', lt: '<', gte: '≥', lte: '≤'};
        switch (error.code) {
            case 'out-of-range':
                primary = [
                    'Valor numérico fuera del rango admitido',
                    `(valor informado: ${formatDecimal(error.value, 16)};`,
                    `valor límite: ${symbols[error.operator] || ''} ${formatDecimal(error.limit, 16)})`,
                ].join(' ');
                break;
            case 'invalid-value':
                primary = 'Valor numérico no válido';
                break;
            case 'invalid-timestamp':
                primary = 'Fecha no válida';
                break;
            case 'missing-series':
                primary = `La variable ${error.variable || ''} no está definida`;
                break;
            case 'missing-source':
                primary = 'El punto de monitoreo no existe';
                break;
            case 'value-mismatch':
                primary = [
                    `El valor de ${error.series || 'la variable'}`,
                    `en ${error.source || 'el punto'}`,
                    'no coincide con otras ocurrencias del mismo dato en el archivo'
                ].join(' ');
                break;
            case 'invalid-ionic-balance':
                primary = [
                    `El balance iónico para el punto ${error.source || ''}`,
                    error.ionicBalance ?
                        `es ${formatDecimal(error.ionicBalance)}` :
                        'no pudo ser calculado',
                ].join(' ');
                break;
            default:
                return null;
        }
        return (
            <ListItem key={`error-${index}`}>
                <ListItemText primary={primary} secondary={secondary}/>
            </ListItem>
        );
    }

    renderSummary() {
        const {operation, classes} = this.props;
        if (operation.state === 'success') {
            return null;
        }
        if (operation.deliverable) {
            return this.renderBanner(
                classes.successBanner,
                <Done className={classes.successIcon}/>,
                'Puede proceder con la carga de datos.'
            );
        }
        if (operation.errors.length === 0 && operation.data_count === 0) {
            return this.renderBanner(
                classes.errorBanner,
                <Error className={classes.errorIcon}/>,
                'No se encontraron datos en el archivo cargado.'
            );
        }
        if (operation.errors.length === 1 && operation.errors[0].code === 'parsing-error') {
            return this.renderBanner(
                classes.errorBanner,
                <Error className={classes.errorIcon}/>,
                'No se pudo interpretar el archivo cargado. Asegúrese de usar formato MS EXCEL o CSV.'
            );
        }
        if (operation.errors.every((e) => e.code === 'invalid-ionic-balance')) {
            return this.renderBanner(
                classes.errorBanner,
                <Error className={classes.errorIcon} />,
                'Las mediciones presentan errores en su balance iónico',
                <List dense>
                    {operation.errors.map((error, index) => this.renderErrorItem(error, index))}
                </List>
            );
        }
        if (operation.errors.length > 0) {
            return this.renderBanner(
                classes.errorBanner,
                <Error className={classes.errorIcon}/>,
                'Hay errores en los datos.',
                <List dense>
                    {operation.errors.map((error, index) => this.renderErrorItem(error, index))}
                </List>
            );
        }
        return this.renderBanner(
            classes.errorBanner,
            <Error className={classes.errorIcon}/>,
            'La operación de carga está obsoleta.'
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

    renderDataTable() {
        const {classes} = this.props;
        return (
            <div className={classes.resultsSection}>
                <Typography variant="h6">Datos precargados</Typography>
                <div className={classes.tableResult}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell component="th">#</TableCell>
                                <TableCell component="th">Fecha de medición</TableCell>
                                <TableCell component="th">Variable</TableCell>
                                <TableCell component="th">Valor</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.data.map((value, index) => (
                                <TableRow key={`value-row-${index}`}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{moment(value.timestamp).format('lll')}</TableCell>
                                    <TableCell>{(value.series || {}).name || '--'}</TableCell>
                                    <TableCell align="right">{formatDecimal(value.value, 16)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    }

    render() {
        return (
            <>
                {this.renderSummary()}
                {this.state.loading && this.renderLoading()}
                {this.state.error && (
                    <Grid container direction="row" alignItems="center">
                        <Grid item>
                            <Typography color="error">
                                No se pudieron cargar los datos{' '}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <IconButton title="Reintentar"
                                onClick={this.loadData.bind(this)}>
                                <Refresh/>
                            </IconButton>
                        </Grid>
                    </Grid>
                )}
                {this.state.data && this.renderDataTable()}
            </>
        );
    }
}

export default withStyles(styles)(EMACETLDataDisplay);

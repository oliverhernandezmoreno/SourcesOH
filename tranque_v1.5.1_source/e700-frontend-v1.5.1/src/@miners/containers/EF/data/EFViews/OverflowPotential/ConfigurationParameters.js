import React from 'react';
import Card from '@material-ui/core/Card';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
// import SelectableTimeseries from 'DefaultTemporalView/SelectableTimeseries';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import * as ParameterService from '@app/services/backend/parameter';
import * as TimeseriesService from '@app/services/backend/timeseries';

const styles = theme => ({
    root: {
        margin: '0 30px',
        backgroundColor: '#161719',
    },
    container: {
        display: 'grid',
        gridTemplateColumns: '1fr',
        backgroundColor: '#262629',
        padding: theme.spacing(2),
    },
    title: {
        width: '50%',
        height: '100%',
        display: 'inline-block',
        position: 'relative'
    },
    content: {
        width: '100%',
        position: 'relative'
    },
    parameterItem: {
        cursor: 'pointer',
        padding: theme.spacing(2),
        border: '1px solid #4E5762',
        borderRadius: '0 0 4px 4px',
        backgroundColor: '#26303c',
    },
    parametersTitle: {
        paddingBottom: theme.spacing(2),
    },
    modal: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.4)',
        position: 'fixed',
        top: '0',
        left: '0',
        zIndex: '1201',
        display: 'none',
    },
    openModal: {
        display: 'grid',
    },
    modalContent: {
        gridArea: '1/1',
        margin: 'auto',
        maxWidth: '80%',
        padding: '1em',
        backgroundColor: '#161719',
        maxHeight: '70%',
        overflow: 'auto',
    },
    modalTitle: {
        padding: theme.spacing(2),
    },
    tableWrapper: {
        border: '1px solid #515151',
        borderRadius: '4px',
        backgroundColor: '#262629',
    }
});

const labelMap = {
    'curva-embalse': {
        cotaCoronamiento: 'Cota de coronamiento',
        volumen: 'Volumen embalsado',
    },
    'curva-capacidad-volumen-disponible': {
        cotaCoronamiento: 'Cota de coronamiento',
        volumen: 'Volumen total disponible',
    },
    'area-cubeta': {
        area: 'Área cubeta [km2]',
        cr: 'Coeficiente Cr',
        p: 'Coeficiente P\' [mm]',
    },
    'areas-aportantes': {
        code: 'Área aportante',
        area: 'Área total [km2]',
        cr: 'Coeficiente Cr',
        p: 'Coeficiente P\' [mm]',
    },
    'vertederos': {
        code: 'Vertedero de emergencia',
        capacidadDesvio: 'Capacidad máxima de desvío [m3/hr]',
        cotaInicioFuncionamiento: 'Cota inicio de funcionamiento [m.s.n.m.]',
    },
    'canales-perimetrales': {
        code: 'Canal perimetral',
        desvio: 'Capacidad máxima de desvío [m3/hr]',
        areaCode: 'Área aportante',
        desvioConexion: 'Sector desvío de agua',
    },
    'embalses': {
        code: 'Embalse',
        capacidad: 'Capacidad máx del estanque de embalsamiento [m3] ',
        areaCode: 'Área aportante',
        descargaCanalCode: 'Canal perimetral',
    },
    'potencial-rebalse.tiempo-rebalse': {
        evacuationTime: 'Tiempo de evacuación'
    }
};


class ConfigurationParameters extends SubscribedComponent {

    constructor(props){
        super(props);
        this.state = {
            isModalOpen: false,
            modalData: '',
        }
    }

    openModal = (title, canonical_name) => {
        this.setState({
            isModalOpen: true, 
            modalTitle: title,
            modalData: canonical_name,
            isModalloading: true,
        });
        if(canonical_name === 'potencial-rebalse.tiempo-rebalse'){
            this.subscribe(
                TimeseriesService.list({
                    cache: 60 * 1000,  // one minute
                    target: this.props.target,
                    template_name: `ef-mvp.m2.parameters.${canonical_name}`,
                }),
                (data) => {
                    const threshold = data[0]?.thresholds?.[0];
                    const value = threshold?.lower ?? '-';
                    const unit = data[0]?.unit?.name ?? '';
                    const reconstructedData = {
                        "name": "Embalses",
                        "canonical_name": canonical_name,
                        "schema": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "evacuationTime": {
                                        "type": "string",
                                        "minLength": 1
                                    },
                                },
                            }
                        },
                        "value": [
                            {
                                "evacuationTime": `${value} ${unit}s`,
                            }
                        ]
                    }
                    this.setState({modalData: reconstructedData, isModalloading: false})
                }
            );
            return;
        }
        this.subscribe(
            ParameterService.read({
                cache: 60 * 1000,  // one minute
                target: this.props.target,
                id: canonical_name,
            }),
            (data) => {
                this.setState({modalData: data, isModalloading: false})
            }
        );
    }
    objectToValue = (obj) => {
        if(Object.keys(obj).includes('exterior'))
            return 'Fuente externa'
        else return Object.values(obj)[0];
    }

    renderRow = (type, headers, data, id) => {
        return typeof data === 'object' ? <TableRow>{
            headers.map(col => {
                let value = data[col];
                if(typeof value === 'object')
                    value = this.objectToValue(value);
                return <TableCell key={col}>{value}</TableCell>;
            })}
        </TableRow> :
            <TableRow>{
                [data].flatMap(col => {
                    const value = data;
                    return <TableCell key={col}>{value}</TableCell>;
                })}
            </TableRow>
    }

    renderTable = (data) => {
        const { classes } = this.props;
        let headers = [];
        let values = [];
        const type = data?.schema?.type;
        if(type === 'object'){
            headers = Object.keys(data?.schema?.properties).flatMap(item => {
                if(data?.schema?.properties[item]?.items)
                    return Object.keys(data?.schema?.properties[item]?.items?.properties);
                else
                    return item;
            });
        }
        if(type === 'array'){
            headers = Object.keys(data?.schema?.items?.properties ?? {})
        } 
        values = data?.value ?? [];
        return (
            <Paper className={classes.root}>
                <div className={classes.modalTitle}>
                    <Typography variant='body1'>
                        {this.state.modalTitle}
                    </Typography>
                </div>
                <div className={classes.tableWrapper}>
                    <Table className={classes.table} aria-label="custom pagination table">
                        <TableHead>
                            <TableRow>
                                {headers.map((key) => {
                                    return <TableCell key={key}>{labelMap?.[data.canonical_name]?.[key] ?? '-'}</TableCell>
                                })}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                type === 'object' ? 
                                    Object.values(values).flat().map((v) => this.renderRow(type, headers, v, data.canonical_name))
                                    : 
                                    values.map((v) => this.renderRow(type, headers, v, data.canonical_name))
                            }
                        </TableBody>
                    </Table>
                </div>
            </Paper>
        );
    }

    render() {
        const { classes } = this.props;

        return (
            <Paper className={classes.root}>
                <div className={[classes.modal, this.state.isModalOpen ? classes.openModal:''].join(' ')} 
                    onClick={() => this.setState({isModalOpen: false})}>
                    <div className={classes.modalContent}>
                        {this.renderTable(this.state.modalData)}
                    </div>
                </div>
                <Card className={classes.container}>
                    <div className={classes.parametersTitle}>
                        <Typography variant='body1'>
                            Curva de embalse
                        </Typography>
                    </div>
                    <div className={classes.parameterItem} onClick={() => this.openModal('Curva de embalse', 'curva-embalse')}>
                        <Typography variant='body1'>
                            Curva de embalse
                        </Typography>
                    </div>
                    <div className={classes.parameterItem} onClick={() => this.openModal('Curva de capacidad de volumen disponible', 'curva-capacidad-volumen-disponible')}>
                        <Typography variant='body1'>
                            Curva de capacidad de volumen disponible
                        </Typography>
                    </div>
                    <div className={classes.parameterItem} onClick={() => this.openModal('Área de la cubeta', 'area-cubeta')}>
                        <Typography variant='body1'>
                            Área de la cubeta
                        </Typography>
                    </div>
                    <div className={classes.parameterItem} onClick={() => this.openModal('Áreas aportantes', 'areas-aportantes')}>
                        <Typography variant='body1'>
                            Áreas aportantes
                        </Typography>
                    </div>
                    <div className={classes.parameterItem} onClick={() => this.openModal('Vertederos de emergencia', 'vertederos')}>
                        <Typography variant='body1'>
                            Vertederos de emergencia
                        </Typography>
                    </div>
                    <div className={classes.parameterItem} onClick={() => this.openModal('Canales perimetrales', 'canales-perimetrales')}>
                        <Typography variant='body1'>
                            Canales perimetrales
                        </Typography>
                    </div>
                    <div className={classes.parameterItem} onClick={() => this.openModal('Embalses', 'embalses')}>
                        <Typography variant='body1'>
                            Embalses
                        </Typography>
                    </div>
                    <div className={classes.parameterItem} onClick={() => this.openModal('Tiempo de evacuación', 'potencial-rebalse.tiempo-rebalse')}>
                        <Typography variant='body1'>
                            Tiempo de evacuación
                        </Typography>
                    </div>
                </Card>
            </Paper>
        );
    }
}

const MapStateToProps = state => {
    return {
        serieCanonicalName: state.miners.timeSeries.serie_canonical_name
    };
};

ConfigurationParameters.propTypes = {
    classes: PropTypes.object.isRequired
};

export default connect(MapStateToProps, null)(withStyles(styles)(ConfigurationParameters));

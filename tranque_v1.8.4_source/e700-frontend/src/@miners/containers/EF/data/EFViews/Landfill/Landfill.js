import React from 'react';
import Card from '@material-ui/core/Card';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import { getEFLabel } from '@miners/components/EF/EF.labels';
import AboutParameter from '../DefaultTemporalView/AboutParameter'
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import SwitchBox from '../SwitchBox'
import Button from '@material-ui/core/Button';
import SimpleModal from '../DefaultTemporalView/SimpleModal';
import Link from '@material-ui/core/Link';
import * as ParameterService from '@app/services/backend/parameter';
import * as SiteParameterService from '@app/services/backend/siteParameter';
import { forkJoin } from 'rxjs';
import * as moment from 'moment';

const styles = theme => ({
    root: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        backgroundColor: '#303030'
    },
    container: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        backgroundColor: '#262629',
        padding: '1.5em',
    },
    header: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: '100%',
        margin: '30px',
        marginBottom: '0px'
    },
    title: {
        height: '100%',
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
    },
    content: {
        width: '100%',
        position: 'relative',
    },
    bottomContent: {
        width: '100%',
        position: 'relative',
        padding: '30px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
    },
    button: {
        whiteSpace: 'pre',
        '&:disabled': {
            backgroundColor: '#424242',
        }
    },
    buttonLink: {
        color: '#24aff4',
        textDecoration: 'underline',
    },
    threeColumns: {
        display: 'grid',
        gridTemplateColumns: 'minmax(13em, 1fr) max-content max-content;',
        gridColumnGap: '1em',
    },
    paragraph: {
        padding: '2em 0',
    },
    introParagraph: {
        paddingBottom: '2em',
    }
});


class Landfill extends SubscribedComponent {

    state = {
        isLoading: true,
        thresholdHistory: [],
        startingThreshold: 'desconocido',
        startingThresholdBackend: 'desconocido',
        siteParameters: {},
    };

    setFilters = (filters) => {
        this.setState({
            filters
        })
    }

    getSiteParameters() {
        this.subscribe(
            SiteParameterService.get({v1: true}),
            data => {
                this.setState({siteParameters: data});
            }
        );
    }

    componentDidMount() {
        this.loadStartingThreshold();
        this.loadHistory();
        this.getSiteParameters();
    }

    loadStartingThreshold = () => {
        const startingThresholdCanonicalName = `vertederos`;
        this.subscribe(
            forkJoin({
                startingThresholdResponse: ParameterService.read({
                    cache: 60 * 1000,  // one minute
                    target: this.props.target,
                    id: startingThresholdCanonicalName,
                }),
            }),
            ({ startingThresholdResponse }) => {
                const startingThreshold = startingThresholdResponse?.value?.[0]?.cotaInicioFuncionamiento;
                this.setState({
                    startingThreshold,
                    startingThresholdBackend: startingThreshold,
                    landfillData: startingThresholdResponse?.value?.[0],
                });
            });
    }

    loadHistory = () => {
        const startingThresholdCanonicalName = `vertederos`;
        this.subscribe(
            forkJoin({
                startingThresholdResponse: ParameterService.history({
                    cache: 60 * 1000,  // one minute
                    target: this.props.target,
                    id: startingThresholdCanonicalName,
                }),
            }),
            ({ startingThresholdResponse }) => {
                const thresholdHistory = startingThresholdResponse;
                this.setState({
                    thresholdHistory,
                });
            });
    }

    updateThreshold = () => {
        const startingThresholdCanonicalName = `vertederos`;
        this.subscribe(
            forkJoin({
                startingThresholdResponse: ParameterService.partialUpdate({
                    cache: 60 * 1000,  // one minute
                    target: this.props.target,
                    id: startingThresholdCanonicalName,
                    value: [
                        {...this.state.landfillData, 
                            cotaInicioFuncionamiento: this.state.startingThreshold
                        }
                    ],
                }),
            }),
            ({ updateThresholdResponse }) => {
                const startingThreshold = updateThresholdResponse?.value?.[0]?.cotaInicioFuncionamiento;
                this.setState({
                    startingThreshold,
                    startingThresholdBackend: startingThreshold,
                    landfillData: updateThresholdResponse?.value?.[0],
                });
            });
    }

    openModal = () => {
        this.setState({
            isModalOpen: true,
        })
    }

    closeModal = () => {
        this.setState({
            isModalOpen: false,
        })
    }

    render() {
        const { classes, wikiLink } = this.props;
        const template = 'vertedero';

        return (
            <div>
                <Card className={classes.root}>
                    <div className={classes.header}>
                        <div className={classes.title}>
                            <Typography variant='h5'>
                                {getEFLabel(template)}
                            </Typography>
                            <AboutParameter description={this.state.description} wikiLink={this.state.siteParameters[wikiLink]}></AboutParameter>
                        </div>
                    </div>

                    
                    <div className={classes.bottomContent}>
                        <SimpleModal isModalOpen={this.state.isModalOpen} closeModal={this.closeModal}>
                            <Table className={classes.table} aria-label="custom pagination table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Cota [m.s.n.m]</TableCell>
                                        <TableCell>Fecha</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {this.state.thresholdHistory && this.state.thresholdHistory.map((row, index) => {
                                        return <TableRow key={index}>
                                            <TableCell>{row?.value?.[0]?.cotaInicioFuncionamiento}</TableCell>
                                            <TableCell>{moment(row?.date_created).format('LL')}</TableCell>
                                        </TableRow>
                                    })}
                                </TableBody>
                            </Table>
                        </SimpleModal>
                        <div>
                            <Typography variant='body2' color="textSecondary" className={classes.introParagraph}>
                                Cota de inicio de funcionamiento del vertedero de emergencia
                            </Typography>
                            <Paper className={classes.root}>
                                <Card className={classes.container}>
                                    <div>
                                        <Typography variant='body2'>
                                            Cota inicio funcionamiento
                                        </Typography>
                                        <FormControl>
                                            <div className={classes.threeColumns}>
                                                <TextField
                                                    id="standard-number"
                                                    label="m.s.n.m"
                                                    type="number"
                                                    disabled={this.state.startingThreshold === 'desconocido'}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                    value={this.state.startingThreshold}
                                                    onChange={(e) => {this.setState({startingThreshold: Number(e.target.value)})}}
                                                />
                                                <Button
                                                    className={classes.button}
                                                    onClick={this.updateThreshold}
                                                    type="submit"
                                                    size="large"
                                                    variant="contained"
                                                    color="primary"
                                                    disabled={this.state.startingThreshold === this.state.startingThresholdBackend || this.props.disableActions}>
                                                    Modificar cota
                                                </Button>
                                                <Link
                                                    className={classes.buttonLink}
                                                    component="button" variant="body2"
                                                    onClick={() => {this.openModal()}} >
                                                    Valores anteriores
                                                </Link>
                                            </div>
                                        </FormControl>
                                    </div>
                                </Card>
                            </Paper>
                            <Typography variant='body2' color="textSecondary" className={classes.paragraph}>
                                Si detectas situaciones como la(s) descrita(s) a continuación,
                                puedes informarlo al sistema, lo que permitirá gestionar tickets
                                de incidentes o alerta.
                                &nbsp;<Link color="textPrimary" target="_blank" href={this.state.siteParameters['glossary.tickets']}>Saber más</Link>
                            </Typography>
                            <SwitchBox
                                header='Modificación de la cota de operación del vertedero de emergencia'
                                bodyContent='Los vertederos de emergencia asociados a depósito de relaves comienzan a operar a una determinada cota de la laguna aguas claras, esta cota está definida por la ubicación del vertedero, la etapa de crecimiento del muro o la cantidad de losetas instalada en la estructura entre otros factores. En caso que ocurra una modificación de la cota de funcionamiento del vertedero por cualquier tipo de motivo es necesario activar este evento gatillador.'
                                // checked={true}
                                switchProps={{
                                    canonical_name: 'triggers.cota-vertedero',
                                    target: this.props.target,
                                    disabled: this.props.disableActions
                                }}
                            />
                            <SwitchBox
                                header='Vertedero de Emergencia no está operativo'
                                bodyContent='Corresponde a cualquier problema en el vertedero de emergencia que tenga como consecuencia que este no se encuentre completamente operativo, en caso de ser necesario su uso. En caso de detectar mediante un reporte o comunicación con otros operadores un problema en el vertedero que podría afectar su funcionamiento, se debe activar el evento gatillador.'
                                // checked={true}
                                switchProps={{
                                    canonical_name: 'triggers.cota-vertedero',
                                    target: this.props.target,
                                    disabled: this.props.disableActions
                                }}
                            />
                        </div>
                        <div>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }
}

const MapStateToProps = state => {
    return {
        serieCanonicalName: state.miners.timeSeries.serie_canonical_name
    };
};

Landfill.propTypes = {
    classes: PropTypes.object.isRequired
};

export default connect(MapStateToProps, null)(withStyles(styles)(Landfill));

import React from 'react';
import moment from 'moment/moment';
import {Card, Paper, Grid, Typography, withStyles} from '@material-ui/core';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getEFLabel } from '@miners/components/EF/EF.labels';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import EFFilter from '../../EFFilters/EFFilter';
import AboutParameter from '../DefaultTemporalView/AboutParameter'
import RainInput from './RainInput';
import ConfigurationParameters from './ConfigurationParameters';
import SwitchBox from '../SwitchBox'
import * as SiteParameterService from '@app/services/backend/siteParameter';
import OverflowPotentialPlot from './OverflowPotentialPlot.js';
import OverflowTimePlot from './OverflowTimePlot.js';
import ImageMapContainer from '@miners/containers/EF/data/EFViews/maps/ImageMapContainer';
import RequestsBox from '@authorities/components/target/RequestsBox';
import {getGaps} from '@app/services/backend/dumpRequest';

const styles = theme => ({
    root: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        backgroundColor: '#303030'
    },
    header: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        margin: '30px',
        marginBottom: '0px'
    },
    title: {
        height: '100%',
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
    },
    dateSelectorWrapper: {
        margin: '0 30px',
        padding: '30px',
        paddingBottom: '0',
        backgroundColor: '#262629',
    },
    content: {
        width: '100%',
        position: 'relative',
    },
    content__timeseries: {
        backgroundColor: '#262629',
        margin: ' 0 30px',
    },
    bottomContent: {
        width: '100%',
        position: 'relative',
        padding: '30px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
    },
    SelectableTimeseriesRoot: {
        width: '100%',
        height: '70%',
        position: 'relative',
        padding: '2em',
    },
    SelectableTimeseriesCard__div: {
        display: 'inline-block',
        verticalAlign: 'top',
        width: '100%',
    },
    SelectableTimeseriesGraphic__timeseries: {
        width: '100%',
        height: '100%',
        display: 'inline-block',
        verticalAlign: 'top',
        padding: '1em'
    },
    SelectableTimeseriesGraphic__selector: {
        width: '100%',
        height: '100%',
        display: 'inline-block',
        verticalAlign: 'top',
        padding: '1em'
    },
    SelectableTimeseriesButton__export: {
        color: '#01aff4',
        border: '1px solid #01aff4'
    },
    SelectableTimeseriesButton__label: {
        marginLeft: '0.5em'
    },
    SelectableTimeseriesContent__subtitle: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: '1em'
    },
    SelectableTimeseriesInnerCard: {
        maxWidth: '100%',
        maxHeight: '100%',
        minHeight: "432px",
    },
    SelectableTimeseriesPlot_innerCard: {
        maxWidth: '100%',
        maxHeight: '100%'
    },
    SelectableTimeseriesSpinnerContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '432px',
        background: '#303030',
    },
    map: {
        margin: 30,
        backgroundColor: '#262629',
    }
});


class OverflowPotential extends SubscribedComponent {

    state = {
        filters: {
            startDate: moment().subtract(1, 'year').startOf('day'),
            endDate: moment().endOf('day'),
        },
        isLoading: true,
        siteParameters: {}
    };

    setFilters = (filters) => {
        this.setState({
            filters
        })
    }

    setPotentialPlotDescription = (description) => {
        this.setState({
            potentialDescription: description,
        });
    }

    setTimePlotDescription = (description) => {
        this.setState({
            timeDescription: description,
        });
    }

    setRainInputDescription = (description) => {
        this.setState({
            rainDescription: description,
        });
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
        this.getSiteParameters();
    }

    render() {
        const { classes, template, dataDumps, handleRequest, wikiLink } = this.props;
        const plotTemplates = this.props.sections;
        const filterType = plotTemplates?.[0]?.config?.filterType;//Improve checking first
        const description = [
            ...(this.state.potentialDescription ?? []),
            ...(this.state.timeDescription ?? []),
            ...(this.state.rainDescription ?? []),
        ];

        // Variables used to get datagaps of EF Visualizations
        let dataGaps, vegaDataGaps;
        if (dataDumps) {
            dataGaps = getGaps(this.state.filters.startDate, this.state.filters.endDate, dataDumps);
            vegaDataGaps = dataGaps.map((dg, i) => ({
                x: dg.startDate.format('YYYY-MM-DD'),
                x2: dg.endDate.format('YYYY-MM-DD'),
                name: 'dataGap-' + i
            }));
        }

        return (
            <div>
                <Card className={classes.root}>
                    <div className={classes.header}>
                        <div className={classes.title}>
                            <Typography variant='h5'>
                                {getEFLabel(template)}
                            </Typography>
                            <AboutParameter description={description} wikiLink={this.state.siteParameters[wikiLink]}></AboutParameter>
                        </div>
                    </div>
                    <RainInput
                        target={this.props.target}
                        reloadPlots={() => this.setState({filters: {...this.state.filters}})}
                        setDescription={this.setRainInputDescription}
                        disableActions={this.props.disableActions}></RainInput>

                    <div className={classes.content}>
                        <div className={classes.dateSelectorWrapper}>
                            <EFFilter filterType={filterType} filters={this.state.filters} setFilters={this.setFilters} />
                            {dataDumps ? 
                                <RequestsBox 
                                    dataDumps={dataDumps}
                                    dataGaps={dataGaps}
                                    handleRequest={handleRequest} /> 
                                : null
                            }
                        </div>
                        <Card className={classes.content__timeseries}>
                            <OverflowPotentialPlot filters={this.state.filters}
                                target={this.props.target}
                                template={this.props.template}
                                setDescription={this.setPotentialPlotDescription}
                                vegaDataGaps={vegaDataGaps}/>
                        </Card>
                        <Card className={classes.content__timeseries}>
                            <OverflowTimePlot filters={this.state.filters}
                                target={this.props.target}
                                template={this.props.template}
                                setDescription={this.setTimePlotDescription}
                                vegaDataGaps={vegaDataGaps}/>
                        </Card>
                    </div>
                    <Grid container direction='column' className={classes.bottomContent}>
                        <Grid item>
                            <Typography variant='body2' color="textSecondary">
                                Cuando el sensor detecte inicio de lluvia, se combinarán estos
                                datos reales con los de Pronóstico. En caso de que exista superación
                                de algún umbral, se creará un ticket para la gestión de incidentes.
                            </Typography>
                            <SwitchBox
                                header='Estado canales perimetrales'
                                bodyContent='Corresponde a cualquier tipo de evento que afecte el funcionamiento de los canales perimetrales, entre los principales eventos se pueden destacar deslizamiento de terreno natural sobre los canales o directamente deslizamiento o derrumbe de parte de estos, bloqueo u obstrucción de algún sector del canal entre otros. En caso de detectar mediante un reporte, comunicación con otros operadores o visualmente este tipo de situaciones es necesario activar el evento gatillador.'
                                // checked={true}
                                switchProps={{
                                    canonical_name: 'triggers.canales-perimetrales',
                                    target: this.props.target,
                                    disabled: this.props.disableActions
                                }}
                            />
                            <SwitchBox
                                header='Estado vertedero de emergencia'
                                bodyContent='Corresponde a cualquier problema en el vertedero de emergencia que tenga como consecuencia que este no se encuentre completamente operativo, en caso de ser necesario su uso. En caso de detectar mediante un reporte o comunicación con otros operadores un problema en el vertedero que podría afectar su funcionamiento, se debe activar el evento gatillador.'
                                // checked={true}
                                switchProps={{
                                    canonical_name: 'triggers.cota-vertedero',
                                    target: this.props.target,
                                    disabled: this.props.disableActions
                                }}
                            />
                        </Grid>
                        <Grid item>
                            <div>
                                <ConfigurationParameters target={this.props.target}></ConfigurationParameters>
                            </div>
                            <div>
                                <Paper className={classes.map}>
                                    <ImageMapContainer
                                        width={400}
                                        map_canonical_name='overflow-potential-map'
                                        name='Cuenca aportante al depósito'
                                    />
                                </Paper>
                            </div>
                        </Grid>
                    </Grid>
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

OverflowPotential.propTypes = {
    classes: PropTypes.object.isRequired
};

export default connect(MapStateToProps, null)(withStyles(styles)(OverflowPotential));

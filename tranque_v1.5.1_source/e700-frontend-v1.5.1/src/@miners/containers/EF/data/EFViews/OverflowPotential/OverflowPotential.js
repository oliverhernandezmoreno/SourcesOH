import React from 'react';
import moment from 'moment/moment';
import Card from '@material-ui/core/Card';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import { getEFLabel } from '@miners/components/EF/EF.labels';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import EFFilter from '../../EFFilters/EFFilter';
import RainInput from './RainInput';
import ConfigurationParameters from './ConfigurationParameters';
import SwitchBox from '../SwitchBox'

import OverflowPotentialPlot from './OverflowPotentialPlot.js';
import OverflowTimePlot from './OverflowTimePlot.js';

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
        width: '100%',
        margin: '30px',
        marginBottom: '0px'
    },
    title: {
        width: '50%',
        height: '100%',
        display: 'inline-block',
        position: 'relative'
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
    }
});


class OverflowPotential extends SubscribedComponent {

    state = {
        filters: {
            startDate: moment().subtract(1, 'year').startOf('day'),
            endDate: moment().endOf('day'),
        },
        isLoading: true,
    };

    setFilters = (filters) => {
        this.setState({
            filters
        })
    }

    render() {
        const { classes, template } = this.props;
        const plotTemplates = this.props.sections;
        const filterType = plotTemplates?.[0]?.config?.filterType;//Improve checking first

        return (
            <div>
                <Card className={classes.root}>
                    <div className={classes.header}>
                        <div className={classes.title}>
                            <Typography variant='h5'>
                                {getEFLabel(template)}
                            </Typography>
                        </div>
                    </div>
                    <RainInput target={this.props.target} reloadPlots={() => this.setState({filters: {...this.state.filters}})}></RainInput>

                    <div className={classes.content}>
                        <div className={classes.dateSelectorWrapper}>
                            <EFFilter filterType={filterType} filters={this.state.filters} setFilters={this.setFilters} />
                        </div>
                        <Card className={classes.content__timeseries}>
                            <OverflowPotentialPlot filters={this.state.filters}
                                target={this.props.target}
                                template={this.props.template} />
                        </Card>
                        <Card className={classes.content__timeseries}>
                            <OverflowTimePlot filters={this.state.filters}
                                target={this.props.target}
                                template={this.props.template} />
                        </Card>
                    </div>
                    <div className={classes.bottomContent}>
                        <div>
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
                                }}
                            />
                            <SwitchBox
                                header='Estado vertedero de emergencia'
                                bodyContent='Corresponde a cualquier problema en el vertedero de emergencia que tenga como consecuencia que este no se encuentre completamente operativo, en caso de ser necesario su uso. En caso de detectar mediante un reporte o comunicación con otros operadores un problema en el vertedero que podría afectar su funcionamiento, se debe activar el evento gatillador.'
                                // checked={true}
                                switchProps={{
                                    canonical_name: 'triggers.cota-vertedero',
                                    target: this.props.target,
                                }}
                            />
                        </div>
                        <div>
                            <ConfigurationParameters target={this.props.target}></ConfigurationParameters>
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

OverflowPotential.propTypes = {
    classes: PropTypes.object.isRequired
};

export default connect(MapStateToProps, null)(withStyles(styles)(OverflowPotential));

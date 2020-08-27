import React from 'react';
import Card from '@material-ui/core/Card';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import { getEFLabel } from '@miners/components/EF/EF.labels';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import SwitchBox from '../SwitchBox'
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';

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
        width: '50%',
        height: '100%',
        display: 'inline-block',
        position: 'relative'
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
    };

    setFilters = (filters) => {
        this.setState({
            filters
        })
    }

    render() {
        const { classes } = this.props;
        const template = 'vertedero';

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


                    <div className={classes.bottomContent}>
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
                                                    disabled={true}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                    value={123}
                                                    onChange={(e) => {}}
                                                />
                                                <Button
                                                    className={classes.button}
                                                    onClick={()=>{}}
                                                    type="submit"
                                                    size="large"
                                                    variant="contained"
                                                    color="primary"
                                                    disabled={true}>
                                                    Modificar cota
                                                </Button>
                                                <Link
                                                    className={classes.buttonLink}
                                                    component="button" variant="body2"
                                                    onClick={event => {}} >
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
                                de incidentes o alerta. Saber más

                            </Typography>
                            <SwitchBox
                                header='Modificación de la cota de operación del vertedero de emergencia'
                                bodyContent='Los vertederos de emergencia asociados a depósito de relaves comienzan a operar a una determinada cota de la laguna aguas claras, esta cota está definida por la ubicación del vertedero, la etapa de crecimiento del muro o la cantidad de losetas instalada en la estructura entre otros factores. En caso que ocurra una modificación de la cota de funcionamiento del vertedero por cualquier tipo de motivo es necesario activar este evento gatillador.'
                                // checked={true}
                                switchProps={{
                                    canonical_name: 'triggers.cota-vertedero',
                                    target: this.props.target,
                                }}
                            />
                            <SwitchBox
                                header='Vertedero de Emergencia no está operativo'
                                bodyContent='Corresponde a cualquier problema en el vertedero de emergencia que tenga como consecuencia que este no se encuentre completamente operativo, en caso de ser necesario su uso. En caso de detectar mediante un reporte o comunicación con otros operadores un problema en el vertedero que podría afectar su funcionamiento, se debe activar el evento gatillador.'
                                // checked={true}
                                switchProps={{
                                    canonical_name: 'triggers.cota-vertedero',
                                    target: this.props.target,
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

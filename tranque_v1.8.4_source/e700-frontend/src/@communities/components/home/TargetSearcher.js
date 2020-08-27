import React, {Component} from 'react'
import {Typography, Button, CircularProgress} from '@material-ui/core';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TSelect from '@app/components/utils/TSelect';
import {reverse} from '@app/urls';
import {history} from '@app/history';

const styles = theme => ({
    mainDiv: {
        margin: "0 auto",
        maxWidth: '700px',
    },
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        margin: '30px',
    },
    formControl: {
        width: '100%',
        textAlign: 'center',
        marginBottom: '15px',
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
    button: {
        background: '#575757',
        borderRadius: '7px',
        width: '100%',
        height: '50px',
        marginTop: '20px'
    },
    typography:{
        textAlign: 'center',
        color: '#FFFFFF',
        fontFamily: 'Open Sans, sans-serif',
        fontSize: '22px',
        letterSpacing: '0.32px',
        lineHeight: '38px',
        fontWeight: '400',
    },
    buscar: {
        fontFamily: 'Open Sans, sans-serif',
        color: '#FFFFFF',
        textAlign: 'center',
        textTransform: 'capitalize',
        fontSize: '18px',
        fontWeight: 'bold'
    },
    selectLabel: {
        fontSize: '18px',
        fontFamily: 'Open Sans, sans-serif',
        color: '#ffffff'
    },
    select: {
        background: '#FFFFFF',
        borderRadius: '7px',
        fontSize: '18px',
        fontFamily: 'Open Sans, sans-serif',
    },
    colors: {
        dark: theme.palette.secondary.dark,
        light: theme.palette.secondary.light,
    }
});

class TargetSearcher extends Component {

        state = {
            selectedRegion: "",
            selectedCommune: "",
            regionCommunes: []
        };


        handleRegions(value) {
            const regionItem = this.props.regions.find((item) => item.label === value.name);
            this.setState({
                selectedRegion: value,
                selectedCommune: '',
                regionCommunes: (regionItem ? regionItem.regionCommunes : [])
            });
        };

        handleCommunes(value) {
            this.setState({selectedCommune: value})
        }

        render() {
            const {classes, regions} = this.props;
            const {selectedRegion, selectedCommune, regionCommunes} = this.state;
            const labelStyle = {fontSize: '18px', fontFamily: 'Open Sans, sans-serif'};
            const regionLabelOpacity = {opacity: (selectedRegion !== '' ? 0 : 100)};
            const communeLabelOpacity = {opacity: (selectedCommune !== '' ? 0 : 100)};
            return (
                <div className={classes.mainDiv}>
                    <Typography gutterBottom variant="h5" component="h4" className={classes.typography} >
                  Busca un depósito de relaves
                    </Typography>

                    <form className={classes.root} autoComplete="off">

                        <TSelect
                            labelProps={{shrink: false}}
                            formControlStyle={classes.formControl}
                            formControlVariant='outlined'
                            selectStyle={classes.select}
                            labelStyle={{...labelStyle, ...regionLabelOpacity}}
                            field='Selecciona tu región...'
                            hideDefault
                            menuItems={regions.length > 0 ? regions : [{label: (<CircularProgress size={20}/>), value: ''}]}
                            onChange={(event) => this.handleRegions(event.target.value)}
                            selected={selectedRegion}/>

                        <TSelect
                            disabled={regionCommunes.length === 0}
                            labelProps={{shrink: false}}
                            formControlStyle={classes.formControl}
                            formControlVariant='outlined'
                            selectStyle={classes.select}
                            labelStyle={{...labelStyle, ...communeLabelOpacity}}
                            field='Selecciona tu comuna...'
                            hideDefault
                            menuItems={regionCommunes}
                            onChange={(event) => this.handleCommunes(event.target.value)}
                            selected={selectedCommune}/>

                        <div style={{width:'100%'}}>
                            <Button
                                variant="contained" className={classes.button}
                                onClick={(event) => history.push(reverse('public.targets', {
                                    commune: selectedCommune.natural_name
                                }))}
                                disabled={selectedRegion === '' || selectedCommune === ''} >
                                <Typography className={classes.buscar}>
                                Buscar
                                </Typography>
                            </Button>
                        </div>
                    </form>
                </div>
            )
        }
}

TargetSearcher.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TargetSearcher);

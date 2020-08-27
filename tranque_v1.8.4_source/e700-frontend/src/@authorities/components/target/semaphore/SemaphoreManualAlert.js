import React, {Component} from 'react';
// import PropTypes from 'prop-types';
import { Grid, Box, Radio, RadioGroup, FormControl, FormControlLabel,
    Typography, TextField, withStyles } from '@material-ui/core';
import { AttachFile } from '@material-ui/icons';
import { UploadFileButton } from '@app/components/utils/UploadFileButton';
import ManualAlertButton from '@authorities/components/target/semaphore/ManualAlertButton'
import {RED_ALERT, YELLOW_ALERT} from '@alerts_events/constants/ticketGroups'
import {COLORS} from '@authorities/theme.js';

const styles = theme => ({
    root: {
        padding: theme.spacing(2),
        marginTop: theme.spacing(2),
    },
    radioGroup: {
        flexDirection: 'row'  
    },
    formControl: {
        border: `1px solid ${theme.palette.secondary.main}`,
        borderRadius: 8,
        marginBottom: theme.spacing(4)
    },
    formControlLabel: {
        width: '100%',
        justifyContent: 'center'
    },
    radioButton: {
        backgroundColor: 'red',
        '&$checked': {
            backgroundColor: 'green'
        }
    },
    checked: {},
    formControlRed: {
        color: COLORS.error.main,
    },
    formControlYellow: {
        color: COLORS.warning.main,
    }
});

const EF_CANONICAL_NAME = 'ef';
const EMAC_CANONICAL_NAME = 'emac';

/**
 * A component for rendering the status of EF and EMAC semaphores
 */
class SemaphoreManualAlert extends Component {

    initialState = {
        selectedScope: EF_CANONICAL_NAME,
        selectedScopeActiveAlert: false,
        selectedAlertType: RED_ALERT,
        newPublicMessage: "",
        publicMessageBlank: false,
        selectedFiles: null
    };

    handleScopeChange = (event) => {
        const {data: {activeAlerts}} = this.props;
        this.setState({
            selectedScope: event.target.value,
            selectedScopeActiveAlert: (event.target.value === EF_CANONICAL_NAME && activeAlerts.ef) || 
                (event.target.value === EMAC_CANONICAL_NAME && activeAlerts.emac)
        });
    }

    handleAlertTypeChange = (event) => {
        this.setState({
            selectedAlertType: event.target.value
        });
    }

    handlePublicMessageChange = (value) => {
        this.setState({
            newPublicMessage: value,
            publicMessageBlank: value === ""
        });
    }

    validateTextField = () => {
        const {newPublicMessage} = this.state;
        if (newPublicMessage === ""){
            this.setState({publicMessageBlank: true});
            return false;
        }else{
            this.setState({publicMessageBlank: false});
            return true; 
        }
    }

    constructor(props) {
        super(props);
        const {data: {activeAlerts}} = props;
        this.state = this.initialState;
        this.state.selectedScopeActiveAlert = activeAlerts.ef;

    }

    render() {
        const {target} = this.props.match.params;
        const {classes, services: {alertCreation}} = this.props;
        const {selectedScope, selectedScopeActiveAlert, selectedAlertType, newPublicMessage, publicMessageBlank, selectedFiles} = this.state;
        return (<Box className={classes.root}>
            <FormControl className={classes.formControl} component="fieldset" fullWidth>
                <RadioGroup className={classes.radioGroup} aria-label="scope" name="scope" value={this.state.selectedScope} onChange={e => this.handleScopeChange(e)}>
                    <Grid container>
                        <Grid item xs={6} style={{borderRight: `1px solid ${COLORS.secondary.main}`}}>
                            <FormControlLabel className={classes.formControlLabel} value={EF_CANONICAL_NAME} 
                                control={<Radio />} 
                                label={EF_CANONICAL_NAME.toUpperCase()} />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControlLabel className={classes.formControlLabel} value={EMAC_CANONICAL_NAME} 
                                control={<Radio />} 
                                label={EMAC_CANONICAL_NAME.toUpperCase()} />
                        </Grid>
                    </Grid>
                </RadioGroup>
            </FormControl>

            {selectedScopeActiveAlert ? 
                <Box bgcolor="text.disabled" p={2}>
                    <Typography align="center">
                        No se pueden crear alertas manuales si existe una alerta activa. 
                        Debe gestionar la alerta desde la sección de alertas y eventos.
                    </Typography>
                </Box>
                : <>
                    <FormControl className={classes.formControl} component="fieldset" fullWidth>
                        <RadioGroup className={classes.radioGroup} aria-label="alert_type" name="alert_type" value={this.state.selectedAlertType} onChange={e => this.handleAlertTypeChange(e)}>
                            <Grid container>
                                <Grid item xs={6} style={{borderRight: `1px solid ${COLORS.secondary.main}`}}>
                                    <FormControlLabel 
                                        className={`${classes.formControlLabel} ${classes.formControlRed}`}
                                        value={RED_ALERT} 
                                        control={<Radio />} 
                                        label="Alerta Roja" />
                                </Grid>
                                <Grid item xs={6}>
                                    <FormControlLabel 
                                        className={`${classes.formControlLabel} ${classes.formControlYellow}`}
                                        value={YELLOW_ALERT} 
                                        control={<Radio />} 
                                        label="Alerta Amarilla" />
                                </Grid>
                            </Grid>
                        </RadioGroup>
                    </FormControl>

                    <Box mb={4}>
                        <FormControl fullWidth variant="outlined">
                            <TextField
                                required
                                multiline
                                error={publicMessageBlank}
                                id="manual-alert-public-message"
                                label="Mensaje en el Sitio Público"
                                InputLabelProps={{color: 'secondary'}}
                                placeholder="Mensaje de prueba"
                                helperText={publicMessageBlank ? "Debe ingresar el mensaje a mostrar en el sitio público" : null}
                                variant="outlined"
                                onChange={e => this.handlePublicMessageChange(e.target.value)}/>
                        </FormControl>
                    </Box>

                    <Box>
                        <Typography>Puedes adjuntar un documentos que justifique la creación de la alerta manual:</Typography>
                        <Box mt={2} p={2} bgcolor="primary.main">
                            <Box display="flex" alignItems="center">
                                <Box flexGrow={1}>
                                    <Typography>{selectedFiles?.length > 0 ? 
                                        "Archivo ajdunto:" : "No se han adjuntado archivos" }
                                    </Typography>
                                </Box>
                                <UploadFileButton
                                    label='Adjuntar archivo'
                                    buttonProps={{
                                        startIcon: <AttachFile/>,
                                        variant:'contained',
                                        color: 'secondary',
                                        className: null
                                    }}
                                    onFileSelection={(files) => this.setState({selectedFiles: files})}
                                />
                            </Box>
                            {this.state.selectedFiles && this.state.selectedFiles.length > 0 ? <Box>
                                <ul>{this.state.selectedFiles.map(f => <li key={f.name}>{f.name}</li>)}</ul>
                            </Box> : null}
                        </Box>
                    </Box>

                    <Box display="flex" justifyContent="flex-end" mt={2}>
                        <ManualAlertButton
                            handleAlertCreation={alertCreation}
                            validateTextField={this.validateTextField}
                            target={target}
                            scope={selectedScope}
                            alertType={selectedAlertType}
                            newPublicMessage={newPublicMessage}
                            files={selectedFiles}/>
                    </Box>
                </>}
        </Box>);
    }
}


SemaphoreManualAlert.propTypes = {};

export default withStyles(styles)(SemaphoreManualAlert);

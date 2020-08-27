import React, {Component} from 'react';
// import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Grid, Box, Radio, RadioGroup, FormControl, FormControlLabel, Typography } from '@material-ui/core';
import { Error } from '@material-ui/icons';
import { IconTextGrid } from '@app/components/utils/IconTextGrid';
import SemaphoreConnect from '@authorities/components/target/semaphore/SemaphoreConnect';
import SemaphoreDisconnect from '@authorities/components/target/semaphore/SemaphoreDisconnect';
import { getAlertColor, hasActiveDisconnection, getWorstActiveAlert } from '@authorities/services/tickets';
import { COLORS } from '@authorities/theme.js';

const styles = theme => ({
    root: {
        padding: theme.spacing(2),
        marginTop: theme.spacing(2),
        borderRadius: "8px"
    },
    radioGroup: {
        flexDirection: 'row'  
    },
    formControl: {
        border: `1px solid ${theme.palette.secondary.main}`,
        borderRadius: 8
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
    checked: {}
});

const EF_CANONICAL_NAME = 'ef';
const EMAC_CANONICAL_NAME = 'emac';

/**
 * A component for rendering the status of EF and EMAC semaphores
 */
class SemaphoreAlertConnection extends Component {

    state = {
        selectedScope: EF_CANONICAL_NAME,
        response: false,
        responseMessage: ""
    };

    handleScopeChange(event) {
        this.setState({
            selectedScope: event.target.value
        });
    }

    handleResponse(message) {
        this.setState({response: true, responseMessage: message});
    }

    getLastPublicMessage() {
        const {selectedScope} = this.state;
        const publicMessages = [];
        const filteredMessages = (publicMessages || []).filter(pm => pm.scope === selectedScope);
        return filteredMessages.length > 0 ? filteredMessages[0] : null; // Since list of messages is ordered descending
    }

    render() {
        const {target} = this.props.match.params;
        const {classes, data: {tickets, disconnections}, services: {connection, disconnection}} = this.props;
        const {selectedScope, response, responseMessage} = this.state;

        return (<Box className={classes.root}>
            {response 
                ? <Box p={2} mb={4} display="flex" justifyContent="center" borderRadius="borderRadius" bgcolor="disabled.main" color="primary.main">
                    <IconTextGrid 
                        text={responseMessage} 
                        icon={<Error/>}/>
                </Box>
                : null}

            <Box mb={2}><Typography>Ámbito de monitoreo a gestionar:</Typography></Box>
            <FormControl className={classes.formControl} component="fieldset" fullWidth>
                <RadioGroup className={classes.radioGroup} aria-label="scope" name="scope" value={this.state.selectedScope} onChange={e => this.handleScopeChange(e)}>
                    <Grid container>
                        <Grid item xs={6} style={{borderRight: `1px solid ${COLORS.secondary.main}`}}>
                            <Box justifyContent="center">
                                <FormControlLabel className={classes.formControlLabel} value={EF_CANONICAL_NAME} 
                                    control={<Radio />} 
                                    label={EF_CANONICAL_NAME.toUpperCase()} />
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box justifyContent="center">
                                <FormControlLabel className={classes.formControlLabel} value={EMAC_CANONICAL_NAME} 
                                    control={<Radio />} 
                                    label={EMAC_CANONICAL_NAME.toUpperCase()} />
                            </Box>
                        </Grid>
                    </Grid>
                </RadioGroup>
            </FormControl>

            {hasActiveDisconnection(disconnections, selectedScope) 
                ? <SemaphoreConnect
                    handleConnection={() => connection()} 
                    target={target}
                    ticket={getWorstActiveAlert(tickets, selectedScope)} 
                    publicMessage={this.getLastPublicMessage()}
                    scope={selectedScope} 
                    alertStatusColor={getAlertColor(tickets, selectedScope)}/>
                : <SemaphoreDisconnect 
                    handleDisconnection={(comment, files) => {
                        return disconnection(this.state.selectedScope, comment, files,
                            (message) => this.handleResponse(message)
                        );
                    }} 
                    scope={selectedScope} 
                    alertStatusColor={getAlertColor(tickets, selectedScope)}/>}
        </Box>);
    }
}


SemaphoreAlertConnection.propTypes = {};

export default withStyles(styles)(SemaphoreAlertConnection);

import React, {Component} from 'react';
// import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Grid, Box, Radio, RadioGroup, FormControl, FormControlLabel } from '@material-ui/core';
import SemaphoreConnect from '@authorities/components/target/semaphore/SemaphoreConnect';
import SemaphoreDisconnect from '@authorities/components/target/semaphore/SemaphoreDisconnect';
import { getAlertColor, getWorstActiveAlert } from '@authorities/services/tickets';
import { hasActiveDisconnection, getLastActiveDisconnection } from '@authorities/services/disconnections';
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
        selectedScope: EF_CANONICAL_NAME
    };

    handleScopeChange(event) {
        this.setState({
            selectedScope: event.target.value
        });
    }

    render() {
        const {target} = this.props.match.params;
        const {classes, data: {tickets, disconnections}, services: {connection, disconnection, getLastPublicMessage}} = this.props;
        const {selectedScope} = this.state;

        return (<Box className={classes.root}>
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
                    handleConnection={connection} 
                    target={target}
                    scope={selectedScope}
                    lastPublicMessage={getLastPublicMessage(selectedScope)}
                    alertStatusColor={getAlertColor(tickets, selectedScope)}
                    ticket={getWorstActiveAlert(tickets, selectedScope)}
                    disconnection={getLastActiveDisconnection(disconnections, selectedScope)} />
                : <SemaphoreDisconnect 
                    handleDisconnection={disconnection}
                    target={target}
                    scope={selectedScope}
                    lastPublicMessage={getLastPublicMessage(selectedScope)}
                    alertStatusColor={getAlertColor(tickets, selectedScope)}/>}
        </Box>);
    }
}


SemaphoreAlertConnection.propTypes = {};

export default withStyles(styles)(SemaphoreAlertConnection);

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Box, Grid, Typography} from '@material-ui/core';
import {IconTextGrid} from '@app/components/utils/IconTextGrid';
import {AlertStatusIcon} from '@authorities/components/AlertStatusIcon';
import UpdatePublicMessageButton from '@authorities/components/target/semaphore/UpdatePublicMessageButton';

const styles = theme => ({
    root: {
        backgroundColor: theme.palette.primary.main,
        padding: theme.spacing(2),
        marginTop: theme.spacing(2),
        borderRadius: "8px"
    },
});

const emptyPublicMessage = "No existe un mensaje público asociado";

/**
 * A component for rendering the status of EF and EMAC semaphores
 */
class SemaphoreStatus extends Component {

    render() {
        const {classes, target, ticket, publicMessage, scope, alertStatusColor, disconnected, services} = this.props;
        const updatePublicAlertMessage = services?.updatePublicAlertMessage;
        return (<Box className={classes.root}>
            <IconTextGrid iconRight
                text={<Typography variant="h6">{scope?.toUpperCase()}</Typography>}
                icon={<AlertStatusIcon size="default" color={alertStatusColor} disconnected={disconnected}/>}/>
            <Grid container alignItems="baseline">
                <Grid item xs={3}><Typography variant="h6">Mensaje:</Typography></Grid>
                <Grid item xs={9}>{(publicMessage && publicMessage.content) || emptyPublicMessage}</Grid>
            </Grid>
            <Box display="flex" justifyContent="flex-end">
                <UpdatePublicMessageButton
                    target={target}
                    ticket={ticket}
                    scope={scope}
                    alertStatusColor={alertStatusColor}
                    updatePublicAlertMessage={updatePublicAlertMessage}/>
            </Box>
        </Box>);
    }
}


SemaphoreStatus.propTypes = {
    date: PropTypes.any,
    stateDescription: PropTypes.string
};

export default withStyles(styles)(SemaphoreStatus);

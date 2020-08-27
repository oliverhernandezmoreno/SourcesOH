import React, {Component} from 'react';
// import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Grid, Box, Typography } from '@material-ui/core';
import {AlertStatusIcon} from '@authorities/components/AlertStatusIcon';
import {IconTextGrid} from '@app/components/utils/IconTextGrid';
import UpdatePublicMessageButton from '@authorities/components/target/semaphore/UpdatePublicMessageButton';
import ConnectSemaphoreButton from '@authorities/components/target/semaphore/ConnectSemaphoreButton';
import { getAlertLabel } from '@authorities/services/tickets';
import classNames from 'classnames';

const styles = theme => ({
    root: {
        padding: theme.spacing(2),
        marginTop: theme.spacing(2),
        borderRadius: "8px",
        backgroundColor: theme.palette.primary.main
    },
    marginTop: {
        marginTop: '16px'
    },
    marginBottom: {
        marginBottom: '16px'
    }
});

const emptyPublicMessage = "No existe un mensaje público asociado";

/**
 * A component for rendering the box to connect alerts
 */
class SemaphoreConnect extends Component {

    state = {
    };

    render() {
        const {classes, target, ticket, lastPublicMessage, scope, alertStatusColor, disconnection, handleConnection} = this.props;

        return (<Box mt={2}>
            <Typography>Detalle del mensaje al conectar el semáforo en el sitio público:</Typography>
            <Box mt={2} className={classes.root}>
                <IconTextGrid 
                    text={<Typography variant="h6">{getAlertLabel(alertStatusColor) + ", Conectado al Sitio Público"}</Typography>} 
                    icon={<AlertStatusIcon color={alertStatusColor}/>}/>
                <Grid container className={classNames(classes.marginTop, classes.marginBottom)} alignItems="center">
                    <Grid item xs={2}><Typography variant="h6">Mensaje:</Typography></Grid>
                    <Grid item xs={10}>
                        <Box display="flex" height="100%" alignItems="flex-end">
                            <Typography variant="body1">{lastPublicMessage ? lastPublicMessage.content : emptyPublicMessage}</Typography>
                        </Box>
                    </Grid>
                </Grid>
                <hr/>
                <Grid container className={classes.marginTop}>
                    <Grid item xs={9}>
                        <Box fontStyle="italic">
                            <Typography variant="body2">Puedes actualizar el mensaje que se mostrará en el sitio público al conectar el semáforo.</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={3}>
                        <Box display="flex" justifyContent="flex-end">
                            <UpdatePublicMessageButton 
                                target={target}
                                ticket={ticket}
                                scope={scope}
                                alertStatusColor={alertStatusColor}/>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
            <Box mt={2} display="flex" justifyContent="flex-end">
                <ConnectSemaphoreButton 
                    handleConnection={handleConnection} 
                    target={target} 
                    scope={scope}
                    disconnection={disconnection}/>
            </Box>
        </Box>);
    }
}


SemaphoreConnect.propTypes = {};

export default withStyles(styles)(SemaphoreConnect);

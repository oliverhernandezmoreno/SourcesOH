import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import {Box, Grid, Typography} from '@material-ui/core';
import IconTextGrid from '@app/components/utils/IconTextGrid';
import {NotificationsActive, NotificationsOff} from '@material-ui/icons';

const EF_CANONICAL_NAME = 'ef';
const EMAC_CANONICAL_NAME = 'emac';
const EF_EMAC_CANONICAL_NAME = 'ef+emac';

const styles = theme => ({
    alertBox: {
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: theme.palette.primary,
        padding: theme.spacing(2),
        borderRadius: "8px",
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        color: theme.palette.black.main
    }
});

/**
 * A component for rendering a table with total, EF and EMAC counters.
 *
 * @version 1.0.0
 */
class AlertBox extends Component {

    render(){
        const {classes, alertType, selectedProfile, efTotal, emacTotal} = this.props;
        const profile = selectedProfile || EF_EMAC_CANONICAL_NAME;
        const boxStyle = {
            'red-alert': {
                label: 'Alertas Rojas',
                bgColor: 'error.main',
                icon: <NotificationsActive/>
            },
            'yellow-alert': {
                label: 'Alertas Amarillas',
                bgColor: 'warning.main',
                icon: <NotificationsActive/>
            },
            'disconnected-alert': {
                label: 'Desconectados del Sitio Público',
                bgColor: 'disabled.main',
                icon:  <NotificationsOff/>
            }
        }

        return (
            <Grid item xs={12} lg={4}>
                <Box bgcolor={boxStyle[alertType].bgColor} className={classes.alertBox}>
                    <Grid container>
                        <Grid item xs={8}>
                            <Box display="flex" alignItems="center" height="100%">
                                <IconTextGrid
                                    icon={boxStyle[alertType].icon}
                                    text={<Typography variant="h5">{boxStyle[alertType].label}</Typography>}/>
                            </Box>
                        </Grid>
                        { profile === EF_EMAC_CANONICAL_NAME ? (<>
                            <Grid item xs={2}>
                                <Box display="flex" justifyContent="flex-end" alignItems="center" height="100%"
                                    fontSize="h2.fontSize" fontWeight="fontWeightBold" lineHeight={0.8}>
                                    <Box borderRight={2} pr={2}>{efTotal + emacTotal}</Box>
                                </Box>
                            </Grid>
                            <Grid item xs={2}>
                                <Box display="flex" flexDirection="column" justifyContent="center"
                                    alignItems="flex-start" height="100%" pl={2}>
                                    <Typography variant="body2">EF: {efTotal}</Typography>
                                    <Typography variant="body2">EMAC: {emacTotal}</Typography>
                                </Box>
                            </Grid></>) :

                            <Grid item xs={4}>
                                <Box display="flex" justifyContent="flex-end" alignItems="center" height="100%"
                                    fontSize="h2.fontSize" fontWeight="fontWeightBold" lineHeight={0.8} pr={2}>
                                    { profile === EF_CANONICAL_NAME ? efTotal : (
                                        profile === EMAC_CANONICAL_NAME ? emacTotal : '')}
                                </Box>
                            </Grid>
                        }
                    </Grid>
                </Box>
            </Grid>
        );
    }
}

export default withStyles(styles)(AlertBox);

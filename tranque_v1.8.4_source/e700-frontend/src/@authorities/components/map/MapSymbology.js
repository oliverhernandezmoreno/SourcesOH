import React, {Component} from 'react';

import { Grid, Typography } from '@material-ui/core';
import {AlertStatusIcon} from '@authorities/components/AlertStatusIcon';
import IconTextGrid from '@app/components/utils/IconTextGrid';

import { NO_ALERT_COLOR, YELLOW_ALERT_COLOR, RED_ALERT_COLOR, DISCONNECTED_ALERT_COLOR } from '@authorities/constants/alerts';

/**
* A component for rendering the map symbology.
*
* @version 1.0.0
* @author [Natalia Vidal](https://gitlab.com/nattoV)*/
class   MapSymbology extends Component {
    /**
    * Render this component.
    *
    * @public
    */
    render() {
        return (
            <Grid container spacing={3} alignItems='center'>
                <Grid item>
                    <Typography align="left" variant="subtitle2">Simbología:</Typography>
                </Grid>
                <Grid item>
                    <IconTextGrid icon={<AlertStatusIcon marker color={NO_ALERT_COLOR} size="default"/>}
                        text={<Typography variant="body2"> Semáforo sin alertas</Typography>}
                        justify="flex-start"/>
                </Grid>
                <Grid item>
                    <IconTextGrid icon={<AlertStatusIcon marker color={YELLOW_ALERT_COLOR} size="default"/>}
                        text={<Typography variant="body2"> Semáforo con al menos una alerta amarilla</Typography>}
                        justify="flex-start"/>
                </Grid>
                <Grid item>
                    <IconTextGrid icon={<AlertStatusIcon marker color={RED_ALERT_COLOR} size="default"/>}
                        text={<Typography variant="body2"> Semáforo con una alerta roja</Typography>}
                        justify="flex-start"/>
                </Grid>
                <Grid item>
                    <IconTextGrid icon={<AlertStatusIcon marker disconnected color={DISCONNECTED_ALERT_COLOR} size="default"/>}
                        text={<Typography variant="body2"> Semáforo desconectado</Typography>}
                        justify="flex-start"/>
                </Grid>
            </Grid>
        );
    }
}

export default MapSymbology;

import React from 'react';
import { Grid, Tooltip, Typography, withStyles } from '@material-ui/core';
import { COLORS } from '@authorities/theme';
import { NotInterested, Check, Close, Help } from "@material-ui/icons";
import IconTextGrid from '@app/components/utils/IconTextGrid';
import {AlertStatusIcon} from '@authorities/components/AlertStatusIcon';
import {RemoteStatusIcon} from '@authorities/components/RemoteStatusIcon';
import { NO_ALERT_COLOR, YELLOW_ALERT_COLOR, RED_ALERT_COLOR, DISCONNECTED_ALERT_COLOR } from '@authorities/constants/alerts'
import { CONNECTED, FAILED, NOT_IN_SMC } from '@authorities/constants/connectionState'
import TicketTypeIcon from '@alerts_events/components/icons/TicketTypeIcon';
import { A, B, C, D } from '@alerts_events/constants/ticketGroups';


const tooltipStyle = {
    tooltip: {
        maxWidth: 1000,
        backgroundColor: COLORS.white,
        color: COLORS.black,
        border: '1px solid',
        lineHeight: 0
    },
}


/**
* A component for rendering the home tooltip with icon simbology.
*
* @version 1.0.0
* @author [Natalia Vidal](https://gitlab.com/nattoV)
*/
const StyledTooltip = withStyles(tooltipStyle)(Tooltip);

function TSymbology({classes}) {
    return (<StyledTooltip placement="left"
        title={
            <React.Fragment>
                <Grid container direction="column" spacing={1} style={{padding: "20px"}}>
                    <Grid item>
                        <Typography align="left" variant="subtitle2">Estados del Sémaforo Comunidad (sitio público)</Typography>
                    </Grid>
                    <Grid item>
                        <IconTextGrid icon={<AlertStatusIcon color={RED_ALERT_COLOR} size="default"/>}
                            text={<Typography variant="body2"> Estado asociado a la existencia de almenos una alerta roja</Typography>}
                            justify="flex-start"/>
                    </Grid>
                    <Grid item>
                        <IconTextGrid icon={<AlertStatusIcon color={YELLOW_ALERT_COLOR} size="default"/>}
                            text={<Typography variant="body2"> Estado asociado a la existencia de al menos una alerta amarillas y sin alertas rojas</Typography>}
                            justify="flex-start"/>
                    </Grid>
                    <Grid item>
                        <IconTextGrid icon={<AlertStatusIcon color={NO_ALERT_COLOR} size="default"/>}
                            text={<Typography variant="body2">
                                      Estado asociado a la ausencia de alertas amarillas o rojas
                            </Typography>}
                            justify="flex-start"/>
                    </Grid>
                    <Grid item>
                        <IconTextGrid icon={<AlertStatusIcon disconnected color={DISCONNECTED_ALERT_COLOR} size="default"/>}
                            text={<Typography variant="body2"> Semáforo desconectado del sitio público</Typography>}
                            justify="flex-start"/>
                    </Grid>

                    <Grid item><br></br></Grid>

                    <Grid item>
                        <Typography align="left" variant="subtitle2">Tipos de Tickets</Typography>
                    </Grid>
                    <Grid item>
                        <IconTextGrid icon={<TicketTypeIcon group={A} evaluable twoRows/>}
                            text={<Typography variant="body2"> Tickets Grupo A</Typography>}
                            justify="flex-start"/>
                    </Grid>
                    <Grid item>
                        <IconTextGrid icon={<TicketTypeIcon group={B} evaluable twoRows/>}
                            text={<Typography variant="body2"> Tickets Grupo B</Typography>}
                            justify="flex-start"/>
                    </Grid>
                    <Grid item>
                        <IconTextGrid icon={<TicketTypeIcon group={C} evaluable twoRows/>}
                            text={<Typography variant="body2"> Tickets Grupo C</Typography>}
                            justify="flex-start"/>
                    </Grid>
                    <Grid item>
                        <IconTextGrid icon={<TicketTypeIcon group={D} evaluable twoRows/>}
                            text={<Typography variant="body2"> Tickets Grupo D</Typography>}
                            justify="flex-start"/>
                    </Grid>

                    <Grid item><br></br></Grid>

                    <Grid item>
                        <Typography align="left" variant="subtitle2">Estado de índices</Typography>
                    </Grid>
                    <Grid item>
                        <IconTextGrid icon={<Check style={{color: COLORS.success.main}}/>}
                            text={<Typography variant="body2"> Índice no afectado</Typography>}
                            justify="flex-start"/>
                    </Grid>
                    <Grid item>
                        <IconTextGrid icon={<Close style={{color: COLORS.error.main}}/>}
                            text={<Typography variant="body2"> Índice afectado</Typography>}
                            justify="flex-start"/>
                    </Grid>
                    <Grid item>
                        <IconTextGrid icon={<NotInterested style={{color: COLORS.disabled.main}}/>}
                            text={<Typography variant="body2"> Índice no configurado</Typography>}
                            justify="flex-start"/>
                    </Grid>

                    <Grid item><br></br></Grid>

                    <Grid item>
                        <Typography align="left" variant="subtitle2">Estado de conexión con SML</Typography>
                    </Grid>
                    <Grid item>
                        <IconTextGrid icon={<RemoteStatusIcon status={CONNECTED} size="default"/>}
                            text={<Typography variant="body2"> Depósito integrado con SML con conexión normal</Typography>}
                            justify="flex-start"/>
                    </Grid>
                    <Grid item>
                        <IconTextGrid icon={<RemoteStatusIcon status={FAILED} size="default"/>}
                            text={<Typography variant="body2"> Depósito integrado con SML con conexión fallida (sin conexión en 1 hora desde servidor de minera)
                            </Typography>}
                            justify="flex-start"/>
                    </Grid>
                    <Grid item>
                        <IconTextGrid icon={<RemoteStatusIcon status={NOT_IN_SMC} size="default"/>}
                            text={<Typography variant="body2"> Depósito no integrado con SML</Typography>}
                            justify="flex-start"/>
                    </Grid>
                </Grid>
            </React.Fragment>
        }>
        <div style={{ float: "left"}}>
            <IconTextGrid
                icon={<Help fontSize="small"/>}
                text={<Typography variant="body2">Simbología</Typography>} />
        </div>
    </StyledTooltip>);
}


export default TSymbology;

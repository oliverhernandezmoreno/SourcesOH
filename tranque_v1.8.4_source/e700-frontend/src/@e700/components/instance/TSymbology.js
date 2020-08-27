import React from 'react';

import { Grid, Tooltip, Typography } from '@material-ui/core';
import { withStyles } from "@material-ui/core/styles";
import {Cancel,
    CancelScheduleSend,
    CheckCircleOutline,
    DoneAll,
    Done,
    Edit,
    Help,
    HourglassEmpty,
    HourglassFull,
    Save,
    SkipNext,
    SkipPrevious} from '@material-ui/icons';
import IconTextGrid from '@app/components/utils/IconTextGrid';
import theme from '@e700/theme';

const tooltipStyle = {
    tooltip: {
        maxWidth: 1000,
        backgroundColor: theme.palette.primary.main,
        border: '1px solid'
    },
}

const StyledTooltip = withStyles(tooltipStyle)(Tooltip);

function TSymbology({classes}) {
    return (<StyledTooltip placement="left"
        title={
            <React.Fragment>
                <Grid container direction="column" spacing={1} style={{padding: "20px"}}>
                    <Grid item>
                        <Typography align="left" variant="subtitle2" style={{fontWeight: 'bold'}}>Simbología</Typography>
                    </Grid>
                    <Grid item>
                        <IconTextGrid icon={<Edit />}
                            text={<Typography variant="body2"> Nuevo Formulario</Typography>}
                            justify="flex-start"/>
                    </Grid>
                    <Grid item>
                        <IconTextGrid icon={<Save />}
                            text={<Typography variant="body2"> Continuar edición de Formulario</Typography>}
                            justify="flex-start"/>
                    </Grid>
                    <Grid item>
                        <IconTextGrid icon={<HourglassEmpty />}
                            text={<Typography variant="body2"> Formulario esperando validación de Minera 2</Typography>}
                            justify="flex-start"/>
                    </Grid>
                    <Grid item>
                        <IconTextGrid icon={<HourglassFull />}
                            text={<Typography variant="body2"> Formulario esperando envío de Minera 3</Typography>}
                            justify="flex-start"/>
                    </Grid>
                    <Grid item>
                        <IconTextGrid icon={<CancelScheduleSend />}
                            text={<Typography variant="body2"> Formulario pendiente de envío</Typography>}
                            justify="flex-start"/>
                    </Grid>
                    <Grid item>
                        <IconTextGrid icon={<Done />}
                            text={<Typography variant="body2"> Formulario enviado a SERNAGEOMIN</Typography>}
                            justify="flex-start"/>
                    </Grid>
                    <Grid item>
                        <IconTextGrid icon={<DoneAll />}
                            text={<Typography variant="body2"> Formulario revisado por SERNAGEOMIN</Typography>}
                            justify="flex-start"/>
                    </Grid>
                    <Grid item>
                        <IconTextGrid icon={<SkipNext />}
                            text={<Typography variant="body2"> Edición de formulario enviada</Typography>}
                            justify="flex-start"/>
                    </Grid>
                    <Grid item>
                        <IconTextGrid icon={<Cancel />}
                            text={<Typography variant="body2"> Edición de formulario rechazada</Typography>}
                            justify="flex-start"/>
                    </Grid>
                    <Grid item>
                        <IconTextGrid icon={<CheckCircleOutline />}
                            text={<Typography variant="body2"> Edición de formulario aceptada</Typography>}
                            justify="flex-start"/>
                    </Grid>
                    <Grid item>
                        <IconTextGrid icon={<SkipPrevious />}
                            text={<Typography variant="body2"> Chequear formulario</Typography>}
                            justify="flex-start"/>
                    </Grid>
                </Grid>
            </React.Fragment>
        }>
        <div style={{ float: "left"}}>
            <IconTextGrid icon={<Help fontSize="small"/>} text={<Typography variant="body2" style={{fontWeight: 'bold'}}>Simbología</Typography>} />
        </div>
    </StyledTooltip>);
}


export default TSymbology;

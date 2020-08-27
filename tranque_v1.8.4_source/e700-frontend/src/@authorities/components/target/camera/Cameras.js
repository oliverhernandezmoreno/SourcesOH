import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import {Box, Typography, Grid, Tooltip} from '@material-ui/core';
import {Videocam, History} from '@material-ui/icons';
import CircularProgress from '@material-ui/core/CircularProgress';
import * as moment from 'moment/moment';
import * as config from '@app/config';

const styles = theme => ({
    warningNoFrameIcon: {
        color: theme.palette.warning.main,
        marginRight: 16
    }
});

const MAX_VIDEOFRAME_LOAD_DELAY_HOURS = 24;

/**
 * A component for rendering cameras.
 *
 * @version 1.0.0
 * @author [Natalia Vidal](https://gitlab.com/nattoV)
 */
class Cameras extends Component {
    /**
    * Render this component.
    *
    * @public
    */
    render() {
        const {target, cameras, videoFrames, classes} = this.props;
        return (
            <Box mt={5}>
                <Box display="flex" alignItems="center">
                    <Typography variant="h6" display="inline">Cámaras presentes en el depósito</Typography>
                    <Videocam style={{marginLeft: 16}} fontSize='default'/>
                </Box>

                {target?.canonical_name && cameras?.length > 0 ?
                    <Grid container spacing={4}>
                        {cameras.map(cam => {
                            // Obtain first video frame of the list, as it is ordered descending
                            const videoFrame = cam.video_frames.length > 0 ? cam.video_frames[0] : null;
                            if (videoFrame){
                                const timeStamp = moment(videoFrame.timestamp).format(config.DATETIME_FORMAT);
                                const frameBlobUrl = videoFrames[videoFrame.id];
                                return (<Grid key={cam.id} item xs={6} style={{marginTop: 16}}>
                                    <Typography variant="body1">{cam.label}</Typography>
                                    {!frameBlobUrl ? <CircularProgress style={{marginLeft: 8}} size="2em"/> : null}
                                    <Box position="relative" width="100%" bgcolor="primary.dark" mt={1}>
                                        {frameBlobUrl ? (<img 
                                            style={{width:"100%"}}
                                            alt={cam.label} 
                                            src={frameBlobUrl}/>) : null}
                                        <Box display="flex" justifyContent="flex-end" alignItems="center"
                                            position="absolute" width="100%" bottom={0}
                                            bgcolor="primary.dark" color="white"
                                            px={2}>
                                            {moment().diff(moment(videoFrame.timestamp), 'hours') > MAX_VIDEOFRAME_LOAD_DELAY_HOURS ? 
                                                <Tooltip title={`Existe un retraso de más de ${MAX_VIDEOFRAME_LOAD_DELAY_HOURS} horas en la obtención de imágenes`} placement="left">
                                                    <History className={classes.warningNoFrameIcon}/>
                                                </Tooltip> : null}
                                            <Typography display="inline" variant="h5">
                                                {timeStamp}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>);
                            } else {
                                return (<Grid key={cam.id} item xs={6} style={{marginTop: 16}}>
                                    <Box display="flex" flexDirection="column" height="100%">
                                        <Typography variant="body1">{cam.label}</Typography>
                                        <Box display="flex" justifyContent="center" alignItems="center" 
                                            flexGrow={1} width="100%" bgcolor="primary.dark" mt={1} px={4}>
                                            <Typography display="inline" variant="h6">Aún no se han cargado imágenes para esta cámara</Typography>
                                        </Box>
                                    </Box>
                                </Grid>);
                            }
                            
                        })}
                    </Grid>
                    : 
                    <Box my={2}>
                        <Typography variant="body1">Este depósito de relaves no cuenta con cámaras configuradas</Typography>
                    </Box>
                }
            </Box>
        );
    }
}


export default withStyles(styles)(Cameras);

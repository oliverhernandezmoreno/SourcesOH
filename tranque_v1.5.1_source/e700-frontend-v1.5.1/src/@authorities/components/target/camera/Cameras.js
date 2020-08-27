import React, {Component} from 'react';

import {withStyles} from '@material-ui/core/styles';
import {Typography, Grid} from '@material-ui/core';
import {PhotoCamera} from '@material-ui/icons';

const styles = theme => ({
    container: {
        padding: 30
    }
});

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
        return (
            <Grid container direction='column' spacing={2} alignItems='center' className={this.props.classes.container}>
                <Grid item><Typography align='center' variant="h5">No hay cámaras disponibles</Typography></Grid>
                <Grid item><PhotoCamera fontSize='large'/></Grid>
            </Grid>
        );
    }
}


export default withStyles(styles)(Cameras);

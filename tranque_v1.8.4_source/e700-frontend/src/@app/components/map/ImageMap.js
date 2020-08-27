import React, {Component} from 'react';
import {Typography, Grid, CircularProgress, withStyles} from '@material-ui/core';


const styles = theme => ({
    map: {
        padding: 20
    },
    title: {
        paddingBottom: 12
    },
    spinner: {
        color: '#C0C0C0'
    }
});


class ImageMap extends Component {

    render() {
        const {classes, name, width, imageUrl, imageName, imageWidth, imageHeight, loading} = this.props;
        let widthDisplayed;
        let heightDisplayed;
        if (imageWidth > width) {
            widthDisplayed = width;
            heightDisplayed = parseFloat(width * imageHeight)/imageWidth;
        }
        else {
            widthDisplayed = imageWidth;
            heightDisplayed = imageHeight;
        }
        return <div className={classes.map}>
            <Typography className={classes.title} variant="subtitle1">{name}</Typography>
            {
                loading ? <Grid container justify='center'>
                    <Grid item><CircularProgress className={classes.spinner}/></Grid>
                </Grid> :
                    (
                        imageUrl === '' || imageUrl === null || !imageUrl ? 'Imagen no disponible'
                            : <img src={imageUrl} alt={imageName} width={widthDisplayed} height={heightDisplayed}/>
                    )
            }
        </div>;
    }
}

export default withStyles(styles)(ImageMap);

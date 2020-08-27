import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {Typography} from '@material-ui/core';


const styles = theme => ({
    container:{
        height: '100%',
        borderRadius: '0px',
        textAlign: 'center',
        paddingTop: '5%',
        paddingBottom: '5%',
    },
    content: {
        maxWidth: '700px',
        margin: '0 auto',
        padding: '0px 40px',
    },
    media: {
        height: 150,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        marginTop: '30px',
        marginBottom: '30px',
    },
    typography:{
        fontSize: '26px',
        color: '#FFFFFF',
        fontFamily: 'Open Sans, sans-serif',
        fontWeight: 'bold',
    },
    description: {
        fontFamily: 'Open Sans, sans-serif',
        color: '#FFFFFF',
        fontSize: '20px',
        textAlign: 'left',
    },
    button: {
        background: '#575757',
        width: '100%',
        height: '55px',
        marginTop: '10px',
        marginBottom: '30px',
    },
    buscar: {
        fontFamily: 'Open Sans, sans-serif',
        color: '#FFFFFF',
        textTransform: 'none',
        fontSize: '20px',
        fontWeight: 'bold'
    },
});


class InfoCard extends Component{

    render(){
        const { classes, description, image, title } = this.props;
        if (!description || description === undefined || description.trim() === '') return '';
        return (
            <div className={classes.container}>
                <div className={classes.content}>
                    <Typography gutterBottom variant="h5" component="h4" className={classes.typography} >
                        {title}
                    </Typography>
                    {image ? <img className={classes.media} src={'/'+ image} alt={image} /> : ''}
                    <Typography component="p" className={classes.description}>
                        {description}
                    </Typography>

                </div>
            </div>
        );
    }

}

InfoCard.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(InfoCard);

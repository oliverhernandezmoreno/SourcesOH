import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Setting from '@material-ui/icons/Settings';

const styles = {
    root: {
        width: '100%',
        height: '70px',
        backgroundColor: '#323232'
    },

    index: {
        height: '100%',
        width: '40%',
        display: 'inline-block',
        verticalAlign: 'top',
        position: 'relative'
    },

    index__text: {
        fontSize: '1.2vw',
        color: '#ffffff',
        position: 'relative',
        top: '50%',
        left: '60%',
        transform: 'translate(-50%, -50%)'
    },


    alarm: {
        height: '100%',
        width: '60%',
        display: 'inline-block',
        verticalAlign: 'top',
        position: 'relative'
    },


    alarm_type: {
        width: '460px',
        borderRadius: '20px',
        background: '#FEFFB9',
        color: '#000000',
        top: '50%',
        left: '30%',
        transform: 'translate(-50%, -50%)',
        fontSize: '1vw'
    }

};

/**
 * This class is label with a custom information.
 *
 * @param {props} the input properties
 * @public
 */
const CardIndexes = (props) => {

    const generateError = (obj) => {
        if (obj === undefined) {
            return (<Typography className={classes.index__text}>Nan</Typography>);
        }
    };

    const AlertMenssage = 'En fase de calibración del sistema ';
    const {classes} = props;

    return (
        <Card className={classes.root}>
            <div className={classes.index}>
                {generateError(props.title)}
                <Typography className={classes.index__text}>
                    {props.title}
                </Typography>
            </div>
            <div className={classes.alarm}>
                {(props.data) ?
                    (<Avatar className={classes.alarm_type}><Setting/>{AlertMenssage}</Avatar>) : null}
            </div>
        </Card>
    );
};

CardIndexes.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CardIndexes);

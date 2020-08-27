import React from 'react';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Help from '@material-ui/icons/Help';

const styles = theme => ({

    build: {
        color: '#464646',
        backgroundColor: '#262629',
        width: '30px',
        height: '30px'
    },

    button__build: {
        position: 'absolute',
        top: '50%',
        left: '60%',
        transform: 'translate(-50%, -50%)'
    }

});

/**
 * This class is a icon help button.
 *
 * @param {props} the input properties
 * @public
 */
const IconHelp = (props) => {
    const {classes} = props;

    return (
        <div>
            <Button className={classes.button__build}>
                <Help className={classes.build}/>
            </Button>
        </div>
    );

};

IconHelp.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(IconHelp);

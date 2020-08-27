import React, {Component} from 'react';
import Avatar from '@material-ui/core/Avatar';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';

const styles = theme => ({

    root: {
        // position: 'absolute',
        // left: '10%',
        // top: '30%'

    },

    low__threshold: {
        color: '#fff',
        backgroundColor: '#38E47B',
        width: '12px',
        height: '12px'
    },

    over__threshold: {
        color: '#fff',
        backgroundColor: '#FDFF3F',
        width: '12px',
        height: '12px'

    },

    without__threshold: {
        color: '#ffffff',
        backgroundColor: '#D3D3D3',
        width: '12px',
        height: '12px'

    }

});

class IconStatus extends Component {
    render(props) {
        const {classes} = this.props;
        let status;
        if (this.props.value !== undefined && this.props.threshold !== undefined
            && this.props.threshold !== null)
        {if (parseFloat(this.props.value) <= parseFloat(this.props.threshold)) {
            status = <Avatar className={classes.low__threshold}/>;
        } else {
            status = <Avatar className={classes.over__threshold}/>;
        }
        } else {
            status = <Avatar className={classes.without__threshold}/>;
        }
        return (
            <div className={classes.root}>
                {status}
            </div>
        );
    }
}

IconStatus.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(IconStatus);

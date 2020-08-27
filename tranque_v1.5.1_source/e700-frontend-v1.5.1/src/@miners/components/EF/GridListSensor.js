import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import IconStatus from '@miners/components/EF/IconStatus';
import {connect} from 'react-redux';

const styles = theme => ({

    list__chips:{
        display:"flex",
        justifyContent: 'flex-start',
        flexWrap:'wrap'
    },

    text__font: {
        fontSize: '0.8vw',
        color: '#ffffff',
    },

    loading: {
        color: 'whiteSmoke',
        marginLeft:'125px'
    },

});

class GridListSensor extends Component {

    renderChips(values) {
        if (typeof values === 'undefined') {
            return null;
        }

        return values.map((obj, i) => {
            return (
                <div key={i} style={{margin:'3px'}}>
                    <Chip
                        icon={<IconStatus
                            className={this.props.classes.iconStatus}
                            value={obj.values}
                            threshold={obj.threshold}
                            mode="threshold"/>
                        }
                        clickable={false}
                        label={
                            <Typography
                                className={this.props.classes.text__font}
                                variant='body1'
                                color='primary'>
                                {obj.name}
                            </Typography>}
                        style={{padding:"10px",
                            backgroundColor: '#323232'}}

                    />
                </div>
            );
        });
    }

    render(props) {
        const {classes} = this.props;
        return (
            <div>
                <div className={classes.list__chips}>
                    {this.renderChips(this.props.values)}
                </div>
            </div>
        );
    }
}

GridListSensor.propTypes = {
    classes: PropTypes.object.isRequired
};
export default withStyles(styles)(connect()(GridListSensor));

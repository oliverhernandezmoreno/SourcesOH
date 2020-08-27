import React, {Component} from 'react';
import MonitoringTableContainer from './MonitoringTableContainer';
import {withStyles} from '@material-ui/core/styles';


const styles = theme => ({
    title: {
        padding: 10
    }
});

/**
 * A component for rendering the home page for authorities.
 *
 * @version 1.0.0
 * @author [Natalia Vidal](https://gitlab.com/nattoV)
 */
class Home extends Component {
    /**
     * Render this component.
     *
     * @public
     */
    render() {
        return (
            <React.Fragment>
                <MonitoringTableContainer/>
            </React.Fragment>
        );
    }
}

export default withStyles(styles)(Home);

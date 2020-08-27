import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {Button, Card, CardContent, Grid, Typography} from '@material-ui/core';

import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import {withStyles} from '@material-ui/core/styles';

const styles = theme => ({
    typography: {
        fontWeight: 'bold'
    }
});

/**
 * A component for rendering a table with some alert records (Alert History)
 * and a button to show all the rest of the records.
 *
 * @version 1.0.0
 * @author [Natalia Vidal](https://gitlab.com/nattoV)
 */
class Record extends Component {

    /**
    * Render this component.
    *
    * @public
    */
    render() {
        return (<Card>
            <CardContent>
                <Typography variant='h6' className={this.props.classes.typography} color='primary'>{this.props.title}</Typography>
                <br></br>
                {this.props.table}
                <br></br>
                <Grid container justify = "center">
                    <Button variant="outlined" color="primary">
                        <ArrowForwardIcon/> {this.props.buttonText}
                    </Button>
                </Grid>
            </CardContent>
        </Card>
        );
    }
}

Record.propTypes = {
    title: PropTypes.string.isRequired,
    table: PropTypes.object.isRequired,
    buttonText: PropTypes.string
};


export default withStyles(styles)(Record);

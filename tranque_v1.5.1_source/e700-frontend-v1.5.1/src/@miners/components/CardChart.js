import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
//import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
//import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Chart from '@miners/components/chart';

const styles = {
    card: {
        width: '95%',
        height: '80%',
        backgroundColor: '#464646',
        marginTop: 30
    },

    indextext1: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#FFFFFF'
    }

};

const CardChart = (props) => {
    const {classes} = props;
    return (
        <Card className={classes.card}>
            <CardContent>
                <Typography className={classes.indextext1}>
                    {props.name}
                </Typography>
            </CardContent>
            <Chart data={props.data} threshold={props.threshold} units={props.units}/>
        </Card>
    );
};

CardChart.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CardChart);

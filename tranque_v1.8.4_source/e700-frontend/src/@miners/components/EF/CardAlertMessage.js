import React,{ Component } from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Error from '@material-ui/icons/Error';

const styles = theme => ({
    card:{
        margin: "5px"
    },
    errorContent:{
        display:"flex",
        alignItems:"center",
        padding: theme.spacing(1),
        border: '2px #fdff3f solid',
        borderRadius: '5px',
    },
    errorText:{
        marginLeft:"15px",
        fontSize: 18,
        textAlign:"center",
        fontWeight: "bold",
    },

    errorIcon: {
        color: '#fdff3f'
    },
});

class CardAlertMessage extends Component{
    render(){
        const {classes} = this.props;
        const ALERT = <Typography
            component={'span'}
            variant={'body2'}
            className={classes.errorText}>
        Por motivos técnicos, no fue posible registrar la inspección.
        Por favor inténtalo más tarde</Typography>;
        return(
            <Card className={classes.card}>
                <CardContent>
                    <div className={classes.errorContent}>
                        <Error className={classes.errorIcon} fontSize="large"/>
                        {ALERT}
                    </div>
                </CardContent>
            </Card>
        );
    }
}

CardAlertMessage.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CardAlertMessage);

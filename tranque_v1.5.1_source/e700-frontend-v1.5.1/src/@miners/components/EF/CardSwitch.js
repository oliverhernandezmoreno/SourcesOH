import React,{ Component } from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
    label:{
        marginTop:"5px",
        fontSize: 18,
        fontWeight: "bold"
    },

    text:{
        marginTop:"5px",
        margin:"30px",
        fontSize: 18,
        textAlign:"justify"
    },

    card:{
        margin: "8px"
    },

    alert:{
        marginTop:"10px",
        margin:"60px",
        fontSize: 18,
        textAlign:"justify",
        padding:"5px",
        fontWeight: "bold"
    },
});

class CardSwitch extends Component{

    render(){
        const {group,values,answers,handleChange,classes} = this.props;
        const ALERT1 = "This component has not received times series canonical name and/or times series name!";
        const ALERT2 = "This component has not received times series description!";

        const canonicalName = values.canonical_name !== undefined? true: false;
        const name = values.name !== undefined? true: false;

        return(
            canonicalName && name ?
                <Card className={classes.card}>
                    <FormControlLabel style={{margin:"10px"}}
                        control={
                            <Switch
                                checked={answers[values.canonical_name]}
                                onChange={handleChange(group, values.canonical_name)}/>}
                        label={
                            <Typography className={classes.label}>
                                {values.name}
                            </Typography>}/>
                    <CardContent>
                        <Typography className={classes.text}>
                            {values.description !== undefined? values.description: ALERT2}
                        </Typography>
                    </CardContent>
                </Card>:
                <Card className={classes.card}>
                    <Typography className={classes.alert}>{ALERT1}</Typography>
                </Card>
        );
    }
}

CardSwitch.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CardSwitch);

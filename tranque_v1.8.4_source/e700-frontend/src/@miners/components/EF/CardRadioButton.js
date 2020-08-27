import React,{ Component } from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

const styles = theme => ({

    root: {
        color: "#fafafa",
        '&$checked': {
            color: "#e0e0e0",
        },
    },

    checked: {},

    label:{
        marginTop:"10px",
        marginLeft:"45px",
        fontSize: 18,
        fontWeight: "bold"
    },

    text:{
        marginTop:"5px",
        margin:"30px",
        fontSize: 18,
        textAlign:"justify"
    },

    options:{
        display:"flex",
        alignItems:"center",
        marginLeft:"45px",
        marginBottom:"20px",
        color: "white"
    },

    bottonSection:{
        marginLeft: "25px",
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

class CardRadioButton extends Component{
    render(){
        const {group,values,answers,handleChangeEvents,classes} = this.props;
        const ALERT1 = "This component has not received times series canonical name and/or times series name!";
        const ALERT2 = "This component has not received times series description!";
        const TEXT = "Reportar como:";
        const canonicalName = values.canonical_name !== undefined? true: false;
        const name = values.name !== undefined? true: false

        return(
            canonicalName && name ?
                <Card className={classes.card}>
                    <Typography className={classes.label}>
                        {values.name !== undefined? values.name: ALERT2}
                    </Typography>
                    <CardContent>
                        <Typography className={classes.text}>
                            {values.description !== undefined? values.description: ALERT2}
                        </Typography>
                    </CardContent>
                    <div className={classes.options}>
                        <FormLabel>{TEXT}</FormLabel>
                        <FormControl>
                            <RadioGroup
                                value={answers[values.canonical_name].toString()}
                                onChange={handleChangeEvents(group,values.canonical_name)}
                                className={classes.bottonSection}
                                row>
                                {values.choices.slice(0).reverse().map((e,i) =>
                                    <FormControlLabel key={i}
                                        value={e.value.choiceValue.toString()}
                                        control={<Radio classes={{
                                            root: classes.root,
                                            checked: classes.checked,
                                        }}/>}
                                        label={(e.value.choiceValue === 0? "Sin incidentes":
                                            e.value.choiceValue === 1? "Incidente Importante":
                                                e.value.choiceValue === 2? "Incidente grave": "Serie de tiempo sin eventos")}
                                    />)}
                            </RadioGroup>
                        </FormControl>
                    </div>
                </Card>:
                <Card className={classes.card}>
                    <Typography className={classes.alert}>{ALERT1}</Typography>
                </Card>
        );
    }
}

CardRadioButton.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CardRadioButton);

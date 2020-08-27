import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';

import Card from '@material-ui/core/Card';
import CardSwitch from '@miners/components/EF/CardSwitch.js';
import CardRadioButton from '@miners/components/EF/CardRadioButton.js';
import Typography from '@material-ui/core/Typography';
import seriesWithSelectEvent from '@miners/components/EF/seriesWithSelectEvent'


const styles = theme => ({

    card:{
        margin: "8px"
    },

    alert:{
        margin:"20px",
        fontSize: 18,
        textAlign:"center",
        padding:"5px",
        fontWeight: "bold"
    },
    titleText:{
        marginTop:"30px",
        marginLeft:"10px",
        fontSize:20,
        fontWeight: "bold"
    },
});

function CardSwitchGroup(props){
    const {items,answers,answersEvents,group,handleChange,handleChangeEvents,classes} = props;
    const loadData = items !== undefined;
    const answersFileLog = answers !== undefined;
    const ALERT1 = "This component did not receive data from the backend ";
    const ALERT2 = "This component did not receive answer dictionary";

    let EventType="";

    switch (group){
        case "m1-triggers":
            EventType ="Eventos"
            break
        case "m1-important-triggers":
            EventType ="Eventos Importantes"
            break
        case "m1-critical-triggers":
            EventType ="Eventos Críticos"
            break
        case "m1-forecasts-triggers":
            EventType ="Pronóstico Climatológico"
            break
        case "m1-design":
            EventType ="Diseño"
            break
        default:
            EventType ="Eventos"
    }
    return(
        <div>
            <Typography className={classes.titleText}>
                {EventType}
            </Typography>
            {loadData && answersFileLog ?
                items.map((values,id) =>{
                    const check = seriesWithSelectEvent.find(e => e === values.template_name)
                    return check !== undefined?
                        <CardRadioButton key={id}
                            group={group}
                            values={values}
                            answers={answersEvents}
                            handleChangeEvents={handleChangeEvents}
                        />:
                        <CardSwitch key={id}
                            group={group}
                            values={values}
                            answers={answers}
                            handleChange={handleChange}
                        />
                }):
                loadData === false ?
                    <Card className={classes.card}>
                        <Typography className={classes.alert}>
                            {ALERT1}
                        </Typography>
                    </Card>:
                    answersFileLog === false ?
                        <Card className={classes.card}>
                            <Typography className={classes.alert}>
                                {ALERT2}
                            </Typography>
                        </Card>: null
            }
        </div>
    );
}
CardSwitchGroup.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CardSwitchGroup);

import React from 'react';
import { Typography, withStyles } from '@material-ui/core';
import IconTextGrid from '@app/components/utils/IconTextGrid';
import ConditionIcon from '@alerts_events/components/icons/ConditionIcon';
import { spanishAction } from '@alerts_events/constants/userActions';


const styles = theme => ({
    container: {
        margin: 10,
        marginTop: 20,
        padding: 10,
        border: 1,
        borderStyle: 'dashed',
        borderRadius: 5
    },
    title: {
        paddingBottom: 10
    }
});


const Conditions = ({conditions, type, classes, ticket, user}) => {
    if ((conditions && conditions.length !== 0)) {
        return (<div className={classes.container}>
            <Typography variant='h6' className={classes.title}>
                Condiciones para {spanishAction(type, ticket)} este ticket
            </Typography>
            {
                conditions.filter(cond =>
                    !(
                        cond.required_by &&
                        cond.required_by !== '__all__' &&
                        !cond.required_by.some(g => user.groups.includes(g))
                    )
                ).map((cond, index) =>
                    <IconTextGrid key={index}
                        icon={<ConditionIcon state={cond.complete}/>} text={cond.description}/>
                )
            }
        </div>);
    }
    else return <br></br>;
}

export default withStyles(styles)(Conditions);
import React, {Component} from 'react';
import { Grid, Paper, Typography, withStyles } from '@material-ui/core';
import TicketTypeIcon from '@alerts_events/components/icons/TicketTypeIcon';
import ConditionIcon from '@alerts_events/components/icons/ConditionIcon';
import StateIcon from '@alerts_events/components/icons/StateIcon';
import { CLOSED, getGroup, A, isAlert } from '@alerts_events/constants/ticketGroups';
import { getTitle } from '@alerts_events/constants/ticketReasons';
import { isMiner } from '@app/services/userType';

const styles = theme => ({
    paper: {
        padding: 10,
        width: '100%'
    },
    stateIcon: {
        width: 25
    },
    typeIcon: {
        width: 200,
        marginLeft: 20
    },
    conditions: {
        textAlign: 'right'
    }
});

class ChildTicketView extends Component {

    render() {
        const {classes, ticket, user} = this.props;
        const group = getGroup(ticket);
        const title = getTitle(ticket);
        return (
            <Paper className={classes.paper}>
                <Grid container spacing={1} alignItems='center'>
                    <Grid item className={classes.stateIcon}>
                        <StateIcon ticket={ticket}/>
                    </Grid>
                    <Grid item className={classes.typeIcon}>
                        <TicketTypeIcon
                            reported={group !== A && !isAlert(group) && isMiner(user)}
                            group={group}
                            archived={ticket.archived}
                            evaluable={ticket.evaluable}
                            state={ticket.state}
                        />
                    </Grid>
                    <Grid item xs>
                        <Typography noWrap color="textSecondary">
                            {
                                ticket.state === CLOSED ?
                                    <strike> ID {ticket.id}</strike> :
                                    'ID ' + ticket.id
                            }

                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        {
                            ticket.state === CLOSED ?
                                <strike>{title}</strike> :
                                title
                        }
                    </Grid>
                    <Grid item xs className={classes.conditions}>
                        {
                            ticket.close_conditions.map((cond, index) =>
                                <ConditionIcon state={cond.complete} key={index}/>)
                        }
                    </Grid>
                </Grid>
            </Paper>
        );
    }
}




export default withStyles(styles)(ChildTicketView);
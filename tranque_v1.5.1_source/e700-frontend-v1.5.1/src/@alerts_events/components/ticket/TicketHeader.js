import React from 'react';
import { Grid, Typography, withStyles } from '@material-ui/core';
import TicketTypeIcon from '@alerts_events/components/icons/TicketTypeIcon';
import StateIcon from '@alerts_events/components/icons/StateIcon';
import { getGroup, A, isAlert } from '@alerts_events/constants/ticketGroups';

const styles = theme => ({
    ticketHeader: {
        marginLeft: '-30px',
        paddingBottom: 15
    },
    groupIcon: {
        marginLeft: 27
    },
    stateIcon: {
        width: 140,
        textAlign: 'center'
    }
});

const TicketHeader = ({ticket, classes}) => {
    const group = getGroup(ticket);
    return (
        <Grid container alignItems='center' direction="row" spacing={1} className={classes.ticketHeader}>
            <Grid item xs={4} sm={5} className={classes.groupIcon}>
                <TicketTypeIcon showLabels
                    reported={group !== A && !isAlert(group)}
                    group={group}
                    archived={ticket.archived}
                    evaluable={ticket.evaluable}
                    state={ticket.state}
                />
            </Grid>
            <Grid item xs sm>
                <StateIcon ticket={ticket} labeled/>
            </Grid>
            <Grid item xs sm>
                <Typography align="right" color="textSecondary">
                ID: {ticket.id}
                </Typography>
            </Grid>
            <Grid item xs sm>
                <Typography align="right" color="textSecondary">
                    {ticket.created_at && ticket.created_at.format('lll')}
                </Typography>
            </Grid>
        </Grid>
    )};

export default withStyles(styles)(TicketHeader);
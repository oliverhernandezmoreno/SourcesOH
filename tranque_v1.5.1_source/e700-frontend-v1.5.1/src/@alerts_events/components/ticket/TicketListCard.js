import React, {Component} from 'react';
import { Card, CardContent, Divider, Typography, withStyles } from '@material-ui/core';
import { CheckCircle, CheckCircleOutlined, RemoveCircleOutline,
    FilterNone, PauseCircleOutline, Build } from '@material-ui/icons';
import TicketHeader from '@alerts_events/components/ticket/TicketHeader';
import { CLOSED } from '@alerts_events/constants/ticketGroups';
import StateIcon from '@alerts_events/components/icons/StateIcon';


const styles = (theme) => ({
    card: {
        marginTop: '20px'
    },
    cardContent: {
        paddingLeft: '40px',
    },
    divider: {
        backgroundColor: theme.palette.background.default,
        margin: '10px -16px 10px -40px'
    },
    ticket: {
        '& svg': {
            verticalAlign: 'bottom'
        }
    },
    notActive: {
        verticalAlign: 'bottom'
    }
});



class TicketListCard extends Component {

    getStateRow() {
        const {ticket, classes} = this.props;
        if (ticket.state === CLOSED) {
            return<><CheckCircle className={classes.notActive} /> Cerrado el [fecha].</>;
        }
        if (ticket.archived) {
            return <><PauseCircleOutline className={classes.notActive} /> Ticket archivado.</>;
        }
        if (!ticket.evaluable) {
            return <><Build className={classes.notActive} /> El sistema no puede evaluar este ticket.</>;
        }
        if (ticket.closable) {
            return <><CheckCircleOutlined className={classes.closable} /> Cumple condiciones de cierre</>;
        }
        return <><RemoveCircleOutline className={classes.notClosable} /> No cumple condiciones de cierre</>;
    }

    render() {
        const {classes, ticket} = this.props;
        const ticketTitle = ticket.state === CLOSED ? <strike>{ticket.name}</strike> : ticket.name;
        return (
            <Card key={ticket.id} variant="outlined" className={classes.card} onClick={() => this.props.onClick()}>
                <CardContent className={classes.cardContent}>

                    <TicketHeader ticket={ticket}/>
                    <Divider className={classes.divider} />

                    <Typography variant="h5">{ticketTitle}</Typography>
                    <Divider className={classes.divider} />

                    <StateIcon ticket={ticket} withDescription/>

                    <Divider className={classes.divider} />

                    <Typography>
                        <FilterNone /> Tickets asociados ({ticket.children.length})
                    </Typography>
                </CardContent>
            </Card>
        )
    }
};

export default withStyles(styles)(TicketListCard);

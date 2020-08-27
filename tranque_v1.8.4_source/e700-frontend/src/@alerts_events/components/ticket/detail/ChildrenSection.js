import React, { Component } from 'react';
import { Typography, Link, List, ListItem, withStyles } from '@material-ui/core';
import ChildTicketView from '@alerts_events/components/ticket/detail/ChildTicketView';
import DashedBox from '@alerts_events/components/DashedBox';
import {reverse} from '@app/urls';


const styles = theme => ({
    title: {
        paddingBottom: 20
    },
    link: {
        width: '100%'
    }
});

class ChildrenSection extends Component {

    onChildClick(child) {
        const {detailRoute} = this.props;
        if (detailRoute) {
            return reverse(detailRoute,
                {target: child.target, ticketId: child.id});
        }
        return null;
    }

    render() {
        const {ticket, classes, user} = this.props;
        return (<>
            <Typography variant='h6' className={classes.title}>
                Tickets asociados
            </Typography>
            <List>
                {
                    ticket.children &&
                    ticket.children.length === 0 ?
                        <ListItem>
                            <DashedBox content='No hay tickets anidados'/>
                        </ListItem>
                        :
                        ticket.children.map((child, index) => (
                            <ListItem key={index}>
                                <Link target="_blank" className={classes.link} href={'#' + this.onChildClick(child)}>
                                    <ChildTicketView ticket={child} user={user}/>
                                </Link>
                            </ListItem>
                        ))
                }
            </List>
        </>);
    }
}

export default withStyles(styles)(ChildrenSection);

import React, { Component } from 'react';
import { Typography, List, ListItem, withStyles } from '@material-ui/core';
import ChildTicketView from '@alerts_events/components/ticket/detail/ChildTicketView';
import DashedBox from '@alerts_events/components/DashedBox';
import {history} from '@app/history';
import {reverse} from '@app/urls';


const styles = theme => ({
    title: {
        paddingBottom: 20
    }
});

class ChildrenSection extends Component {

    onChildClick(child) {
        const {detailRoute} = this.props;
        if (detailRoute) {
            history.push(reverse(detailRoute,
                {target: child.target, ticketId: child.id}));
        }
    }

    render() {
        const {ticket, classes} = this.props;
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
                            <ListItem button key={index} onClick={() => this.onChildClick(child)}>
                                <ChildTicketView ticket={child}/>
                            </ListItem>
                        ))
                }
            </List>
        </>);
    }
}

export default withStyles(styles)(ChildrenSection);

import React, {Component} from 'react';
import {history} from '@app/history';
import {reverse} from '@app/urls';
import {withStyles} from '@material-ui/core';
import {BlueButton} from '@authorities/theme';

const styles = theme => ({
    root: {
        height: '100%'
    },
});

/**
 * A component for rendering a button that handles the update of an alert public message
 */
class UpdatePublicMessageButton extends Component {

    state = {
    };

    handleUpdatePublicMessage() {
        const {scope, target, ticket} = this.props;

        if (ticket){
            history.push(reverse('authorities.target.tickets.'+scope+'.open.detail', {target, ticketId: ticket.id}));
        }else{
            // TODO
        }
    }

    render() {
        const {classes, ticket} = this.props;
        return (<>
            <BlueButton className={classes.root} disableElevation onClick={() => this.handleUpdatePublicMessage()}>
                {ticket ? 'Actualizar mensaje desde ticket' : 'Actualizar mensaje'}
            </BlueButton>
        </>);
    }
}



export default withStyles(styles)(UpdatePublicMessageButton);

import React, {Component} from 'react';
import { Grid, withStyles } from '@material-ui/core';
import ContainedButton from '@app/components/utils/ContainedButton';
import Conditions from '@alerts_events/components/ticket/detail/Conditions';
import RequestButton from '@alerts_events/components/ticket/detail/ActionsSection/RequestButton';
import { getGroup } from '@alerts_events/constants/ticketGroups';
import { spanishAction, canRequest } from '@alerts_events/constants/userActions';

const styles = theme => ({
    actionButton: {
        marginLeft: 10
    }
});


class ActionTab extends Component {

    moreAuthorizationsRequired() {
        const {conditions} = this.props;
        return conditions && conditions.some(cond => cond.authorization && !cond.complete);
    }

    render() {
        const {classes, ticket, user, onTicketUpdate, onRequest, requests,
            type, conditions, to_state, buttonText, requestButtonText, requesting} = this.props;
        const actionVerb = spanishAction(type, ticket);
        const conditionProps = {type, ticket, user, conditions};
        return (<>
            <Conditions {...conditionProps}/>
            <Grid container spacing={1} direction='column'>
                <Grid item>
                    { (canRequest(user, getGroup(ticket), type) && this.moreAuthorizationsRequired()) &&
                        <RequestButton
                            ticket={ticket}
                            text={
                                requestButtonText ||
                                'SOLICITAR AUTORIZACIÓN PARA ' + actionVerb.toUpperCase() + ' TICKET'
                            }
                            onClick={() => onRequest(type, to_state)}
                            requests={requests}
                            requesting={requesting}
                        />
                    }
                </Grid>
                <Grid item className={classes.actionButton}>
                    <ContainedButton
                        text={
                            buttonText ||
                            actionVerb.toUpperCase() + ' TICKET'
                        }
                        buttonProps={{
                            disabled: conditions && conditions.some(cond => !cond.complete),
                            onClick: onTicketUpdate
                        }}
                    />
                </Grid>
            </Grid>
        </>);
    }
}

export default withStyles(styles)(ActionTab);

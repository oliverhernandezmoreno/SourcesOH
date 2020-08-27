import React, {Component} from 'react';
import { withStyles, Typography, Box } from '@material-ui/core';
import { isAlert } from '@alerts_events/constants/ticketGroups';
import IconTextGrid from '@app/components/utils/IconTextGrid';
import { NotificationsActive } from '@material-ui/icons';
import { canRequestEscalate, ESCALATE } from '@alerts_events/constants/userActions';
import ActionTab from '@alerts_events/components/ticket/detail/ActionsSection/ActionTab';


const styles = theme => ({
    container: {
        margin: 10,
        marginTop: 20,
        padding: 10,
        border: '1px solid',
        borderColor: theme.palette.primary.light,
        borderRadius: 5,
    }
});


class ScaleOption extends Component {

    isDisabled(toConditions) {
        return toConditions &&
            toConditions.length !== 0 &&
            toConditions.some(cond => !cond.complete);
    }

    withRequestButton() {
        const {user, group, option} = this.props;
        return canRequestEscalate(user, group, option.value);
    }

    render() {
        const {classes, ticket, option, conditions, group, user,
            onTicketUpdate, onRequest, requests, requesting} = this.props;
        if (!option || option === undefined) return '';
        return (
            <Box className={classes.container}>
                <Typography variant='h6'>
                    {option.label}
                </Typography>
                <Typography>
                    {option.subLabel}
                </Typography>
                <ActionTab
                    ticket={ticket}
                    requests={requests}
                    onRequest={onRequest}
                    requesting={requesting}
                    user={user}
                    type={ESCALATE}
                    to_state={option.value}
                    conditions={conditions[option.value]}
                    onTicketUpdate={() => onTicketUpdate(ticket, {state: option.value})}
                    buttonText={
                        isAlert(group) ?
                            <IconTextGrid
                                text='ACTIVAR ALERTA ROJA'
                                icon={<NotificationsActive/>}/> :
                            'ESCALAR'
                    }
                    requestButtonText={
                        isAlert(group) ?
                            'SOLICITAR AUTORIZACIÓN PARA ACTIVAR ALERTA ROJA' :
                            'SOLICITAR PERMISO PARA ESCALAR'
                    }
                />
            </Box>);
    }
}


export default withStyles(styles)(ScaleOption);

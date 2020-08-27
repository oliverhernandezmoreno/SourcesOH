import React, {Component} from 'react';
import {Typography, Card, CardContent, Grid, Divider, withStyles} from '@material-ui/core';
import IconTextGrid from '@app/components/utils/IconTextGrid';
import {COLORS} from '@miners/theme';
import moment from 'moment';
import { isResolved, getRequestInfo,
    APPROVED, APPROVED_AND_USED, DENIED } from '@alerts_events/constants/authorizationStates';
import { spanishAction } from '@alerts_events/constants/userActions';
import { ThumbUp, ThumbDown } from '@material-ui/icons';
import { getGroup } from '@alerts_events/constants/ticketGroups';
import TicketTypeIcon from '@alerts_events/components/icons/TicketTypeIcon';

const styles = theme => ({
    card: {
        margin: 10
    },
    cardContent: {
        paddingTop: 15,
        "&:last-child": {
            paddingBottom: 15
        }
    },
    acceptedIcon: {
        color: COLORS.states.success
    },
    divider: {
        margin: 15
    }
});


/**
 * A component for rendering an authorization requests card.
 *
 * @version 1.0.0
 * @author [Natalia Vidal](https://gitlab.com/nattoV)
 */
class RequestListCard extends Component {

    getWorkSiteInfo() {
        const {request} = this.props;
        const target = request.ticket.target;
        if (!target) return '';
        const workSites = target.work_sites ? target.work_sites[0] : {entity:{}};
        const entity = workSites.entity.name;
        const work = workSites.name;
        const targetName = target.name;
        return <Typography>{entity} • {targetName} • {work}</Typography>;
    }

    getAnswerVerb(request) {
        if (request.status === APPROVED || request.status === APPROVED_AND_USED) {
            return 'aprobada';
        }
        else if (request.status === DENIED) {
            return 'rechazada';
        }
        else return null;
    }

    render() {
        const {classes, request, onClick} = this.props;
        const {action} = getRequestInfo(request.authorization);
        const ticket = request.ticket;
        const action_verb = spanishAction(action, ticket);
        const answer_verb = this.getAnswerVerb(request);
        const answer_icon =
            (request.status === APPROVED || request.status === APPROVED_AND_USED) ?
                <ThumbUp className={classes.acceptedIcon}/> :
                <ThumbDown color='error'/>;
        return (<div onClick={() => onClick()}>
            <Card key={request.id} className={classes.card}>
                <CardContent className={classes.cardContent}>
                    { isResolved(request) && <>
                        <Grid container justify='space-between' alignItems='center'>
                            <Grid item>
                                <IconTextGrid
                                    icon={answer_icon}
                                    text={<Typography>Solicitud {answer_verb} por <b>{request.resolved_by.username}</b></Typography>}
                                    space={10}
                                />
                            </Grid>
                            <Grid item>
                                <Typography>{moment(request.resolved_at).format('lll')}</Typography>
                            </Grid>
                        </Grid>
                        <Divider className={classes.divider} /></> }

                    <Grid container justify='space-between' alignItems='center'>
                        <Grid item>
                            <Typography>
                                <b>{request.created_by.username}</b> solicita <b>{action_verb}</b> este ticket
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Typography>{moment(request.created_at).format('lll')}</Typography>
                        </Grid>
                    </Grid>

                    <Divider className={classes.divider}/>

                    <Grid container justify='space-between' alignItems='center'>
                        <Grid item>{this.getWorkSiteInfo()}</Grid>
                        <Grid item>
                            <IconTextGrid
                                icon={<TicketTypeIcon
                                    group={getGroup(ticket)}
                                    archived={ticket.archived}
                                    evaluable={ticket.evaluable}
                                />}
                                text={<Typography noWrap>ID: {ticket.id}</Typography>}
                                space={10}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </div>);
    }
}

export default withStyles(styles)(RequestListCard);

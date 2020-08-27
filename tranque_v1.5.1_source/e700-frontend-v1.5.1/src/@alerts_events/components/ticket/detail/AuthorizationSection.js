import React, {Component} from 'react';
import { Typography, Grid, CircularProgress, withStyles } from '@material-ui/core';
import { ThumbUp, ThumbDown } from '@material-ui/icons';
import CommentSection from '@alerts_events/components/ticket/detail/CommentSection';
import { C, D, YELLOW_ALERT, RED_ALERT, groupNames } from '@alerts_events/constants/ticketGroups';
import {COLORS} from '@miners/theme';
import { hasToResolveAuthorization, spanishAction } from '@alerts_events/constants/userActions';
import ContainedButton from '@app/components/utils/ContainedButton';
import {PENDING, APPROVED, APPROVED_AND_USED, getRequestInfo, getSpanishRequestStatus} from '@alerts_events/constants/authorizationStates';
import * as moment from 'moment';
import {DATE_TIME_FORMAT} from '@app/config';


const styles = theme => ({
    buttons: {
        paddingTop: 10
    },
    title: {
        paddingBottom: 8
    },
    section: {
        paddingBottom: 30
    },
    acceptedIcon: {
        color: COLORS.states.success
    },
    resolution: {
        paddingBottom: 10
    }

});

const escalate_messages = {
    [C] : 'Esta acción activará una alerta amarilla que será visible en el sitio público.' +
          ' La gestión de la alerta es exclusiva de la autoridad.',
    [D] : 'Esta acción activará una alerta roja que será visible en el sitio público.' +
          ' La gestión de la alerta es exclusiva de la autoridad.',
    [YELLOW_ALERT]: '',
    [RED_ALERT]: ''
}

export const APPROVING = 'authorizing';
export const DENYING = 'denying';

class AuthorizationSection extends Component {

    state = {
        comment: '',
        files: []
    }

    onChangeComment(content, files, type) {
        this.setState({comment: content, files: files});
    }

    render() {
        const {classes, ticket, user, request, onDownload, onResolve, loadingType} = this.props;
        const {comment, files} = this.state;
        const {action, to_state} = getRequestInfo(request.authorization);
        const petitioner = request.created_by.username;
        const creation_date = moment(request.created_at).format(DATE_TIME_FORMAT).split(',');
        const resolution_date = request.resolved_at && moment(request.resolved_at).format(DATE_TIME_FORMAT).split(',');
        const answerVerb = getSpanishRequestStatus(request);
        const answer_icon = (request.status === APPROVED || request.status === APPROVED_AND_USED) ?
            <ThumbUp className={classes.acceptedIcon}/> :
            <ThumbDown color='error'/>;
        return (<>
            <div className={classes.section}>
                <Typography variant='h6' className={classes.title}>
                    Solicitud
                </Typography>
                <Grid container justify='space-between'>
                    <Grid item>
                        <Typography variant='body1'>
                            {petitioner} solicita autorización para
                            <b>{' ' + spanishAction(action, ticket)}</b> este ticket
                            { to_state ? (<> a <b>{groupNames[to_state]}</b>.</>) : '.' }
                        </Typography>
                    </Grid>
                    <Grid>
                        <Typography variant='body1'>{creation_date}</Typography>
                    </Grid>
                </Grid>
                { to_state && escalate_messages[to_state] }
            </div>

            { request.status !== PENDING ?
                (<div className={classes.section}>
                    <Typography variant='h6' className={classes.title}>
                        Respuesta
                    </Typography>
                    <Grid spacing={2} container className={classes.resolution}>
                        <Grid item>{answer_icon}</Grid>
                        <Grid item>
                            <Typography variant='body1'>
                                { request.resolved_by.username + ' ha ' + answerVerb +
                                ' la solicitud el ' + resolution_date[0] + ' a las ' + resolution_date[1] }
                            </Typography>
                        </Grid>
                    </Grid>
                    <CommentSection
                        ticket={ticket}
                        comments={
                            request.comment || request.documents.length > 0 ? [{
                                id: request.id,
                                content: request.comment,
                                documents: request.documents,
                            }] : []
                        }
                        onDownload={onDownload}
                    />
                </div>) :
                ( hasToResolveAuthorization(user, request.authorization) &&
                    (<>
                        <CommentSection allowNewComments noCommentButton
                            ticket={ticket}
                            currentComment={comment}
                            currentFiles={files}
                            onChangeComment={(c, f, t) => this.onChangeComment(c, f, t)}
                        />

                        <Grid container spacing={2} className={classes.buttons}>
                            <Grid item>
                                <ContainedButton
                                    text='AUTORIZAR'
                                    buttonProps={{
                                        startIcon: loadingType !== APPROVING ? <ThumbUp/> : <CircularProgress size={20}/>,
                                        onClick: () => onResolve(request.id, true, comment, files),
                                        disabled: loadingType !== null
                                    }}
                                />
                            </Grid>
                            <Grid item>
                                <ContainedButton
                                    text='RECHAZAR'
                                    buttonProps={{
                                        startIcon: loadingType !== DENYING ? <ThumbDown/> : <CircularProgress size={20}/>,
                                        onClick: () => onResolve(request.id, false, comment, files),
                                        disabled: loadingType !== null
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </>)
                )
            }
        </>);
    }
}

export default withStyles(styles)(AuthorizationSection);

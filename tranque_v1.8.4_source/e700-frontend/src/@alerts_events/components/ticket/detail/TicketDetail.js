import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {CircularProgress, Dialog, DialogContent, Divider, Grid, LinearProgress, withStyles} from '@material-ui/core';
import {Warning} from '@material-ui/icons';
import TicketHeader from '@alerts_events/components/ticket/TicketHeader';
import ChildrenSection from '@alerts_events/components/ticket/detail/ChildrenSection';
import DescriptionSection from '@alerts_events/components/ticket/detail/DescriptionSection';
import PublicMessageSection from '@alerts_events/components/ticket/detail/PublicMessageSection';
import AuthorizationSection from '@alerts_events/components/ticket/detail/AuthorizationSection';
import CommentSection from '@alerts_events/components/ticket/detail/CommentSection';
import ActionsSection from '@alerts_events/components/ticket/detail/ActionsSection/ActionsSection';
import IconTextGrid from '@app/components/utils/IconTextGrid';
import {CLOSED, getGroup, isAlert, RED_ALERT} from '@alerts_events/constants/ticketGroups';
import {ALERT_BACKGROUND, ALERT_TRACING, CLOSING_ACT,  TICKET_MANAGER,
    getSpanishName} from '@alerts_events/constants/commentTypes';
import {canSeePublicAlertMessages, seeComments} from '@alerts_events/constants/userActions';
import {currentTabActions} from '@alerts_events/actions/currentTab.actionCreators';
import { APPROVED_AND_USED } from '@alerts_events/constants/authorizationStates';


const styles = theme => ({
    dialog: {
        backgroundColor: '#5c5c5c'
    },
    section: {
        padding: 20
    },
    sectionHeader: {
        paddingBottom: 20
    },
    loading: {
        textAlign: 'center',
        paddingTop: 10
    },
    header: {
        paddingLeft: 18
    }
});


class TicketDetail extends Component {


    handleTabChange(value) {
        this.props.actions.saveCurrentActionTab(value);
    }

    renderCommentSection(type) {
        const {
            classes, comments, onComment, onDownload, ticket,
            currentComments, currentFiles, onChangeComment, user
        } = this.props;
        let title = getSpanishName(type);
        let currentComment = '';
        let currentTypedFiles = [];
        const commentAction = seeComments(user, type, true, getGroup(ticket)); // true: write;
        switch (type) {
            case TICKET_MANAGER:
                currentComment = currentComments.manager_comment;
                currentTypedFiles = currentFiles.manager_files;
                break;
            case ALERT_BACKGROUND:
                currentComment = currentComments.background_comment;
                currentTypedFiles = currentFiles.background_files;
                break;
            case ALERT_TRACING:
                currentComment = currentComments.tracing_comment;
                currentTypedFiles = currentFiles.tracing_files;
                break;
            case CLOSING_ACT:
                currentComment = currentComments.emac_close_comment;
                currentTypedFiles = currentFiles.emac_close_files;
                break;
            default:
                break;
        }
        currentTypedFiles = currentTypedFiles !== undefined ? currentTypedFiles.filter(f => f.name) : [];
        return (<div className={classes.section}>
            <CommentSection
                ticket={ticket}
                title={title}
                type={type}
                allowNewComments={ticket.state !== CLOSED && commentAction}
                onSend={onComment}
                comments={comments}
                onDownload={onDownload}
                currentComment={currentComment}
                currentFiles={currentTypedFiles}
                onChangeComment={onChangeComment}
            />
        </div>);
    }

    renderContent() {
        const { ticket, classes, loading, error, onRequestResolve, onTicketUpdate, onComment,
            onDownload, detailRoute, logs, currentTab, onAuthorizationDownload, publicMessages,
            currentPublicAlertMessage, onRequest, onPublicAlertMessageUpdate, requesting, showTargetInfo,
            onChangePublicAlertMessage, user, requests, scope, resolvingAuthorizationRequest } = this.props;
        const lastRequest = requests.find(req => req.status !== APPROVED_AND_USED) || null;
        const group = getGroup(ticket);
        const targetWork = (ticket.target.work_sites && ticket.target.work_sites[0]) ?
            ticket.target.work_sites[0].name : null;
        const targetEntity = (targetWork && ticket.target.work_sites[0].entity) ?
            ticket.target.work_sites[0].entity.name : null;
        return (
            <>
                <div className={classes.header}>
                    <TicketHeader ticket={ticket || {}} user={user}/>
                </div>
                <Divider/>

                {
                    showTargetInfo && (<>
                        <Grid container spacing={1} className={classes.section}>
                            <Grid item>{targetEntity}</Grid>
                            <Grid item>•</Grid>
                            <Grid item>{ticket.target.name}</Grid>
                            <Grid item>•</Grid>
                            <Grid item>{targetWork}</Grid>
                        </Grid>
                        <Divider/>
                    </>)
                }

                <div className={classes.loading}>
                    {loading && <CircularProgress/>}
                </div>

                <div className={classes.error}>
                    {error && !loading &&
                    <IconTextGrid icon={<Warning/>} text='Hubo un error al cargar los datos'/>}
                </div>

                <div className={classes.section}>
                    <DescriptionSection
                        user={user}
                        ticket={ticket || {}}
                        logs={logs}
                        onDownload={onDownload}
                        onAuthorizationDownload={onAuthorizationDownload}
                    />
                </div>
                <Divider/>

                {
                    isAlert(group) &&
                    canSeePublicAlertMessages(user, group, false) && //false: 'read'; true: 'write'
                    (<>
                        <div className={classes.section}>
                            <PublicMessageSection
                                ticket={ticket || {}}
                                updateButton={canSeePublicAlertMessages(user, group, true)}
                                messages={publicMessages}
                                currentMessage={currentPublicAlertMessage}
                                onUpdate={onPublicAlertMessageUpdate}
                                onChangeMessage={onChangePublicAlertMessage}
                                scope={scope}
                            />
                        </div>
                        <Divider/>
                    </>)
                }

                {
                    lastRequest &&
                        <div className={classes.section}>
                            <AuthorizationSection
                                user={user}
                                request={lastRequest}
                                ticket={ticket || {}}
                                onComment={onComment}
                                onDownload={onAuthorizationDownload}
                                onResolve={onRequestResolve}
                                loadingType={resolvingAuthorizationRequest}
                            />
                        </div>
                }
                <Divider/>



                <div className={classes.section}>
                    <ChildrenSection ticket={ticket || {}} detailRoute={detailRoute} user={user}/>
                </div>
                <Divider/>

                {isAlert(group) && (<>
                    { seeComments(user, ALERT_TRACING, false, group) &&
                        (<>
                            {this.renderCommentSection(ALERT_TRACING)}
                            <Divider/>
                        </>)
                    }
                    { seeComments(user, ALERT_BACKGROUND, false, group) &&
                        (<>
                            {this.renderCommentSection(ALERT_BACKGROUND)}
                            <Divider/>
                        </>)
                    }
                </>)}

                {(!isAlert(group) && seeComments(user, TICKET_MANAGER, false, group)) &&
                    (<>
                        {this.renderCommentSection(TICKET_MANAGER)}
                        <Divider/>
                    </>)
                }

                {(group === RED_ALERT && seeComments(user, CLOSING_ACT, false, group)) &&
                    (<>
                        {this.renderCommentSection(CLOSING_ACT)}
                        <Divider/>
                    </>)
                }

                <div className={classes.section}>
                    <ActionsSection
                        handleTabChange={(e, value) => this.handleTabChange(value)}
                        tabValue={currentTab}
                        user={user}
                        onTicketUpdate={onTicketUpdate}
                        ticket={ticket}
                        onRequest={onRequest}
                        requests={requests}
                        requesting={requesting}
                    />
                </div>
                <Divider/>
            </>
        );
    }

    handleClose() {
        const { actions, handleClose } = this.props;
        actions.saveCurrentActionTab('');
        handleClose();
    }

    render() {
        const { classes, loading } = this.props;
        return (
            <Dialog
                fullWidth={true}
                maxWidth='lg'
                open={true}
                onClose={() => this.handleClose()}
                classes={{paper: classes.dialog}}>
                <DialogContent>
                    {loading && (
                        <>
                            <LinearProgress variant="query"/>
                            <Divider/>
                        </>
                    )}
                    {!loading && this.renderContent()}
                </DialogContent>
            </Dialog>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentTab: state.tickets.current_action_tab
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(currentTabActions, dispatch)
    };
}


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(TicketDetail));

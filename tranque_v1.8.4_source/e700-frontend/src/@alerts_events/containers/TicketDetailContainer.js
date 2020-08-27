import React from 'react';
import {connect} from 'react-redux';
import {currentCommentsActions} from '@alerts_events/actions/currentComments.actionCreators';
import {requestsCounterActions} from '@alerts_events/actions/requestsCounter.actionCreators';
import {bindActionCreators} from 'redux';
import {history} from '@app/history';
import {reverse} from '@app/urls';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import * as ticketService from '@app/services/backend/tickets';
import TicketDetail from '@alerts_events/components/ticket/detail/TicketDetail';
import {
    ALERT_BACKGROUND,
    ALERT_TRACING,
    AUTHORIZE,
    CLOSING_ACT,
    TICKET_MANAGER
} from '@alerts_events/constants/commentTypes';
import {getGroup, isAlert} from '@alerts_events/constants/ticketGroups';
import {getUserTypeRouteString} from '@app/services/userType';
import {ConsoleHelper} from '@app/ConsoleHelper';
import {APPROVING, DENYING} from '@alerts_events/components/ticket/detail/AuthorizationSection';

class TicketDetailContainer extends SubscribedComponent {

    state = {
        errorLoading: false,
        detailedData: {},
        openDialog: false,
        loading: true,
        comments: [],
        files: [],
        targetData: {},
        logs: [],
        public_alert_messages: [],
        requests: [],
        ownRequests: [],
        resolvingAuthorizationRequest: null,
        requesting: false
    };

    componentDidMount() {
        this.loadData();
    }

    loadData() {
        this.unsubscribeAll();
        this.setState({
            errorLoading: false,
            detailedData: {},
            openDialog: false,
            loading: true,
            comments: [],
            files: [],
            targetData: {},
            logs: [],
            public_alert_messages: [],
            requests: []
        }, () => {
            this.loadTicketDetail();
            this.getComments();
            this.loadTicketLogEntries();
            this.loadAuthorizationRequests()
        });
    }

    handleDetailClose() {
        this.resetAllCurrentComments();
        history.push(this.getListRoute());
    }

    getTicketType() {
        const {location} = this.props;
        const pathname = location.pathname;
        if (pathname.includes('/activos')) {
            return 'open';
        } else if (pathname.includes('/archivados')) {
            return 'archived';
        } else if (pathname.includes('/no-evaluables')) {
            return 'unevaluable';
        } else if (pathname.includes('/cerrados')) {
            return 'closed';
        } else return null;
    }


    getListRoute() {
        const {target, location, scope, user} = this.props;
        const userType = getUserTypeRouteString(user);
        const type = this.getTicketType();
        if (location.pathname.includes('/deposito/')) {
            // Target tickets list
            if (userType === 'authorities') {
                return reverse(userType + '.target.tickets.' + scope + '.' + type, {target});
            }
            return reverse(userType + '.target.' + scope + '.tickets.' + type, {target});
        } else {
            // All tickets list
            return reverse(userType + '.tickets.' + scope + '.' + type);
        }
    }

    hasToShowTargetInfo() {
        const {location} = this.props;
        return !location.pathname.includes('/deposito/')
    }

    componentDidUpdate(prevProps) {
        if (prevProps.ticketId !== this.props.ticketId) {
            this.loadData();
        }
    }

    loadTicketDetail() {
        const {target, ticketId} = this.props;
        this.subscribe(
            ticketService.read({target, ticket_id: ticketId}),
            (data) => this.setState({
                detailedData: data,
                loading: false
            }, () => this.loadPublicAlertMessages(this.state.detailedData)),
            (err) => this.setState({loading: false, errorLoading: true})
        );
    }


    loadTicketLogEntries() {
        const {target, ticketId} = this.props;
        this.subscribe(
            ticketService.readLog({target, ticket_id: ticketId}),
            data => this.setState({logs: data.results}),
            err => ConsoleHelper(err, "error")
        );
    }

    loadPublicAlertMessages(ticket) {
        const {target, scope} = this.props;
        if (!isAlert(getGroup(ticket))) return null;
        this.subscribe(
            ticketService.readPublicAlertMessages({
                target,
                alertType: getGroup(ticket),
                scope
            }),
            res => {
                ConsoleHelper(res, "log");
                return this.setState({public_alert_messages: res});
            },
            err => ConsoleHelper(err, "error")
        );
    }

    loadAuthorizationRequests() {
        const {target, ticketId} = this.props;
        this.subscribe(
            ticketService.readAuthorizationRequests({
                target,
                ticket_id: ticketId
            }),
            res => this.setState({ requests: res.data.results }),
            err => ConsoleHelper(err, "error")
        );
    }

    createAuthorizationRequest = (action, to_state) => {
        const {target, ticketId, actions} = this.props;
        this.setState({requesting: true});
        this.subscribe(
            ticketService.createAuthorizationRequest(
                {
                    target,
                    ticket_id: ticketId,
                    action, to_state
                }
            ),
            obj => {
                this.loadData();
                actions.setRequestsCounterUpdating(true);
                this.setState({requesting: false});
            },
            err => {
                ConsoleHelper(err, "error");
                this.setState({requesting: false});
            }
        );
    }

    resolveAuthorizationRequest = (request_id, approved, comment, documents) => {
        this.setState({
            resolvingAuthorizationRequest: approved ? APPROVING : DENYING}
        );
        const {target, ticketId, actions} = this.props;
        this.subscribe(
            ticketService.resolveAuthorizationRequest(
                {
                    target,
                    ticket_id: ticketId,
                    request_id,
                    approved,
                    comment,
                    documents
                }
            ),
            obj => {
                this.loadData();
                actions.setRequestsCounterUpdating(true);
                this.setState({resolvingAuthorizationRequest: null});
            },
            err => {
                this.setState({resolvingAuthorizationRequest: null});
                ConsoleHelper(err, "error");
            }
        )
    }

    updatePublicAlertMessage = (content, alertType) => {
        const {target, scope} = this.props;
        const {actions} = this.props;
        this.subscribe(
            ticketService.addNewPublicAlertMessage(
                {
                    content,
                    target,
                    alertType,
                    scope
                }),
            obj => {
                this.loadData();
                actions.saveCurrentPublicAlertMessage('');
            },
            err => ConsoleHelper('Error en la actualización del mensaje', "error")
        );
    };


    getComments() {
        const {target, ticketId} = this.props;
        this.subscribe(
            ticketService.readTicketComments({
                ticket_id: ticketId,
                target
            }),
            obj => {
                this.setState({comments: obj.data.results});
            }
        );
    }


    sendTicketComment = (comment, files, type) => {
        const {target, ticketId} = this.props;
        this.subscribe(
            ticketService.commentTicket(
                {
                    comment: comment,
                    ticket_id: ticketId,
                    target,
                    documents: files,
                    comment_type: type
                }),
            obj => {
                this.loadData();
                this.saveCurrentComment('', [], type);
            },
            err => ConsoleHelper('Error en el envío del comentario', "error")
        );
    };


    saveCurrentComment(content, files, type) {
        const {actions} = this.props;
        // Save in redux store
        switch (type) {
            case TICKET_MANAGER:
                actions.saveCurrentManagerComment(content, files);
                break;
            case ALERT_TRACING:
                actions.saveCurrentTracingComment(content, files);
                break;
            case ALERT_BACKGROUND:
                actions.saveCurrentBackgroundComment(content, files);
                break;
            case CLOSING_ACT:
                actions.saveCurrentClosingActComment(content, files);
                break;
            case AUTHORIZE:
                actions.saveCurrentAuthorizeComment(content, files);
                break;
            default:
                return null;
        }
    }


    resetAllCurrentComments() {
        const {actions} = this.props;
        actions.saveCurrentManagerComment('', []);
        actions.saveCurrentTracingComment('', []);
        actions.saveCurrentBackgroundComment('', []);
        actions.saveCurrentClosingActComment('', []);
        actions.saveCurrentAuthorizeComment('', []);
        actions.saveCurrentPublicAlertMessage('');
    }


    downloadFile(doc) {
        const {ticketId, target} = this.props;
        return this.subscribe(
            ticketService.downloadTicketCommentFile({
                ticket_id: ticketId,
                comment_id: doc.meta.comment && doc.meta.comment.value,
                id: doc.id,
                filename: doc.name,
                target
            })
        );
    }

    downloadAuthorizationFile(doc) {
        const {ticketId, target} = this.props;
        return this.subscribe(
            ticketService.downloadTicketAuthorizationFile({
                ticket_id: ticketId,
                request_id: doc.meta.request_id.value,
                target,
                id: doc.id,
                filename: doc.name
            })
        )
    }


    updateTicketState(ticket, changes) {
        const {target} = this.props;
        this.subscribe(
            ticketService.createIntent(
                {
                    state: changes.state,
                    archived: changes.archived,
                    module: ticket.module,
                    target
                }),
            res => {
                this.handleDetailClose();
                window.location.reload(false);
            },
            err => ConsoleHelper('Error en la actualización del ticket', "error")
        );
    }

    render() {
        const {
            errorLoading, manager_comment, manager_files, tracing_comment, tracing_files,
            background_comment, background_files, closing_act_comment, closing_act_files,
            authorize_comment, authorize_files, detailRoute, public_alert_message, actions,
            user, scope } = this.props;
        const {detailedData, loading, comments, logs, public_alert_messages,
            requests, resolvingAuthorizationRequest, requesting} = this.state;

        const currentComments = {
            manager_comment, tracing_comment, background_comment, closing_act_comment, authorize_comment
        };
        const currentFiles = {
            manager_files, tracing_files, background_files, closing_act_files, authorize_files
        };
        return (
            <TicketDetail
                handleClose={() => this.handleDetailClose()}
                ticket={detailedData}
                loading={loading}
                error={errorLoading}
                onComment={this.sendTicketComment}
                comments={comments}
                onDownload={(doc) => this.downloadFile(doc)}
                currentComments={currentComments}
                currentFiles={currentFiles}
                onChangeComment={(c, f, t) => this.saveCurrentComment(c, f, t)}
                onTicketUpdate={(ticket, changes) => this.updateTicketState(ticket, changes)}
                logs={logs}
                detailRoute={detailRoute}
                publicMessages={public_alert_messages}
                onPublicAlertMessageUpdate={this.updatePublicAlertMessage}
                currentPublicAlertMessage={public_alert_message}
                onChangePublicAlertMessage={(c) => actions.saveCurrentPublicAlertMessage(c)}
                user={user}
                onRequest={this.createAuthorizationRequest}
                requesting={requesting}
                requests={requests}
                onRequestResolve={this.resolveAuthorizationRequest}
                resolvingAuthorizationRequest={resolvingAuthorizationRequest}
                onAuthorizationDownload={(doc) => this.downloadAuthorizationFile(doc)}
                scope={scope}
                showTargetInfo={this.hasToShowTargetInfo()}
            />
        );
    }
}

function mapStateToProps(state) {
    return {
        manager_comment: state.tickets.manager_comment,
        manager_files: state.tickets.manager_files,
        tracing_comment: state.tickets.tracing_comment,
        tracing_files: state.tickets.tracing_files,
        background_comment: state.tickets.background_comment,
        background_files: state.tickets.background_files,
        closing_act_comment: state.tickets.closing_act_comment,
        closing_act_files: state.tickets.closing_act_comment,
        authorize_comment: state.tickets.authorize_comment,
        authorize_files: state.tickets.authorize_files,
        public_alert_message: state.tickets.public_alert_message
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(
            {...currentCommentsActions, ...requestsCounterActions},
            dispatch
        )
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketDetailContainer);

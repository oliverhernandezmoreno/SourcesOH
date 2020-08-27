import React, {Component} from 'react';
import { Paper, Chip, List, ListItem, ListItemIcon,
    ListItemText, ListItemSecondaryAction, withStyles } from '@material-ui/core';
import moment from 'moment';
import { getSpanishName, TICKET_MANAGER, ALERT_TRACING } from '@alerts_events/constants/commentTypes';
import { AUTHORIZATION, getLogDescription } from '@alerts_events/constants/logTypes';
import StyledDialog from '@alerts_events/components/ticket/detail/StyledDialog';
import { seeComments } from '@alerts_events/constants/userActions';
import { getGroup } from '@alerts_events/constants/ticketGroups';


const styles = theme => ({
    comment: {
        padding: 10,
        marginBottom: 10,
        backgroundColor: 'transparent',
        border: '1px solid white',
        marginLeft: 70,
        marginRight: 200
    },
    documents: {
        marginLeft: 70,
        marginBottom: 10,
        marginRight: 200
    },
    listItemText: {
        marginRight: 200
    }
});

class TicketLog extends Component {

    renderedComment = null;
    renderedCommentType = null;

    renderAttached(entry, index) {
        const documents = entry.documents;
        const {classes, onDownload, onAuthorizationDownload} = this.props;
        return (<div key={index} className={classes.documents}>
            {documents.map((doc, index) =>
                <Chip key={index}
                    label={<div>{doc.name}</div>}
                    onClick={
                        entry.meta.description === AUTHORIZATION ?
                            () => onAuthorizationDownload(doc) :
                            () => onDownload(doc)
                    }
                />)}
        </div>);
    }

    renderComment(comment) {
        const {classes} = this.props;
        return (
            <Paper variant="outlined" className={classes.comment}>
                {comment}
            </Paper>
        );
    }

    renderEntries() {
        const {logs, classes, user, ticket} = this.props;
        if (!logs) return '';
        let entries = [];
        this.renderedComment = null;
        let preRenderedArray = [];
        const filteredLogs = logs.filter(log => {
            const meta = log.meta;
            if (meta && meta.comment_id && user) {
                const type = meta.comment_type;
                return seeComments(user, type, false, getGroup(ticket));
            }
            return true;
        })
        if (filteredLogs.length === 0) entries = 'Sin entradas';
        for (var i = 0; i < filteredLogs.length; i ++) {
            const entry = filteredLogs[i];
            const meta = entry.meta;

            // Entry is a comment and/or a document
            if (meta.comment_id !== undefined) {
                // If the entry is just a comment (no attachments)
                // a current comment type is set if content = '' and there are attachments
                if (entry.documents.length === 0) {
                    this.renderedCommentType = meta.comment_type;
                }

                // Only management comments will be in log
                if (this.renderedCommentType !== TICKET_MANAGER &&
                    this.renderedCommentType !== ALERT_TRACING) continue;

                // If next documment entry is part of the previous comment,
                // it is added just below that comment (and next to its other documents)
                if (entry.documents.length > 0 && meta.comment_id === this.renderedComment) {
                    entries.push(this.renderAttached(entry, i));
                    continue;
                }
            }
            this.renderedComment = meta.comment_id;

            // If entry was a comment with an empty content, no need to render the entry
            if (this.renderedComment !== undefined && meta.comment === '') continue;

            const author = (entry.author && entry.author.username) || 'El sistema';

            preRenderedArray.push(
                {
                    listItemContent: (<>
                        <ListItemText className={classes.listItemText}>
                            {
                                // Only for COMMENTS
                                meta.comment_id &&
                                getSpanishName(this.renderedCommentType) + ': '
                            }
                            <b>{ author + ' ' }</b>
                            { getLogDescription(ticket, meta) }
                        </ListItemText>

                        <ListItemSecondaryAction>
                            {moment(entry.created_at).format('lll')}
                        </ListItemSecondaryAction>
                    </>),
                    commentContent: (<>
                        {   // Only for COMMENTS
                            meta.comment && this.renderComment(meta.comment)
                        }
                        {   // Only for DOCUMENTS
                            entry.documents.length > 0 && this.renderAttached(entry, i)
                        }
                    </>)
                }
            );
        }
        // Wrapping preRenderedArray elements to set a counter
        entries = preRenderedArray.map((entry, index) => (
            <React.Fragment key={index}>
                <ListItem>
                    <ListItemIcon><div>{preRenderedArray.length - 1 - index}</div></ListItemIcon>
                    {entry.listItemContent}
                </ListItem>
                {entry.commentContent}
            </React.Fragment>
        ))
        return (<List>{entries}</List>);
    }

    render() {
        const {open, onClose} = this.props;
        return (
            <StyledDialog
                open={open}
                onClose={onClose}
                content={this.renderEntries()}
                title='Bitácora'
            />
        );
    }
}


export default withStyles(styles)(TicketLog);

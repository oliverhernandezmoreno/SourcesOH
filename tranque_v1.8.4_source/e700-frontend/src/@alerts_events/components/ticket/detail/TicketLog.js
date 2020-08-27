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

    renderAttached(entry) {
        const documents = entry.documents;
        const comment_id = entry.meta.comment_id;
        const {classes, onDownload, onAuthorizationDownload} = this.props;
        return (<div className={classes.documents}>
            {documents.map((doc, index) =>
                <Chip key={index}
                    label={<div>{doc.name}</div>}
                    onClick={
                        entry.meta.description === AUTHORIZATION ?
                            () => onAuthorizationDownload(doc) :
                            () => onDownload(doc, comment_id)
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
        let entries = [];
        let preRenderedArray = [];
        const filteredLogs = (logs || []).filter(log => {
            const meta = log.meta;
            if (meta && meta.comment_id && user) {
                // Only management comments will be in log
                if (meta.comment_type !== TICKET_MANAGER &&
                    meta.comment_type !== ALERT_TRACING) return false;
                return seeComments(user, meta.comment_type, false, getGroup(ticket));
            }
            return true;
        })
        if (filteredLogs.length === 0) entries = 'Sin entradas';
        else {
            filteredLogs.forEach((entry) => {
                const meta = entry.meta;
                const author = (entry.author && entry.author.username) || 'El sistema';
                preRenderedArray.push(
                    {
                        listItemContent: (<>
                            <ListItemText className={classes.listItemText}>
                                { // Only for COMMENTS
                                    meta.comment_id &&
                                    getSpanishName(meta.comment_type) + ': ' }
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
                                entry.documents.length > 0 && this.renderAttached(entry)
                            }
                        </>)
                    }
                );
            });
            // Wrapping preRenderedArray elements to set a counter
            entries = preRenderedArray.map((entry, index) => (
                <React.Fragment key={index}>
                    <ListItem>
                        <ListItemIcon>
                            <div>{preRenderedArray.length - 1 - index}</div>
                        </ListItemIcon>
                        {entry.listItemContent}
                    </ListItem>
                    {entry.commentContent}
                </React.Fragment>
            ))
        }
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

import React, {Component} from 'react';
import { Grid, Paper, TextField,
    Typography, Chip, withStyles } from '@material-ui/core';
import { AttachFile } from '@material-ui/icons';
import * as moment from 'moment';
import {UploadFileButton} from '@app/components/utils/UploadFileButton';
import {DATE_TIME_FORMAT} from '@app/config';
import ContainedButton from '@app/components/utils/ContainedButton';

const styles = theme => ({
    title: {
        paddingBottom: 20
    },
    commentButtons: {
        width: 175
    },
    comment: {
        marginBottom: 30
    },
    commentPaper: {
        paddingLeft: 10
    },
    attachIcon: {
        color: '#ffffff',
        padding: 0
    }
});


class CommentSection extends Component {

    state = {
        newCommentContent: this.props.currentComment || '',
        newFiles: this.props.currentFiles || []
    }

    setNewCommentContent = event => {
        const {onChangeComment, type} = this.props;
        this.setState({
            newCommentContent: event.target.value
        }, () => onChangeComment(
            this.state.newCommentContent,
            this.state.newFiles,
            type));
    }

    sendComment() {
        const {newCommentContent, newFiles} = this.state;
        const {type} = this.props;
        this.props.onSend(newCommentContent, newFiles, type);
        this.setState({newCommentContent: '', newFiles: []});
    }

    renderOldComment(comment) {
        const {classes, onDownload} = this.props;
        const files = comment.documents;
        const date = comment.created_at ? moment(comment.created_at).format(DATE_TIME_FORMAT).split(',') : null;
        return (
            <Grid item xs={12} key={comment.id} className={classes.comment}>
                <Paper className={classes.commentPaper}>
                    <Grid container spacing={3}>
                        {date && <Grid item>{ date[0] + ' a las ' + date[1] }</Grid>}
                        <Grid item>{ comment.created_by }</Grid>
                        {comment.content !== '' && <Grid item xs={12}>{ comment.content }</Grid>}
                        <Grid item xs={12}>
                            {files.map((doc, index) =>
                                <Chip key={index}
                                    label={<div>{doc.name}</div>}
                                    onClick={() => onDownload(doc)}
                                />
                            )
                            }
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>
        );
    }

    setNewFiles(files) {
        const {onChangeComment, type} = this.props;
        this.setState(state => ({
            newFiles: [...state.newFiles,
                ...files.map((file, index) => {
                    file['id'] = moment().format() + index;
                    return file;
                })
            ]
        }), () => onChangeComment(
            this.state.newCommentContent,
            this.state.newFiles,
            type));

    }

    renderNewFiles() {
        return this.state.newFiles.map(doc =>
            <Chip key={doc.id} color='primary'
                label={<div>{doc.name}</div>}
            />
        );
    }


    render() {
        const {classes, title, allowNewComments, comments, type, noCommentButton} = this.props;
        const {newCommentContent, newFiles} = this.state;
        const typedComments = type ? (comments || []).filter(c => c.comment_type === type) : (comments || []);
        return (<>
            { title &&
                <Typography variant='h6' className={classes.title}>
                    {title}
                </Typography>
            }
            <Grid container spacing={2} alignItems='center'>
                {
                    typedComments.length === 0 && !noCommentButton ?
                        <Grid item xs={12}>No hay comentarios</Grid> :
                        typedComments.map(comment => this.renderOldComment(comment))
                }
                {
                    allowNewComments && (<>
                        <Grid item xs>
                            <TextField multiline fullWidth variant='outlined' label=''
                                placeholder='Comenta y adjunta antecedentes a este ticket'
                                value={newCommentContent}
                                onChange={this.setNewCommentContent}/>
                        </Grid>

                        {
                            !noCommentButton &&
                                <Grid item>
                                    <ContainedButton
                                        text='COMENTAR'
                                        buttonProps={{
                                            disabled: newCommentContent.trim() === '' && newFiles.length === 0,
                                            onClick: () => this.sendComment()
                                        }}
                                    />
                                </Grid>
                        }

                        <Grid item>
                            <UploadFileButton
                                label=''
                                buttonProps={{
                                    startIcon: <AttachFile/>,
                                    variant:'text',
                                    className: classes.attachIcon
                                }}
                                onFileSelection={(files) => this.setNewFiles(files)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            {this.renderNewFiles()}
                        </Grid>
                    </>)
                }
            </Grid>
        </>);
    }
}


export default withStyles(styles)(CommentSection);
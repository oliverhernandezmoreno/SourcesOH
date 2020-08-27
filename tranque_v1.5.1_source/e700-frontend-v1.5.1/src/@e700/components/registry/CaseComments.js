import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import * as config from '@app/config';
import {Grid, Typography, TextField, Button, Avatar, Card, CardContent, Chip, IconButton} from '@material-ui/core';
import * as moment from 'moment';
import {UploadFileButton} from '@app/components/utils/UploadFileButton';
import {Delete, AttachFile} from '@material-ui/icons';


const styles = theme => ({
    subtitle: {
        color: '#ffffff',
        fontWeight: '700',
        letterSpacing: '0.25px',
        lineHeight: '20px',
        textAlign: 'left',
        paddingBottom: '1.5em',
        paddingTop: '1em'
    },
    commentContentContainer: {
        backgroundColor: theme.palette.primary.light,
        borderRadius: '5px',
        minHeight: '60px',
        marginBottom: '1em',
        padding: '0.5em 1em',
        whiteSpace: 'pre-line'
    },
    button: {
        backgroundColor: theme.palette.primary.main,
        width: '220px',
        height: '35px',
    },
    text_button: {
        color: '#FFFFFF',
        fontSize: '14px',
        fontWeight: '500',
        letterSpacing: '1.25px',
        lineHeight: '16px',
        width: '102px',
        textAlign: 'center',
        minWidth: '20em',
    },
    avatarContainer: {
        textAlign: 'center'
    },
    avatar: {
        margin: 'auto'
    },
    commentDate: {
        fontSize: '12px',
        paddingBottom: 10
    },
    uploadButton: {
        width: '250px',
        paddingBottom: '8px'
    },
    chip: {
        marginRight: theme.spacing(1),
        marginBottom: theme.spacing(1),
        maxWidth: '100%'
    },
    content: {
        paddingBottom: theme.spacing(1)
    }
});

/**
 * The "Bitácora del caso" component with.
 *
 * @version 1.0.0
 * @author [Nicolás Aguilera](https://gitlab.com/naguilera)
 */
class CaseComments extends Component {

    state = {
        newCommentContent: '',
        newFiles: []
    }

    /**
     * Sets the new comment in the content.
     *
     * @public
     */
    setNewCommentContent = event => {
        this.setState({
            newCommentContent: event.target.value
        });
    };

    onSend() {
        const {newCommentContent, newFiles} = this.state;
        this.props.onSend(newCommentContent, newFiles);
        this.setState({newCommentContent: '', newFiles: []});
    }

    setNewFiles(files) {
        this.setState(state => ({
            newFiles: [...state.newFiles,
                ...files.map((file, index) => {
                    file['id'] = moment().format() + index;
                    return file;
                })
            ]
        }));
    }

    deleteNewFile(id) {
        this.setState(state => ({ newFiles: state.newFiles.filter(file => file.id !== id) }));
    }

    renderFileNames() {
        return this.state.newFiles.map(file => {
            return (
                <Grid container direction='row' alignItems='center' key={file.id}>
                    <Grid item>
                        <Typography variant='body1'>{file.name}</Typography>
                    </Grid>
                    <Grid item>
                        <IconButton onClick={() => this.deleteNewFile(file.id)}>
                            <Delete />
                        </IconButton>
                    </Grid>
                </Grid>
            );}
        );
    }

    /**
    * Renders a card with a user case comment.
    *
    * @param {comment} the comment
    * @public
    */
    renderCommentCard(comment) {
        const {classes, files} = this.props;
        const user = comment.created_by;
        const initials = user ? user.toString().split(' ').map(n => n[0]).join(''): '';
        const commentDate = moment(comment.created_at).format(config.ISO_DATE_FORMAT +
                                                        ' ' + config.TIME_FORMAT).split(' ');
        return <React.Fragment key={comment.id}>
            {user &&
                        <Grid item sm={2} className={classes.avatarContainer}>
                            <Avatar className={classes.avatar}>{initials}</Avatar>
                            <Typography>{user}</Typography>
                        </Grid>
            }
            <Grid item xs={12} sm={user ? 10 : 12}>
                <Card className={classes.commentContentContainer}>
                    <CardContent>
                        <Typography className={classes.commentDate}>
                            { 'Creado el ' + commentDate[0] + ' a las ' + commentDate[1] }
                        </Typography>
                        <Typography className={classes.content}>{comment.content}</Typography>
                        {files && files.filter(file => file.meta.comment.value === comment.id)
                            .map((doc, index) => {
                                return (
                                    <Chip
                                        className={classes.chip}
                                        key={index}
                                        label={<div className={classes.fileName}>{doc.name}</div>}
                                        onClick={this.props.onDownload(doc)}
                                    />
                                );
                            })
                        }
                    </CardContent>
                </Card>
            </Grid>
        </React.Fragment>
    }

    /**
     * Render this component.
     *
     * @public
     */
    render() {
        const {classes, comments} = this.props;
        const {newCommentContent} = this.state;
        return (
            <Grid container>
                <Grid item xs={12}>
                    <Typography className={classes.subtitle}>
                        Bitácora del caso
                    </Typography>
                </Grid>

                {comments.map(comment => this.renderCommentCard(comment))}

                <Grid item container justify='space-between' spacing={2}>
                    <Grid item xs={12} className={classes.textField}>
                        <TextField
                            label="Comentar caso ..."
                            value={newCommentContent}
                            onChange={this.setNewCommentContent}
                            margin="normal"
                            fullWidth
                        />
                    </Grid>
                    <Grid item container xs={12} alignItems='flex-end' spacing={2}>
                        <Grid item>
                            <UploadFileButton label={'Adjuntar Archivo'}
                                buttonProps={{startIcon: <AttachFile/>}}
                                className={classes.uploadButton}
                                onFileSelection={(files) => this.setNewFiles(files)}
                            />
                        </Grid>
                        <Grid item xs={8}>
                            {this.renderFileNames()}
                        </Grid>
                    </Grid>
                    <Grid item container xs={12} justify='flex-end'>
                        <Grid item>
                            <Button variant="contained"
                                size="medium"
                                disabled={newCommentContent.trim() === ''}
                                onClick={() => this.onSend()}
                                className={classes.button}
                            >
                                <Typography className={classes.text_button}>
                                    Enviar comentario
                                </Typography>
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>

            </Grid>
        );
    }
}

export default withStyles(styles)(CaseComments);

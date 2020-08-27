import React, {Component} from 'react';
import moment from 'moment';
import { Paper, Grid, Button, Typography, TextField, withStyles,
    List, ListItem, ListItemText, ListItemSecondaryAction } from '@material-ui/core';
import {COLORS} from '@miners/theme';
import { getGroup } from '@alerts_events/constants/ticketGroups';
import DashedBox from '@alerts_events/components/DashedBox';
import StyledDialog from '@alerts_events/components/ticket/detail/StyledDialog';
import ContainedButton from '@app/components/utils/ContainedButton';
import { Edit } from '@material-ui/icons';

const styles = theme => ({
    title: {
        paddingBottom: 20
    },
    subtitle: {
        paddingBottom: 15
    },
    box: {
        border: '1px solid white',
        padding: 10,
        marginBottom: 10
    },
    oldMsgButton: {
        color: COLORS.buttons.contained,
        backgroundColor: theme.palette.secondary.main
    },
    noDetailBox: {
        marginRight: 40
    },
    oldMessage: {
        padding: 10,
        marginBottom: 10,
        backgroundColor: 'transparent',
        border: '1px solid white',
        marginLeft: 70,
        marginRight: 200
    },
    lastUpdate: {
        paddingTop: 5
    },
    messageHeader: {
        paddingBottom: 10
    },
    newMessage: {
        marginTop: 30
    }
});

class PublicMessageSection extends Component {

    state = {
        openDialog: false
    }

    handleOpenDialog() { this.setState({openDialog: true}); }
    handleCloseDialog() { this.setState({openDialog: false}); }

    renderOldMessages(messages) {
        const {classes} = this.props;
        return messages.map((msg, index) =>
            <React.Fragment key={index}>
                <ListItem>
                    <ListItemText className={classes.listItemText}>
                        Por <b>{ msg.created_by}</b>:
                    </ListItemText>
                    <ListItemSecondaryAction>
                        { moment(msg.created_at).format('lll') }
                    </ListItemSecondaryAction>
                </ListItem>
                <Paper variant="outlined" className={classes.oldMessage}>
                    {msg.content}
                </Paper>
            </React.Fragment>);
    }

    render() {
        const {classes, messages, scope, ticket, currentMessage, onUpdate, onChangeMessage, updateButton} = this.props;
        const filteredMessages = (messages || []).filter(msg =>
            msg.target === ticket.target.canonical_name
            && msg.alert_type === getGroup(ticket)
            && msg.scope === scope
        );
        const lastMessage = filteredMessages.length > 0 ? filteredMessages[0] : null;
        const oldMessages = filteredMessages.length > 1 ? filteredMessages.slice(1) : [];
        return (<>
            <Grid container justify='space-between'>
                <Grid item>
                    <Typography variant='h6' className={classes.title}>
                        Mensaje de alerta visible en sitio público
                    </Typography>
                </Grid>
                <Grid item>
                    <Typography variant='subtitle2' className={classes.lastUpdate}>
                        Última actualización:
                        {
                            lastMessage ?
                                ' ' + moment(lastMessage.created_at).format('lll') :
                                ' Sin actualizaciones'
                        }
                    </Typography>
                </Grid>
            </Grid>

            <Typography variant='body1' className={classes.subtitle}>
                Resumen genérico según tipo de alerta
            </Typography>
            <Paper variant="outlined" className={classes.box}>
                {ticket.public_alert_abstract}
            </Paper>

            <br></br>

            <Grid container justify='space-between' alignItems='center' className={classes.messageHeader}>
                <Grid item>
                    <Typography variant='body1'>
                        Detalle de la alerta (puede ser actualizado por la autoridad)
                    </Typography>
                </Grid>
                <Grid item>
                    <Button variant='contained' className={classes.oldMsgButton}
                        onClick={() => this.handleOpenDialog()}>
                        MENSAJES ANTERIORES
                    </Button>
                </Grid>
            </Grid>

            {
                lastMessage ?
                    <Paper variant="outlined" className={classes.box}>
                        {lastMessage.content}
                    </Paper> :
                    <div className={classes.noDetailBox}>
                        <DashedBox content='La autoridad no ha ingresado ningún detalle de alerta'/>
                    </div>
            }

            {
                updateButton &&
                <Grid container spacing={2} alignItems='center' className={classes.newMessage}>
                    <Grid item xs>
                        <TextField multiline fullWidth
                            placeholder='Ingrese un nuevo detalle de alerta'
                            variant='outlined' label=''
                            value={currentMessage}
                            onChange={(event) => onChangeMessage(event.target.value)}
                        />
                    </Grid>
                    <Grid item className={classes.updateButton}>
                        <ContainedButton text='ACTUALIZAR DETALLE DE ALERTA'
                            buttonProps={{
                                startIcon: <Edit/>,
                                disabled: currentMessage === undefined || !currentMessage ||
                                          currentMessage.trim() === '',
                                onClick: () => onUpdate(currentMessage, getGroup(ticket))
                            }}
                        />
                    </Grid>
                </Grid>
            }



            <StyledDialog
                open={this.state.openDialog}
                onClose={() => this.handleCloseDialog()}
                content={<List>
                    {
                        oldMessages.length > 0 ?
                            this.renderOldMessages(oldMessages) :
                            'No hay más mensajes'
                    }
                </List>}
                title='Mensajes anteriores'
            />

        </>);
    }
}


export default withStyles(styles)(PublicMessageSection);
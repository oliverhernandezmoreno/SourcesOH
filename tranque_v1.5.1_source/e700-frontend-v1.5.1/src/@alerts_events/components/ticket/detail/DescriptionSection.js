import React, { Component } from 'react';
import { Button, Grid, Typography, withStyles } from '@material-ui/core';
import { Launch, Edit } from '@material-ui/icons';
import { CLOSED, isAlert, getGroup } from '@alerts_events/constants/ticketGroups';
import TicketLog from '@alerts_events/components/ticket/detail/TicketLog';
import ParametersDetail from '@alerts_events/components/ticket/detail/ParametersDetail';
import { COLORS } from '@miners/theme';
import { getTitle } from '@alerts_events/constants/ticketReasons';
import ContainedButton from '@app/components/utils/ContainedButton';

const styles = theme => ({
    buttons: {
        paddingTop: 20
    },
    title: {
        paddingBottom: 20
    },
    secondButton: {
        color: COLORS.buttons.contained,
        backgroundColor: '#343434'
    }
});

class DescriptionSection extends Component {

    state = {
        openLog: false,
        openDialog: false,
    }

    handleOpenLog() {
        this.setState({openLog: true});
    }

    handleCloseLog() {
        this.setState({openLog: false});
    }

    //function change 1
    handleClickOpen() {
        this.setState({openDialog:  true});
    };

    //function change 2
    handleClose(value){
        this.setState({openDialog: false});
        this.setState({setSelectedValue: value});
    };


    render() {
        const {classes, ticket, logs, onDownload, onAuthorizationDownload, user} = this.props;
        const {openDialog} = this.state;
        const PARAMETERS = "VER PARÁMETRO";
        return (<>
            <Typography variant='h6' className={classes.title}>
                {
                    ticket.state === CLOSED ?
                        <strike>{getTitle(ticket)}</strike> :
                        getTitle(ticket)
                }

            </Typography>
            <Typography variant='body1'>
                {ticket.result_state.message}
            </Typography>
            <Grid container
                justify={isAlert(getGroup(ticket)) ? 'flex-end' : 'space-between'}
                className={classes.buttons}
            >
                {
                    !isAlert(getGroup(ticket)) &&
                    <Grid item>
                        <ContainedButton
                            text={PARAMETERS}
                            buttonProps={{
                                startIcon: <Launch/>,
                                onClick: () => this.handleClickOpen()
                            }}
                        />
                        <ParametersDetail open={openDialog} onClose={() => this.handleClose()}/>
                    </Grid>
                }
                <Grid item>
                    <Button variant='contained' startIcon={<Edit/>} className={classes.secondButton}
                        onClick={() => this.handleOpenLog()}>
                        BITÁCORA
                    </Button>
                </Grid>
            </Grid>
            <TicketLog open={this.state.openLog}
                onClose={() => this.handleCloseLog()}
                logs={logs}
                onDownload={onDownload}
                user={user}
                ticket={ticket}
                onAuthorizationDownload={onAuthorizationDownload}
            />
        </>);
    }
}


export default withStyles(styles)(DescriptionSection);

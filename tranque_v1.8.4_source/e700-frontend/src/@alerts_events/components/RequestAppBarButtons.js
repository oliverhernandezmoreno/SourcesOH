import React from 'react';
import {Button, Tooltip, withStyles} from '@material-ui/core';
import {GetApp, Publish} from '@material-ui/icons';
import {history} from '@app/history';
import {reverse} from '@app/urls';

const styles = theme => ({
    tooltip: {
        backgroundColor: '#ffffff',
        color: '#000000',
        fontSize: 12,
    },
    button: {
        marginLeft: 10
    }
});

const RequestAppBarButtons = ({typedRequests, classes, userRoute}) => {
    const button = (tooltip, icon, text, onClick) =>
        <Tooltip classes={{tooltip: classes.tooltip}} title={tooltip}>
            <Button
                className={classes.button}
                variant='contained'
                color='secondary'
                startIcon={icon}
                onClick={onClick}
            >
                {text || 0}
            </Button>
        </Tooltip>
    return <div>
        {button('Solicitudes pendientes', <GetApp/>, typedRequests.pendingReceivedRequests,
            () => history.push(reverse(userRoute + '.requests.pendingReceived')))}
        {button('Solicitudes resueltas', <Publish/>, typedRequests.resolvedRequestedRequests,
            () => history.push(reverse(userRoute + '.requests.resolvedRequested')))}
    </div>;
}

export default withStyles(styles)(RequestAppBarButtons);

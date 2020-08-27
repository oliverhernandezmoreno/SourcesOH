import React from 'react';
import { withStyles } from '@material-ui/core';
import { PlayCircleOutlineOutlined, Lock,
    PauseCircleOutlineOutlined, Build,
    CheckCircleOutlined, RemoveCircleOutline } from '@material-ui/icons';
import { CLOSED } from '@alerts_events/constants/ticketGroups';
import IconTextGrid from '@app/components/utils/IconTextGrid';

const styles = (theme) => ({
    closable: {
        color: '#37e47b',
        verticalAlign: 'bottom'
    },
    notClosable: {
        color: '#ff6648',
        verticalAlign: 'bottom'
    },
});

const StateIcon = ({classes, ticket, labeled, withDescription, closingDate}) => {
    let icon;
    let state;
    let description;
    if (ticket.archived) {
        icon = <PauseCircleOutlineOutlined/>;
        state = 'ARCHIVADO';
        description = 'Ticket archivado'
    }
    else if (!ticket.evaluable) {
        icon = <Build/>;
        state = 'NO EVALUABLE';
        description = 'El sistema no puede evaluar este ticket'
    }
    else if (ticket.state === CLOSED) {
        icon = <Lock/>
        state = 'CERRADO'
        description = closingDate ? ('Cerrado el ' + closingDate) : 'Ticket cerrado';
    }
    else {
        icon = withDescription ?
            ( ticket.closable ?
                <CheckCircleOutlined className={classes.closable} /> :
                <RemoveCircleOutline className={classes.notClosable} /> ) :
            <PlayCircleOutlineOutlined/>;
        state = 'ABIERTO'
        description = ticket.closable ?
            'Cumple condiciones de cierre' :
            'No cumple condiciones de cierre';
    }
    return (<>
        { labeled &&
            <IconTextGrid icon={icon} text={state}/>
        }
        { withDescription &&
            <IconTextGrid icon={icon} text={description}/>
        }
        { (!labeled && !withDescription) &&
            icon
        }
    </>);
};

export default withStyles(styles)(StateIcon);
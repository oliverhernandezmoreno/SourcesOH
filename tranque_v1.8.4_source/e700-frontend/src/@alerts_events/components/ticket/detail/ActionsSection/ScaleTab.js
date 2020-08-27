import React, {Component} from 'react';
import { withStyles } from '@material-ui/core';
import ScaleOption from '@alerts_events/components/ticket/detail/ActionsSection/ScaleOption';
import { getGroup, isAlert, groupNames,
    A, B, C, D, YELLOW_ALERT, RED_ALERT } from '@alerts_events/constants/ticketGroups';


const styles = theme => ({
    options: {
        padding: 10
    },
    text: {
        paddingTop: 30,
        paddingLeft: 20
    }
});

const scaleOptions = {
    [A]: [
        {
            label: 'Escalar de ' + groupNames[A] + ' a ' + groupNames[B],
            subLabel: '',
            value: B},
        {
            label: 'Escalar de ' + groupNames[A] + ' a ' + groupNames[C],
            subLabel: 'Esta opción activará una alerta amarilla que será visible en el sitio público.' +
                      'La gestión de la alerta es exclusiva de la autoridad.',
            value: C
        },
        {
            label: 'Escalar de ' + groupNames[A] + ' a ' + groupNames[D],
            subLabel: 'Esta opción activará una alerta roja que será visible en el sitio público. ' +
                      'La gestión de la alerta es exclusiva de la autoridad.',
            value: D
        }
    ],
    [B]: [
        {
            label: 'Escalar de ' + groupNames[B] + ' a ' + groupNames[C],
            subLabel: 'Esta opción activará una alerta amarilla que será visible en el sitio público. ' +
                      'La gestión de la alerta es exclusiva de la autoridad.',
            value: C
        },
        {
            label: 'Escalar de ' + groupNames[B] + ' a ' + groupNames[D],
            subLabel: 'Esta opción activará una alerta roja que será visible en el sitio público. ' +
                      'La gestión de la alerta es exclusiva de la autoridad.',
            value: D
        }
    ],
    [C]: [
        {
            label: 'Escalar de ' + groupNames[C] + ' a ' + groupNames[D],
            subLabel: 'Esta opción activará una alerta roja que será visible en el sitio público. ' +
                      'La gestión de la alerta es exclusiva de la autoridad.',
            value: D
        }
    ],
    [YELLOW_ALERT]: [
        {
            label: 'Escalar de ' + groupNames[YELLOW_ALERT] + ' a ' + groupNames[RED_ALERT],
            subLabel: '',
            value: RED_ALERT
        }
    ]
}


class ScaleTab extends Component {

    render() {
        const {classes, ticket, user, onTicketUpdate, onRequest, requests, requesting} = this.props;
        const group = getGroup(ticket);
        if (!scaleOptions[group]) return '';
        return (<>
            {
                (!isAlert(group) && group !== C) &&
                <div className={classes.text}>
                    Este ticket puede tener varias opciones de escalamiento.
                    Cada opción posee sus propias condiciones e implicancias:
                </div>
            }
            <div className={classes.options}>
                {
                    scaleOptions[group].map((option, index) =>
                        <ScaleOption key={index}
                            ticket={ticket}
                            user={user}
                            option={option}
                            conditions={ticket.escalate_conditions}
                            group={group}
                            onTicketUpdate={onTicketUpdate}
                            onRequest={onRequest}
                            requests={requests}
                            requesting={requesting}
                        />
                    )
                }
            </div>
        </>);
    }
}

export default withStyles(styles)(ScaleTab);
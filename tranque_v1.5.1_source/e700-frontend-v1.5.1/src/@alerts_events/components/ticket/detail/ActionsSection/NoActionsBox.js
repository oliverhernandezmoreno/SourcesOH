import React, {Component} from 'react';
import { A, RED_ALERT, YELLOW_ALERT, isAlert } from '@alerts_events/constants/ticketGroups';
import DashedBox from '@alerts_events/components/DashedBox';


class NoActionsBox extends Component {

    isLevel(level) {
        const {user} = this.props;
        return level === user.approvalLevel;
    }

    isAlert() {
        const {group} = this.props;
        return isAlert(group);
    }

    getNoActionsText() {
        const {group} = this.props;
        let text = 'Tu perfil de usuario no está autorizado para tomar acciones de gestión sobre el ticket.';
        if (this.isLevel(2) && group === A) {
            text = 'Sólo es posible autorizar solicitudes de escalamiento.';
        }
        else if (this.isLevel(2) && group === YELLOW_ALERT) {
            text = 'Sólo la autoridad puede cerrar o escalar esta alerta.';
        }
        else if (this.isLevel(2) && group === RED_ALERT) {
            text = 'Sólo la autoridad puede bajar esta alerta a alerta amarilla o cerrarla definitivamente.';
        }
        else if (this.isLevel(3) && group === YELLOW_ALERT) {
            text = 'Sólo es posible autorizar solicitudes internas de autoridad para cerrar o escalar la alerta ' +
                   '(de amarilla a roja).';
        }
        else if (this.isLevel(3) && group === RED_ALERT) {
            text = 'Sólo es posible autorizar solicitudes internas de autoridad para cerrar o desescalar la alerta ' +
                   '(de roja a amarilla).'
        }
        return text;
    }

    render() {
        return <div style={{ marginRight: 40 }}>
            <DashedBox  content={this.getNoActionsText()} />
        </div>
    }
}


export default NoActionsBox;

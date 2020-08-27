import moment from 'moment';
import { B, C, D, YELLOW_ALERT, RED_ALERT } from '@alerts_events/constants/ticketGroups';
import { CRITICAL_PARAMETERS, TOPOGRAPHY } from '@alerts_events/constants/ticketReasons';

const conditions = [
    {complete: true, description: "Condición 1"},
    {complete: false, description: "Condición 2"},
    {complete: false, description: "Condición 3"},
    {complete: false, description: "Autorización", authorization: 'autoridad-2'}
]

export const ticket = {
    archived: false,
    children: [],
    closable: false,
    close_conditions: conditions,
    archive_conditions: conditions,
    escalate_conditions: {
        [B] : conditions, [C]: conditions, [D]: conditions, [YELLOW_ALERT]: conditions, [RED_ALERT]: conditions
    },
    public_alert_abstract: 'Resumen genérico de la alerta ...',
    created_at: moment(),
    evaluable: true,
    id: "w9w5ffEPUhyZb6Wjoy-0xA",
    parents: [],
    result_state: {
        level: 2,
        message: "Deslizamiento superficial de un sector del talud del muro",
        short_message: "Deslizamiento superficial de un sector del talud del muro",
        event_type: CRITICAL_PARAMETERS,
        parameter: TOPOGRAPHY
    },
    state: "B",
    target: {
        canonical_name: 'el-mauro',
        id: "-8U8Q2g2VtKQKySNzd0w7Q",
        name: 'El mauro',
        work_sites: [{
            entity: { name: 'Minera Los Pelambres' },
            name: 'Faena Los Pelambres'
        }],
        zone: {
            natural_key: 'cl.coquimbo.choapa.los-vilos',
            type: 'comuna',
            zone_hierarchy: [
                {name: 'Chile', natural_key: 'cl', type: 'pais'},
                {name: 'Coquimbo', natural_key: 'cl.coquimbo', type: 'region'},
                {name: 'Choapa', natural_key: 'cl.coquimbo.choapa', type: 'provincia'}
            ]
        }
    },
    updated_at: moment(),
    name: "Deslizamiento superficial de un sector del talud del muro"
};


export function getTicket(newValues) {
    if (!newValues) return ticket;
    return {...ticket, ...newValues};
}
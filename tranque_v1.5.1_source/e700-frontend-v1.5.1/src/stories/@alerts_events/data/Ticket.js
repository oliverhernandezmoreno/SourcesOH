import moment from 'moment';

export const ticket = {
    archived: false,
    children: [],
    closable: false,
    close_conditions: [],
    archive_conditions: [],
    escalate_conditions: [],
    public_alert_abstract: '',
    created_at: moment(),
    evaluable: true,
    id: "w9w5ffEPUhyZb6Wjoy-0xA",
    parents: [],
    result_state: {
        level: 2,
        message: "Deslizamiento superficial de un sector del talud del muro",
        short_message: "Deslizamiento superficial de un sector del talud del muro",
        reason: "exceed",
        parameter: "earthquake"
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
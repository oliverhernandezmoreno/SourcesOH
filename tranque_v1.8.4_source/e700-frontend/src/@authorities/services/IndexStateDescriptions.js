import {RED_ALERT, YELLOW_ALERT, WITH_EVENTS,
    WITHOUT_ALERT, NOT_CONFIGURED} from '@authorities/constants/indexState';

const descriptions = [
    {
        name: 'EMAC-IR-estandar',
        notEnabled: 'El índice no ha sido configurado y es incapaz de calcular un resultado. ' +
                'La compañía minera no ha habilitado [no ha ingresado suficientes estaciones de monitoreo para]' +
                'el uso de este índice.',
        notAffected: 'El índice no ha sido afectado. ' +
                 'Ninguna variable ha excedido el valor de referencia establecido por el estándar de Programa Tranque, ' +
                 'en ningún punto de monitoreo aguas abajo.',
        withoutAlerts: 'El índice ha sido afectado, aunque no se reúnen condiciones necesarias para activar una alerta interna. ' +
                    'Las alertas en este índice no son públicas. ' +
                   'Existe al menos una variable que ha excedido el valor de referencia establecido por el estándar de Programa Tranque.',
        yellow: 'El índice ha sido afectado y está asociado a una alerta amarilla. ' +            
            ' Una alerta amarilla gatillada por la afectación de este índice, se origina por 2 posibles motivos:\n\n' +
            '1) Al menos una variable ha excedido el valor de referencia establecido por el estándar de Programa Tranque,' +
            'en 2 puntos de monitoreo aguas abajo, dentro del mismo mes (o 30 días).\n\n' +
            '2) Al menos una variable ha excedido el valor de referencia establecido por el estándar de Programa Tranque, en el mismo punto de monitoreo aguas abajo, en 3 meses consecutivos.',
        red: '--'
    },
    {
        name: 'EMAC-IR-SINestandar',
        notEnabled: 'El índice no ha sido configurado y es incapaz de calcular un resultado. ' +
                'La compañía minera no ha habilitado [no ha cumplido con las precondiciones para] el uso de este índice.',
        notAffected: 'El índice no ha sido afectado. ' +
                 'Ninguna variable ha excedido el valor de referencia establecido por RCA ' +
                 '(u otros compromisos ambientales definidos entre la minera y la autoridad) ,' +
                 'en ningún punto de monitoreo aguas abajo.',
        withoutAlerts: 'El índice ha sido afectado, aunque no se reúnen condiciones necesarias para activar una alerta pública. ' +
                   'Existe al menos una variable que ha excedido el valor de referencia establecido por RCA ' +
                   '(u otros compromisos ambientales definidos entre la minera y la autoridad).',
        yellow: 'El índice ha sido afectado y está asociado a una alerta pública. ' +
            '[Si al momento de afectación de este índice ya existe un estado de alerta pública,' +
            ' no se gatillará un nuevo estado de alerta pública, sino que la plataforma pone a disposición la información,' +
            ' para que sea gestionada dentro del estado de alerta ya existente.] ' +
            'Una alerta amarilla gatillada por la afectación de este índice, se origina por 2 posibles motivos:\n\n' +
            '1) Al menos una variable ha excedido el valor de referencia establecido por RCA' +
            ' (u otros compromisos ambientales definidos entre la minera y la autoridad), ' +
            'en 2 puntos de monitoreo aguas abajo, dentro del mismo mes (o 30 días).\n\n' +
            '2) Al menos una variable ha excedido el valor de referencia establecido por RCA' +
            ' (u otros compromisos ambientales definidos entre la minera y la autoridad),' +
            ' en el mismo punto de monitoreo aguas abajo, en 3 meses consecutivos.',
        red: '--'
    },
    {
        name: 'EF-publico',
        notEnabled: 'El índice no ha sido configurado y es incapaz de calcular un resultado.',
        notAffected: 'El índice no ha sido afectado. ' +
                 'Ningún parámetro de consideración ha excedido algún valor de referencia definido por los ingenieros expertos en depósitos de relaves.',
        withoutAlerts: '--' ,
        yellow: 'El índice ha sido afectado y está asociado a una alerta amarilla pública.',
        red: '--'
    },
    {
        name: 'EF-interno',
        notEnabled: 'El índice no ha sido configurado y es incapaz de calcular un resultado.',
        notAffected: 'El índice no ha sido afectado.' +
                 'Ningún parámetro de consideración ha excedido algún valor de referencia definido por los ingenieros expertos en depósitos de relaves.',
        withoutAlerts: 'El índice ha sido afectado, aunque no se reúnen condiciones necesarias para activar una alerta interna. ' +
                   'Existe al menos un parámetro de consideración que ha excedido algún valor de referencia definido por los ingenieros expertos en depósitos de relaves.',
        yellow: 'El índice ha sido afectado y está asociado a una alerta amarilla interna.',
        red: '--'
    }
];


/**
* Function triggered to get an index state description.
*
* @param {name} the index name.
* @param {indexValue} an index value (state).
* @public
*/
export const getDescription = (name, indexValue) => {
    const indexData = descriptions.find((item) => item.name === name);
    switch(indexValue) {
        case RED_ALERT: return indexData.red;
        case YELLOW_ALERT: return indexData.yellow;
        case WITH_EVENTS: return indexData.withoutAlerts;
        case WITHOUT_ALERT: return indexData.notAffected;
        case NOT_CONFIGURED: return indexData.notEnabled;
        default: return '';
    }
}

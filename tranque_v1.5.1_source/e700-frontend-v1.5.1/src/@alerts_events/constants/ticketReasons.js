import React from 'react';
import {getGroup, isAlert} from '@alerts_events/constants/ticketGroups';

// Strings according to ones in backend
export const EXCEED = 'exceed';
export const BY_USER = 'byUser';
export const DELAY = 'delay';
export const COMBINE = 'combine';
export const INSTRUMENT_FAIL = 'instrument-fail';
export const NO_MINIMUM_INSTRUMENTATION = 'minimum-instrument';

export const EARTHQUAKE = 'earthquake';
export const DEFORMATIONS = 'deformations';
export const PORE_PRESSURE = 'porePressure';
export const OVERFLOW_POTENTIAL = 'overflow-potential';
export const INSPECTIONS = 'inspections';
export const TOPOGRAPHY = 'topography';
export const DUMP = 'emergency-dump';
export const TONNAGE = 'tonnage';


export function getTitle(ticket) {
    if (isAlert(getGroup(ticket))) {
        return (<b>{ticket.result_state.short_message}</b>);
    }
    switch(ticket.result_state.reason) {
        case EXCEED:
            return (<>
                <b>Superación de umbrales</b> en datos de <b>{getParameterName(ticket)}</b>
            </>);
        case BY_USER:
            return (<>
                {ticket.created_by ? <b>{ticket.created_by} </b> : 'Un usuario '}
            reporta problemas en <b>{getParameterName(ticket)}</b>
            </>);
        case DELAY:
            return (<>
                <b>Retraso</b> en el ingreso de datos en <b>{getParameterName(ticket)}</b>
            </>);
        case COMBINE:
            return (<>
            Combinación de tickets
            </>);
        case INSTRUMENT_FAIL:
            return (<>
                <b>Falla instrumental</b> asociada a <b>{getParameterName(ticket)}</b>
            </>);
        case NO_MINIMUM_INSTRUMENTATION:
            return (<>
                No se cumple con <b>instrumentación mínima</b> en <b>{getParameterName(ticket)}</b>
            </>);
        default: return ticket.name || '';
    }
}

function getParameterName(ticket) {
    switch(ticket.result_state.parameter) {
        case EARTHQUAKE:
            return 'Aceleraciones sísmicas';
        case DEFORMATIONS:
            return 'Deformaciones';
        case PORE_PRESSURE:
            return 'Presión de poros';
        case OVERFLOW_POTENTIAL:
            return 'Potencial de rebalse';
        case INSPECTIONS:
            return 'Inspecciones';
        case TOPOGRAPHY:
            return 'Topografía';
        case DUMP:
            return 'Vertedero de emergencia';
        case TONNAGE:
            return 'Tonelaje';
        default: return 'datos de del depósito';
    }

}
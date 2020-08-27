import React from 'react';
import {getGroup, isAlert} from '@alerts_events/constants/ticketGroups';

// Strings according to ones in backend
export const VULNERABILITY = 'vulnerability';
export const DAILY_INSPECTION = 'daily_inspection';
export const INSPECTION_DELAY = 'inspection-delay';
export const CRITICAL_PARAMETERS = 'critical-parameters';
export const FAILURE_SCENARIO = 'failure_scenario';
export const ONLINE_INSTRUMENTATION = 'online_instrumentation';
export const MANUAL_MONITORING_DELAY = 'manual_monitoring_delay';
export const MINIMUM_INSTRUMENTATION = 'minimum_instrumentation';

export const INSPECTIONS = 'inspections';
export const PCIE = 'pcie';
export const OVERFLOW_POTENTIAL = 'overflow-potential';
export const DEFORMATIONS = 'deformations';
export const DOCUMENTS = 'documents';
export const TOPOGRAPHY = 'topography';
export const EARTHQUAKE = 'earthquake';
export const PORE_PRESSURE = 'porePressure';
export const FLOWMETER = 'flowmeter';
export const TURBIDIMETER = 'turbidimeter';
export const GRANULOMETRY = 'granulometry';
export const DUMP = 'emergency-dump';
export const TONNAGE = 'tonnage';


export function getTitle(ticket) {
    if (isAlert(getGroup(ticket))) {
        return (<b>{ticket.result_state.short_message}</b>);
    }
    switch(ticket.result_state.event_type) {
        case VULNERABILITY:
            return 'Problema reportado en una inspección mensual';
        case DAILY_INSPECTION:
            return 'Problema reportado en una inspección diaria';
        case INSPECTION_DELAY:
            return 'Retraso en el ingreso de la inspección diaria o mensual';
        case CRITICAL_PARAMETERS:
            return (<>Problema con <b>{getParameterName(ticket)}</b></>);
        case FAILURE_SCENARIO:
            return (<>Escenario de falla: <b>{getParameterName(ticket)}</b></>);
        case ONLINE_INSTRUMENTATION:
            return 'Problema con instrumentación en línea';
        case MANUAL_MONITORING_DELAY:
            return 'Retraso en el ingreso de datos no sensorizados(ingreso manual)';
        case MINIMUM_INSTRUMENTATION:
            return 'Incumplimiento de instrumentación mínima';
        default: return ticket.name || ''
    }
}

function getParameterName(ticket) {
    if (ticket.result_state.event_type === FAILURE_SCENARIO) {
        return ticket.result_state.parameter;
    }
    switch(ticket.result_state.parameter) {
        case INSPECTIONS:
            return 'Inspecciones';
        case PCIE:
            return 'Escalamiento PCIE';
        case OVERFLOW_POTENTIAL:
            return 'Potencial de rebalse';
        case DEFORMATIONS:
            return 'Deformaciones';
        case DOCUMENTS:
            return 'Documentos';
        case TOPOGRAPHY:
            return 'Topografía';
        case EARTHQUAKE:
            return 'Aceleraciones sísmicas';
        case PORE_PRESSURE:
            return 'Presión de poros';
        case FLOWMETER:
            return 'Caudalímetro';
        case TURBIDIMETER:
            return 'Turbidímetro';
        case GRANULOMETRY:
            return 'Densidad y granulometría';
        case DUMP:
            return 'Vertedero';
        case TONNAGE:
            return 'Tonelaje';
        default: return '';
    }
}
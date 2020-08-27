import React from 'react';
import theme from '@miners/theme';
import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import DescriptionSection from '@alerts_events/components/ticket/detail/DescriptionSection';
import {getTicket, ticket} from './data/Ticket';
import { VULNERABILITY, DAILY_INSPECTION, INSPECTION_DELAY, CRITICAL_PARAMETERS, FAILURE_SCENARIO,
    ONLINE_INSTRUMENTATION, MANUAL_MONITORING_DELAY, MINIMUM_INSTRUMENTATION,
    INSPECTIONS, PCIE, OVERFLOW_POTENTIAL, DEFORMATIONS, DOCUMENTS, TOPOGRAPHY, EARTHQUAKE,
    PORE_PRESSURE, FLOWMETER, TURBIDIMETER, GRANULOMETRY, DUMP, TONNAGE } from '@alerts_events/constants/ticketReasons';
import { getUser } from 'stories/data/User';

const divStyle = {
    backgroundColor: theme.palette.secondary.light,
    color: '#ffffff'
};

function getDescriptionSection(event_type, parameter) {
    return (<div style={divStyle}>
        <DescriptionSection
            ticket={getTicket({
                result_state: {...ticket.result_state, event_type, parameter, message: '[Descripción]...'}
            })}
            logs={[]}
            onDownload={() => {}}
            onAuthorizationDownload={() => {}}
            user={getUser()}
        />
    </div>);
}

storiesOf('Alerts&Events/ticket-detail/DescriptionSection', module)
    .addDecorator(muiTheme([theme]))
    .add('Monthly Inspections (vulnerability)', () => getDescriptionSection(VULNERABILITY, null))
    .add('Daily inspections(Triggers, Design, Forecasts)', () => getDescriptionSection(DAILY_INSPECTION, null))
    .add('Inspections delay', () => getDescriptionSection(INSPECTION_DELAY, null))
    .add('Failure scenarios', () => getDescriptionSection(FAILURE_SCENARIO, '[Nombre del escenario de falla]'))
    .add('Online instrumentation', () => getDescriptionSection(ONLINE_INSTRUMENTATION, null))
    .add('Manual monitoring delay', () => getDescriptionSection(MANUAL_MONITORING_DELAY, null))
    .add('Minimum instrumentation', () => getDescriptionSection(MINIMUM_INSTRUMENTATION, null))

storiesOf('Alerts&Events/ticket-detail/DescriptionSection/Critical parameters', module)
    .addDecorator(muiTheme([theme]))
    .add('Inspections', () => getDescriptionSection(CRITICAL_PARAMETERS, INSPECTIONS))
    .add('PCIE Escalate', () => getDescriptionSection(CRITICAL_PARAMETERS, PCIE))
    .add('Overflow potential', () => getDescriptionSection(CRITICAL_PARAMETERS, OVERFLOW_POTENTIAL))
    .add('Deformations', () => getDescriptionSection(CRITICAL_PARAMETERS, DEFORMATIONS))
    .add('Documents', () => getDescriptionSection(CRITICAL_PARAMETERS, DOCUMENTS))
    .add('Topography', () => getDescriptionSection(CRITICAL_PARAMETERS, TOPOGRAPHY))
    .add('Seismic acceleration', () => getDescriptionSection(CRITICAL_PARAMETERS, EARTHQUAKE))
    .add('Pore pressure', () => getDescriptionSection(CRITICAL_PARAMETERS, PORE_PRESSURE))
    .add('Flowmeter', () => getDescriptionSection(CRITICAL_PARAMETERS, FLOWMETER))
    .add('Turbidimeter', () => getDescriptionSection(CRITICAL_PARAMETERS, TURBIDIMETER))
    .add('Density & granulometry', () => getDescriptionSection(CRITICAL_PARAMETERS, GRANULOMETRY))
    .add('Dump', () => getDescriptionSection(CRITICAL_PARAMETERS, DUMP))
    .add('Tonnage', () => getDescriptionSection(CRITICAL_PARAMETERS, TONNAGE))

storiesOf('Alerts&Events/ticket-detail/DescriptionSection', module)
    .addDecorator(muiTheme([theme]))
    .add('Long title', () => getDescriptionSection(
        FAILURE_SCENARIO,
        '[Nombre muy largo para un escenario de falla, la idea es que se corte con 3 puntos, formando una sola línea en este título. Si se ve más de una línea en este título, se requerirá una corrección de estilo]'
    ))

import React from 'react';
import {Provider} from 'react-redux';
import {configureStore} from '@app/store';
import moment from 'moment';
import theme from '@authorities/theme';
import {storiesOf} from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import CssBaseline from '@material-ui/core/CssBaseline';
import MonitoringTable from '@authorities/components/home/MonitoringTable';
import {parseZoneOptions} from '@app/services/backend/zone';
import {generateTableData} from '@authorities/services/home/dataFieldsGenerator';
import {ZONEINFO} from 'stories/data/zoneInfo';
import {COMMUNES} from 'stories/data/communes';
import {exampleData, exampleIndexes} from 'stories/@authorities/data/GeneralHomeData';

const regions = parseZoneOptions(ZONEINFO);
const store = configureStore();

/**
 * Function triggered to generate index data.
 *
 * @param {values} the info with values and index type.
 * @public
 */
function getOneTargetIndexes(values) {
    let indexes = [];
    for (var i = 0; i < values.length; i ++) {
        const indexType = values[i];
        let templateName = 'Índice de riesgo';
        if (indexType.template_name === ".ii") templateName = 'índice de impacto';
        for (var j = 0; j < indexType.values.length; j ++) {
            const value = indexType.values[j];
            indexes.push({events: [{value: value}],
                thresholds: [{upper: "1.0", lower: "0.0"}],
                target_canonical_name: "deposito",
                name: templateName + ' -- Prueba',
                template_name: indexType.template_name})
        }
    }

    return indexes;
}


/* HEADERS AVAILABILITY */
const availability = {efPublico: true, indiceRiesgo: true,
    efInterno: true, indiceRiesgoEstandar: true,
    indiceImpacto: true, monitoreoRemoto: true};

const availability2 = {efPublico: true, indiceRiesgo: false,
    efInterno: false, indiceRiesgoEstandar: true,
    indiceImpacto: true, monitoreoRemoto: false};


/* DIFFERENT SEMAPHORE COLOR TEST */
const diffData = [
    { "name": "(green)target", "state_description": "Activo", "canonical_name": "target1" },
    { "name": "(yellow)target", "state_description": "Activo", "canonical_name": "target2"},
    { "name": "(events=null)target", "state_description": "Activo", "canonical_name": "target3"},
    { "name": "(value=null)target", "state_description": "Activo", "canonical_name": "target4"},
    { "name": "(thresholds=null)target", "state_description": "Activo", "canonical_name": "target5"},
    { "name": "(upper=lower=null)target", "state_description": "Activo", "canonical_name": "target6"},
    { "name": "(none)target", "state_description": "Activo", "canonical_name": "target7" },
];
const diffIndexes = [
    { "events": [{"value": 1}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "target1",
        "name": "Índice de riesgo -- Prueba", template_name: ".ir" },
    { "events": [{"value": 2}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "target2",
        "name": "Índice de riesgo -- Prueba", template_name: ".ir" },
    { "events": null, "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "target3",
        "name": "Índice de riesgo -- Prueba", template_name: ".ir" },
    { "events": [{"value": null}], "thresholds": [{"upper": "1.0", "lower": "0.0"}], "target_canonical_name": "target4",
        "name": "Índice de riesgo -- Prueba", template_name: ".ir" },
    { "events": [{"value": 1}], "thresholds": null, "target_canonical_name": "target5",
        "name": "Índice de riesgo -- Prueba", template_name: ".ir" },
    { "events": [{"value": 1}], "thresholds": [{"upper": null, "lower": null}], "target_canonical_name": "target6",
        "name": "Índice de riesgo -- Prueba", template_name: ".ir" },
]


/* 1000 ROWS */
const muchData = [];
for (var i = 0; i < 1000; i++) {
    muchData[i] = { "name": "[Nombre]", "state_description": "[Estado]", "work_sites": [{"name": "[Faena]", "entity":{"name":"[Empresa]"}}],
        "zone": COMMUNES[8], "remote":{"last_seen": moment()}, "canonical_name": i.toString() };
}


/* VALUE CASES */
/*IR: Indice de riesgo */

const valueCaseData = [{ "name": "Depósito de prueba", "state_description": "Activo", "canonical_name": "deposito"}];
// Arrange: valueCase1
// Assert: Índice de riesgo sin alertas
const valueCase1 = [{values: [0.5, 0.5, null, 0.5, 0.5, 0.5, 0.5, 0.5], template_name: ".ir"},
    {values: [0.5, 0.5, 0.5], template_name: ".ii"}];
// Arrange: valueCase2
// Assert: Índice de riesgo (estandar) con alerta amarilla
const valueCase2 = [{values: [null, 0.5, 0.5, 0.5, 0.5, 2, 0.5, 0.5], template_name: ".ir"},
    {values: [0.5, 0.5, 0.5], template_name: ".ii"}];
// Arrange: valueCase3
// Assert: Índice de riesgo (estandar) con alerta amarilla
const valueCase3 = [{values: [null, null, null], template_name: ".ir"},
    {values: [0.5, 0.5, 0.5], template_name: ".ii"}];


/* LONG NAMES */
const longNamesData = [
    { "name": "Nombre largo para un depósito de relaves en Chile",
        "work_sites": [{"name": "Nombre largo de faena para un depósito de relaves",
            "entity":{"name":"Nombre largo de una empresa para un depósito de relaves"}}],
        "zone": COMMUNES[0] }
];


/* ACT */
storiesOf('Authorities/MonitoringTable', module)
    .addDecorator(muiTheme([theme]))
    .addDecorator(story => <Provider store={store}>{story()}</Provider>)
    .add('General example (10 rows)', () => (
        <CssBaseline>
            <MonitoringTable
                data={generateTableData(exampleData, exampleIndexes, [], availability)}
                regions={regions}
            />
        </CssBaseline>
    ))
    .add('Without data', () => (
        <CssBaseline>
            <MonitoringTable
                data={generateTableData([], exampleIndexes, [], availability)}
                regions={regions}
            />
        </CssBaseline>
    ))
    .add('With 1000 rows', () => (
        <CssBaseline>
            <MonitoringTable
                data={generateTableData(muchData, exampleIndexes, [], availability)}
                regions={regions}
            />
        </CssBaseline>
    ))
    .add('With hidden columns', () => (
        <CssBaseline>
            <MonitoringTable
                data={generateTableData(exampleData, exampleIndexes, [], availability2)}
                regions={regions}
                availability={availability2}
                noEventsSwitch
            />
        </CssBaseline>
    ))
    .add('Different index values', () => (
        <CssBaseline>
            <MonitoringTable
                data={generateTableData(diffData, diffIndexes, [], availability2)}
                regions={regions}
                availability={availability2}
                noEventsSwitch
            />
        </CssBaseline>
    ))
    .add('Multiple index values per type (IR verde)', () => (
        <CssBaseline>
            <MonitoringTable
                data={generateTableData(valueCaseData, getOneTargetIndexes(valueCase1), [], availability2)}
                regions={regions}
                availability={availability2}
                noEventsSwitch
            />
        </CssBaseline>
    ))
    .add('Multiple index values per type (IR amarillo)', () => (
        <CssBaseline>
            <MonitoringTable
                data={generateTableData(valueCaseData, getOneTargetIndexes(valueCase2), [], availability2)}
                regions={regions}
                availability={availability2}
                noEventsSwitch
            />
        </CssBaseline>
    ))
    .add('Multiple index values per type (IR gris)', () => (
        <CssBaseline>
            <MonitoringTable
                data={generateTableData(valueCaseData, getOneTargetIndexes(valueCase3), [], availability2)}
                regions={regions}
                availability={availability2}
                noEventsSwitch
            />
        </CssBaseline>
    ))
    .add('Long target name, work and entity', () => (
        <CssBaseline>
            <MonitoringTable
                data={generateTableData(longNamesData, exampleIndexes, [], availability2)}
                regions={regions}
                availability={availability2}
                noEventsSwitch
            />
        </CssBaseline>
    ))

import React from 'react';
import {Provider} from 'react-redux';
import {configureStore} from '@app/store';
import theme from '@authorities/theme';
import {storiesOf} from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import CssBaseline from '@material-ui/core/CssBaseline';
import MonitoringAlertsEvents from '@authorities/components/home/MonitoringAlertsEvents';
import { PENDING, APPROVED, DENIED } from '@alerts_events/constants/authorizationStates';



const store = configureStore();

const ticketsData = [
    {
        "id": "tT9pZwkxVMWFvtNF4oJysA",
        "target": {
            "canonical_name": 'el-mauro'
        },
        "module_name": "Deslizamiento superficial de un sector del talud del muro",
        "created_at": "2020-01-16T18:00:09.887489Z",
        "updated_at": "2020-03-20T16:00:13.454886Z",
        "module": "_.ef.m1.level2.deslizamiento-menor",
        "state": "B",
        "result_state": {
            "level": 2,
            "message": "Deslizamiento superficial de un sector del talud del muro",
            "short_message": "Deslizamiento superficial de un sector del talud del muro"
        },
        "close_conditions": [],
        "spread_object": null,
        "archived": false,
        "evaluable": true,
        "base_module": "ef.m1.level2.deslizamiento-menor"
    },
    {
        "id": "eLOewoQgVUuQCL7F9_tXzQ",
        "target": {
            "canonical_name": 'el-mauro'
        },
        "module_name": "Presencia de grietas en el muro",
        "created_at": "2020-01-16T18:00:09.842290Z",
        "updated_at": "2020-03-20T16:00:13.443556Z",
        "module": "_.ef.pc.grietas",
        "state": "B1",
        "result_state": {
            "level": 2,
            "message": "Presencia de grietas en el muro",
            "short_message": "Presencia de grietas en el muro"
        },
        "close_conditions": [],
        "spread_object": null,
        "archived": false,
        "evaluable": true,
        "base_module": "ef.pc.grietas"
    },
    {
        "id": "joBwEggzVIm9FpAvke4ZlA",
        "target": {
            "canonical_name": 'el-mauro'
        },
        "module_name": "Terremoto",
        "created_at": "2020-01-16T18:00:09.865213Z",
        "updated_at": "2020-03-20T16:00:13.429154Z",
        "module": "_.ef.m1.level2.terremoto-4-6",
        "state": "B",
        "result_state": {
            "level": 2,
            "message": "Terremoto",
            "short_message": "Terremoto"
        },
        "close_conditions": [],
        "spread_object": null,
        "archived": false,
        "evaluable": true,
        "base_module": "ef.m1.level2.terremoto-4-6"
    }
];

function getRequest(authorizationString, status, scope) {
    return {
        authorization: authorizationString,
        created_at: "2020-05-12T16:03:51.240897Z",
        id: "uobaQjSEU7q31DvZqdtQsg",
        resolved_at: '',
        resolved_by: '',
        status: status,
        ticket: { scope }
    }
}

const EF = 'ef';
const EMAC = 'emac';

// Arbitrary requests
const requests = [
    getRequest('ticket.B.close.authorization.miner-2', PENDING, EMAC),
    getRequest('ticket.B.close.authorization.miner-2', APPROVED, EMAC),
    getRequest('ticket.B.close.authorization.miner-2', DENIED, EMAC),
    getRequest('ticket.B.escalate.C.authorization.miner-2', PENDING, EF),
    getRequest('ticket.B.escalate.C.authorization.miner-2', APPROVED, EF),
    getRequest('ticket.B.escalate.C.authorization.miner-2', APPROVED, EMAC),
    getRequest('ticket.B.escalate.C.authorization.miner-2', DENIED, EMAC),
    getRequest('ticket.RED.escalate.YELLOW.authorization.authority-3', PENDING, EF),
    getRequest('ticket.B.archive.authorization.miner-2', PENDING, EF),
    getRequest('ticket.B.archive.authorization.miner-2', PENDING, EMAC),
    getRequest('ticket.B.archive.authorization.miner-2', APPROVED, EMAC),
    getRequest('ticket.B.archive.authorization.miner-2', DENIED, EMAC)
];

/* ACT */
storiesOf('Authorities/MonitoringAlertsEvents', module)
    .addDecorator(muiTheme([theme]))
    .addDecorator(story => <Provider store={store}>{story()}</Provider>)
    .add('General example', () => (
        <CssBaseline>
            <MonitoringAlertsEvents
                data={ticketsData}
                requests={requests}
            />
        </CssBaseline>
    ));

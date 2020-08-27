import React from 'react';
import {Provider} from 'react-redux';
import {configureStore} from '@app/store';
import theme from '@authorities/theme';
import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';

import PublicMonitorTable from '@communities/components/list/PublicMonitorTable';

const store = configureStore();

const data = [{
    "name":"Target1 (none)", "canonical_name":"target1", "work":"WORK1", "state":"Abandonado", "entity":"ENTITY1",
    "region": {"name":"Coquimbo", "key":"cl.coquimbo"},
    "province": {"name":"Elqui", "key":"cl.coquimbo.elqui"},
    "commune": {"name":"La Higuera", "key":"cl.coquimbo.elqui.la-higuera"},
    "publicWorstIndex":-2
},
{
    "name":"Target2 (not configure)", "canonical_name":"target2", "work":"WORK2", "state":"Abandonado", "entity":"ENTITY2",
    "region": {"name":"Coquimbo", "key":"cl.coquimbo"},
    "province": {"name":"Elqui", "key":"cl.coquimbo.elqui"},
    "commune": {"name":"La Higuera", "key":"cl.coquimbo.elqui.la-higuera"},
    "publicWorstIndex":-1
},
{
    "name":"Target3", "canonical_name":"target3", "work":"WORK3", "state":"Abandonado", "entity":"ENTITY3",
    "region": {"name":"Coquimbo", "key":"cl.coquimbo"},
    "province": {"name":"Elqui", "key":"cl.coquimbo.elqui"},
    "commune": {"name":"La Higuera", "key":"cl.coquimbo.elqui.la-higuera"},
    "publicWorstIndex":0
},
{
    "name":"Target4 (yellow)", "canonical_name":"target4", "work":"WORK4", "state":"Abandonado", "entity":"ENTITY4",
    "region": {"name":"Coquimbo", "key":"cl.coquimbo"},
    "province": {"name":"Elqui", "key":"cl.coquimbo.elqui"},
    "commune": {"name":"La Higuera", "key":"cl.coquimbo.elqui.la-higuera"},
    "publicWorstIndex":2
},
{
    "name":"Target5 (red)", "canonical_name":"target5", "work":"WORK5", "state":"Abandonado", "entity":"ENTITY5",
    "region": {"name":"Coquimbo", "key":"cl.coquimbo"},
    "province": {"name":"Elqui", "key":"cl.coquimbo.elqui"},
    "commune": {"name":"La Higuera", "key":"cl.coquimbo.elqui.la-higuera"},
    "publicWorstIndex":3
},
{
    "name":"Target6 (null)", "canonical_name":"target6", "work":"WORK6", "state":"Abandonado", "entity":"ENTITY6",
    "region": {"name":"Coquimbo", "key":"cl.coquimbo"},
    "province": {"name":"Elqui", "key":"cl.coquimbo.elqui"},
    "commune": {"name":"La Higuera", "key":"cl.coquimbo.elqui.la-higuera"},
    "publicWorstIndex": null
},
{
    "name":"Target7 (undefined)", "canonical_name":"target7", "work":"WORK7", "state":"Abandonado", "entity":"ENTITY7",
    "region": {"name":"Coquimbo", "key":"cl.coquimbo"},
    "province": {"name":"Elqui", "key":"cl.coquimbo.elqui"},
    "commune": {"name":"La Higuera", "key":"cl.coquimbo.elqui.la-higuera"},
    "publicWorstIndex": undefined
}]

storiesOf('Communities/PublicMonitorTable', module)
    .addDecorator(muiTheme([theme]))
    .addDecorator(story => <Provider store={store}>{story()}</Provider>)
    .add('Semaphores example', () => (
        <PublicMonitorTable
            data={data}
            title="Depósitos de relaves"
            commune='cl.coquimbo.elqui.la-higuera'
        />
    )
    )
    .add('No data (empty array)', () => (
        <PublicMonitorTable
            data={[]}
            title="Depósitos de relaves"
            commune='cl.coquimbo.elqui.la-higuera'
        />
    )
    )
    .add('Null data', () => (
        <PublicMonitorTable
            data={null}
            title="Depósitos de relaves"
            commune='cl.coquimbo.elqui.la-higuera'
        />
    )
    )
    .add('Undefined data', () => (
        <PublicMonitorTable
            data={undefined}
            title="Depósitos de relaves"
            commune='cl.coquimbo.elqui.la-higuera'
        />
    )
    )



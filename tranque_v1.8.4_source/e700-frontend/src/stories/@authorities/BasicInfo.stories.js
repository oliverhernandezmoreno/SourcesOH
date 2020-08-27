import React from 'react';

import theme from '@authorities/theme';
import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';

import BasicInfo from '@authorities/components/target/BasicInfo';

const data = {
    "id":0,
    "zone": {
        "natural_key":"cl.coquimbo.choapa.los-vilos",
        "zone_hierarchy":[
            {
                "natural_key":"cl",
                "natural_name":"cl",
                "name":"Chile",
                "canonical_name":"cl",
                "type":"pais"
            },
            {
                "natural_key":"cl.coquimbo",
                "natural_name":"cl.coquimbo",
                "name":"Coquimbo",
                "canonical_name":"coquimbo",
                "type":"region"
            },
            {
                "natural_key":"cl.coquimbo.choapa",
                "natural_name":"cl.coquimbo.choapa",
                "name":"Choapa",
                "canonical_name":"choapa",
                "type":"provincia"
            }
        ],
        "natural_name":"cl.coquimbo.choapa.los-vilos",
        "name":"Los Vilos",
        "canonical_name":"los-vilos",
        "type":"comuna"
    },
    "work_sites":[{
        "name":"FAENA LOS PELAMBRES",
        "entity":{"id":"minera-los-pelambres","name":"MINERA LOS PELAMBRES","meta":{}}
    }],
    "remote":null,
    "name":"Depósito Piloto",
    "canonical_name":"el-mauro",
    "meta": {
        "work":{"name":"Faena","value":"FAENA LOS PELAMBRES"},
        "entity":{"name":"Empresa","value":"MINERA LOS PELAMBRES"},
        "resource":{"name":"Recurso","value":"COBRE-MOLIBDENO"},
        "current_tons":{"name":"Tonelaje actual (t)","value":507842833},
        "approved_tons":{"name":"Tonelaje aprobado (t)","value":1700000000},
        "current_volume":{"name":"Volumen actual","value":338561888},
        "approved_volume":{"name":"Volumen aprobado (m³)","value":1133333333}
    },
    "type":"tranque-de-relave",
    "state":"activo"
};


storiesOf('Authorities/BasicInfo', module)
    .addDecorator(muiTheme([theme]))
    .add('Example', () => (<BasicInfo data={data}/>))
    .add('No info', () => (<BasicInfo data={{}}/>))

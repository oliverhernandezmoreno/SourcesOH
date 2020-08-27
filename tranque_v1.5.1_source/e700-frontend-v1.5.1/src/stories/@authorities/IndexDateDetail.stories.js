import React from 'react';

import theme from '@authorities/theme';
import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';

import IndexDateDetail from '@authorities/components/target/index/IndexDateDetail';

const date = "28-10-2019 00:00";
const description = 'El índice ha sido afectado y está asociado a una alerta amarilla pública.' +
'[Si al momento de afectación de este índice ya existe un estado de alerta público,' +
' no se gatillará un nuevo estado de alerta, sino que la plataforma pone a disposición la información,' +
' para que sea gestionada dentro del estado de alerta ya existente.]' +
' Una alerta amarilla gatillada por la afectación de este índice, se origina por 2 posibles motivos:\n' +
'1) Al menos una variable ha excedido el valor de referencia establecido por el estándar de Programa Tranque,' +
'en 2 puntos de monitoreo aguas abajo, dentro del mismo mes (o 30 días).\n' +
'2) Al menos una variable ha excedido el valor de referencia establecido por el estándar de Programa Tranque, en el mismo punto de monitoreo aguas abajo, en 3 meses consecutivos.';

storiesOf('Authorities/IndexDateDetail', module)
    .addDecorator(muiTheme([theme]))
    .add('General Example', () => (<IndexDateDetail date={date} stateDescription={description}/>));

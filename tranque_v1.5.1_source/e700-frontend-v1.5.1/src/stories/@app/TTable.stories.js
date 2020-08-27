import React from 'react';

import theme from '../../@authorities/theme';

import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
//import { action } from '@storybook/addon-actions';

import { Button } from '@material-ui/core';
import LockIcon from '@material-ui/icons/Lock';
import VisibilityIcon from '@material-ui/icons/Visibility';
import PanoramaFishEyeIcon from '@material-ui/icons/PanoramaFishEye';
import LensIcon from '@material-ui/icons/Lens';

import TTable from '@app/components/utils/TTable';
import IconTextGrid from '@app/components/utils/IconTextGrid';


const { success, warning } = theme.palette;

//Data for simple table
const SimpleHeaders = ["Campo 1", "Campo 2", "Campo 3"];
const SimpleData = [["row1col1", "row1col2", "row1col3"],
    ["row2col1", "row2col2", "row2col3"],
    ["row3col1", "row3col2", "row3col3"]];


//Data for a table of miners web site
const WSCheader = ["Nombre de depósito", "Estado", "Monitoreo y datos"];
const WSCdata = [["Depósito Piloto", "activo",
    (<div>
        <Button variant="contained" color="primary"> ESTABILIDAD FÍSICA </Button>
        <Button variant="contained" color="primary"> AGUAS CIRCUNDANTES </Button>
        <Button variant="contained" color="primary"> FORMULARIOS E700 </Button>
    </div>)
]];




//Data for Authorities web site

//"Autoridades" > "Índices actuales"
const IAheaders = ["Índice",
    (<IconTextGrid icon={<LockIcon/>} text="Estatus del índice estándar plataforma"/>),
    (<IconTextGrid icon={<VisibilityIcon/>} text="Estatus del índice otras normativas"/>) ];
const IAdata = [
    ["Estabilidad Física",
        (<IconTextGrid icon={<PanoramaFishEyeIcon style={{ fill: warning.main }}/>} text="Con eventos"/>),
        (<IconTextGrid icon={<LensIcon style={{ fill: success.main }}/>} text="Sin alerta"/>)
    ],
    ["Estabilidad Física",
        (<IconTextGrid icon={<PanoramaFishEyeIcon style={{ fill: warning.main }}/>} text="Con eventos"/>),
        (<IconTextGrid icon={<LensIcon style={{ fill: success.main }}/>} text="Sin alerta"/>)
    ],
];





storiesOf('TTable', module)
    .addDecorator(muiTheme([theme]))
    .add('Simple Table',
        () => (<TTable headers={SimpleHeaders} rowData={SimpleData} /> ))
    .add('Table based on web site for Mineras',
        () => (<TTable headers={WSCheader} rowData={WSCdata} /> ))
    .add('Table based on wireframes for Autoridades',
        () => (<TTable headers={IAheaders} rowData={IAdata} /> ));

import React from 'react';

import theme from '../../@authorities/theme';

import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
//import { action } from '@storybook/addon-actions';

import TTable from '@app/components/utils/TTable';
import Record from '../../@authorities/components/Record';
import IconTextGrid from '@app/components/utils/IconTextGrid';
import MaterialTable from 'material-table';

import { forwardRef } from 'react';
import  { AddBox, ArrowUpward, Check, ChevronLeft, ChevronRight,
    Clear, DeleteOutline, Edit, FilterList, FirstPage,
    LastPage, Remove, SaveAlt, Search, ViewColumn,
    PanoramaFishEye } from "@material-ui/icons";


const { warning } = theme.palette;
const style = theme.overrides;
const tableStyle = {rowStyle: style.MuiTableRow.root,
    headerStyle: style.MuiTableRow.head};

const tableIcons = {
    Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
    Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
    Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
    DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
    Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
    Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
    FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
    LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
    NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
    ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
    SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
    ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
    ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};


//Data for Autoridades web site
//Autoridades > Historial de alertas
const HistHeaders = ["Tipo de índice", "Estatus del índice", "Fecha de cálculo", "Fecha de cierre"];
const HistData = [
    ["Índice de Estabilidad Física",
        (<IconTextGrid icon={<PanoramaFishEye style={{ fill: warning.main }}/>} text="Alerta pública (amarilla)"/>),
        "dd.mm.aaaa",
        "dd.mm.aaaa"
    ],
    ["Índice de riesgo - aguas subterráneas - consumo humano/bebida animal",
        (<IconTextGrid icon={<PanoramaFishEye style={{ fill: warning.main }}/>} text="Alerta pública (amarilla)"/>),
        "dd.mm.aaaa",
        "dd.mm.aaaa"
    ],
];



//Same data to use with MaterialTable
const data = [{tipo: "Estabilidad física",
    estatus: "Alerta pública (amarilla)",
    fechaCalculo: "dd.mm.aaaa",
    fechaCierre: "dd.mm.aaaa"},

{tipo: "Índice de riesgo - aguas subterráneas - consumo humano/bebida animal",
    estatus: "Alerta pública (amarilla)",
    fechaCalculo: "dd.mm.aaaa",
    fechaCierre: "dd.mm.aaaa"},
];

const columns = [
    {title: "Tipo de índice",
        field: "tipo"},

    {title: "Estatus del índice",
        field: "estatus",
        render: data => (<IconTextGrid icon={<PanoramaFishEye style={{ fill: warning.main }}/>}
            text={data.estatus} />)},

    {title: "Fecha de cálculo",
        field: "fechaCalculo",
    },

    {title: "Fecha de cierre",
        field: "fechaCierre",
    },
]


storiesOf('Authorities/Record', module)
    .addDecorator(muiTheme([theme]))
    .add('Alert History',
        () => (<Record title="Historial de alertas"
            table={<TTable headers={ HistHeaders } rowData={ HistData } />}
            buttonText="Ver todo el historial de alertas" /> ))
    .add('Alert History with MaterialTable',
        () => (<Record title="Historial de alertas"
            table={<MaterialTable data={data} columns={columns}
                icons={tableIcons}
                options={{...tableStyle,
                    paging: false,
                    search: false,
                    toolbar: false}}
            />}
            buttonText="Ver todo el historial de alertas" /> ))

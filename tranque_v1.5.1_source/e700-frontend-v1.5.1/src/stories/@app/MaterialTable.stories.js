import React from 'react';
import { forwardRef } from 'react';

import theme from '../../@authorities/theme';

import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import  { AddBox, ArrowUpward, Check, ChevronLeft, ChevronRight,
    Clear, DeleteOutline, Edit, FilterList, FirstPage,
    LastPage, Remove, SaveAlt, Search, ViewColumn,
    Lock, Visibility, PanoramaFishEye, Lens } from "@material-ui/icons";
import {Grid} from "@material-ui/core";
import MaterialTable from 'material-table';

import IconTextGrid from '@app/components/utils/IconTextGrid';




const style = theme.overrides;
const { success, warning } = theme.palette;
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

function setIconGridTextComponent(data) {
    var icon = (<Lens style={{ fill: success.main }}/>);
    if (data === "Con eventos") {
        icon = (<PanoramaFishEye style={{ fill: warning.main }}/>);
    }
    return (
        <IconTextGrid icon={icon} text={data} />
    );
}

const columns = [
    {title: "Adi", field: "name"},
    {title: "Soyadi", field: "surname"},
    {title: "Dogum Yili", field: "birthYear", type: "numeric"},
    {title: "Dogum Yeri", field: "birthCity", lookup: {34: "Istambul", 63: "Sanliurfa"}}
];

const data = [{name: "Mehmet", surname: "Baran", birthYear: 1987, birthCity: 63 },
    {name: "Patricio", surname: "Merino", birthYear: 2019, birthCity: 34 },
    {name: "Natalia", surname: "Vidal", birthYear: 1991, birthCity: 34 }];


const data2 = [{indice: "Estabilidad física",
    estatusPublico: "Sin alerta",
    estatusInterno: "Con eventos"},
{indice: "Otro índice",
    estatusPublico: "Con eventos",
    estatusInterno: "Sin alerta"},
{indice: "Otro índice más",
    estatusPublico: "Con eventos",
    estatusInterno: "Con eventos"},
];

const columns2 = [
    {title: "Índices",
        field: "indice"},

    {title: (<Grid container direction="row"><Grid item><Visibility fontSize="small" /> </Grid><Grid item>&nbsp;Estatus Público</Grid></Grid>),
        field: "estatusPublico",
        render: data => setIconGridTextComponent(data.estatusPublico)
    },

    {title: (<Grid container direction="row"><Grid item><Lock fontSize="small" /> </Grid><Grid item>&nbsp;Estatus Interno</Grid></Grid>),
        field: "estatusInterno",
        render: data => setIconGridTextComponent(data.estatusInterno)
    },
]



storiesOf('MaterialTable', module)
    .addDecorator(muiTheme([theme]))
    .add('Material Table Example', () => (<MaterialTable data={data} columns={columns} title=""
        icons={tableIcons}
        options={tableStyle}
    /> ))
    .add('Material Table indexes', () => (<MaterialTable data={data2} columns={columns2} title="Índices"
        icons={tableIcons}

        options={{...tableStyle,
            paging: false,
            search: false}}
    /> ))
    .add('Material Table without title', () => (<MaterialTable data={data2} columns={columns2}
        icons={tableIcons}
        options={{...tableStyle,
            paging: false,
            search: false,
            toolbar: false}}
    /> ))

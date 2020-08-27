import React, {forwardRef} from 'react';
import MaterialTable, {MTableToolbar} from 'material-table';
import {Box} from '@material-ui/core';
import {COLORS} from '@authorities/theme';
import {
    ArrowUpward,
    ChevronLeft,
    ChevronRight,
    Clear,
    FilterList,
    FirstPage,
    LastPage,
    Search,
    SaveAlt
} from '@material-ui/icons';
import {makeStyles} from '@material-ui/core/styles';


const useStyles = makeStyles((theme) => ({
    toolbarPadding: {
        [theme.breakpoints.up('md')]: {
            paddingLeft: '0px'
        },
        [theme.breakpoints.up('sm')]: {
            paddingLeft: '0px'
        },
        paddingLeft: '0px'
    }
}));


/**
 * Material-Table with imported icons and setted options.
 *
 * @version 1.0.0
 * @author [Natalia Vidal](https://gitlab.com/nattoV)
 */
export default function TMaterialTable(props) {
    const classes = useStyles();
    const tableIcons = {
        Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref}/>),
        FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref}/>),
        LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref}/>),
        NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref}/>),
        PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref}/>),
        ResetSearch: forwardRef((props, ref) => <Clear {...props} style={{color: COLORS.white}} ref={ref}/>),
        Search: forwardRef((props, ref) => <Search {...props} ref={ref}/>),
        SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref}/>),
        Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref}/>)
    };
    const mtProps = {
        ...props,
        title: props.title ? props.title : '',
        icons: {...tableIcons, ...props.icons},
        options: {
            pageSize: 20,
            emptyRowsWhenPaging: false,
            searchFieldAlignment: 'left',
            ...props.options,            
            draggable: false
        },
        localization: {
            toolbar: {
                searchTooltip: 'Buscar',
                searchPlaceholder: 'Buscar',
                exportTitle: 'Descargar',
                exportAriaLabel: 'Descargar',
                exportName: 'Descargar como CSV'
            },
            pagination: {
                labelDisplayedRows: '{from}-{to} de {count}',
                labelRowsSelect: 'filas',
                firstTooltip: 'Primera página',
                previousTooltip: 'Página anterior',
                nextTooltip: 'Página siguiente',
                lastTooltip: 'Última página'
            },
            ...props.localization
        },
        components: {
            Toolbar: props => (
                <MTableToolbar {...props} classes={{root: classes.toolbarPadding}}/>
            ),
            Container: props => (
                <Box width="100%" {...props}/>
            ),
            ...props.components
        }
    };
    return (
        <MaterialTable {...mtProps}/>
    );
}

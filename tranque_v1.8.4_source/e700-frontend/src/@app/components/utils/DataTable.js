import React from 'react';
import {Typography, makeStyles, Table, TableBody, TableRow, TableCell} from '@material-ui/core';


const useStyles = makeStyles(theme => ({
    subtitle: {
        color: '#ffffff',
        fontWeight: '700',
        letterSpacing: '0.25px',
        lineHeight: '20px',
        textAlign: 'left',
        paddingBottom: '1.5em',
        paddingTop: '1em'
    },
    targetData: {
        backgroundColor: theme.palette.secondary.main
    },
    dataLabelText: {
        fontWeight: 'bold'
    }
}));


function getItem(item, index, classes) {
    return (
        <TableRow key={index}>
            <TableCell>
                <Typography className={classes.dataLabelText}>{item.label}</Typography>
            </TableCell>
            <TableCell>
                <Typography>{item.data}</Typography>
            </TableCell>
        </TableRow>
    );
}


/**
 * A simple table to display data (label + info).
 *
 * @version 1.0.0
 * @author [Natalia Vidal](https://gitlab.com/nattoV)
 */
export default function DataTable({title, items}) {
    const classes = useStyles();
    return (<>
        <Typography className={classes.subtitle}>{title}</Typography>
        <Table size="small" className={classes.targetData}>
            <TableBody>
                {items.map((item, index) => getItem(item, index, classes))}
            </TableBody>
        </Table>
    </>);
}

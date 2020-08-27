import React from 'react';
import { makeStyles, withStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const CustomTableCell = withStyles(theme => ({
    head: {
        backgroundColor: "#656565",
        color: theme.palette.common.white,
        fontSize:16
    },

    body: {fontSize: 14}}))(TableCell);


const useStyles = makeStyles({
    root: {
        width: '100%',
    },
    table: {
        minWidth: 800,
    },
    tableWrapper: {
        overflowY: 'auto',
    },
});

export function ParametersTable(props) {

    const classes = useStyles();
    const data = props.data;
    const ALERT = "[ No se registran variables ]";
    const TITLE1 = "Agrupación";
    const TITLE2 = "Variable";
    const TITLE3 = "Límite Inferior";
    const TITLE4 = "Límite Superior";
    const TITLE5 = "Fecha medición";
    const TITLE6 = "Valor";

    return (
        <Paper className={classes.root}>
            <div className={classes.tableWrapper}>
                <Table className={classes.table} aria-label="custom pagination table">
                    <TableHead>
                        <TableRow>
                            <CustomTableCell>{TITLE1}</CustomTableCell>
                            <CustomTableCell align="right">{TITLE2}</CustomTableCell>
                            <CustomTableCell align="right">{TITLE3}</CustomTableCell>
                            <CustomTableCell align="right">{TITLE4}</CustomTableCell>
                            <CustomTableCell align="right">{TITLE5}</CustomTableCell>
                            <CustomTableCell align="right">{TITLE6}</CustomTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        { data.length > 0?
                            data.map(row => (
                                <TableRow key={row.id}>
                                    <CustomTableCell component="th" scope="row">
                                        {row.group}
                                    </CustomTableCell>
                                    <CustomTableCell align="right">{row.name}</CustomTableCell>
                                    <CustomTableCell align="right">{row.lowerLimit}</CustomTableCell>
                                    <CustomTableCell align="right">{row.maxLimit}</CustomTableCell>
                                    <CustomTableCell align="right">{row.date}</CustomTableCell>
                                    <CustomTableCell align="right">{row.value}</CustomTableCell>
                                </TableRow>)):
                            <TableRow>
                                <CustomTableCell variant="footer">
                                    {ALERT}
                                </CustomTableCell>
                            </TableRow>
                        }
                    </TableBody>
                </Table>
            </div>
        </Paper>
    );
}

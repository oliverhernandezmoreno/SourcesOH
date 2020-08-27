import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const styles = theme => ({
    root: {
        marginTop: 'auto'
    },

    tablecell: {
        fontSize: '10pt',
        fontWeight: 'bold',
        backgroundColor: '#000000',
        color: '#ffffff'
    }
});

function createData(param, date) {
    return {param, date};
}

const rows = [
    createData('', ''),
    createData('', ''),
    createData('', ''),
    createData('', ''),
    createData('', '')
];

function SimpleTable(props) {
    const {classes} = props;
    return (
        <Paper className={classes.root}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell className={classes.tablecell} align="left">
                            subtitle</TableCell>
                        <TableCell className={classes.tablecell} align="left">Próxima actualización</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {rows.map((row, i) => (
                        <TableRow key={i}>
                            <TableCell className={classes.tablecell} component="th" scope="row">
                                {row.param}
                            </TableCell>
                            <TableCell className={classes.tablecell} align="left">{row.date}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );
}

SimpleTable.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(SimpleTable);

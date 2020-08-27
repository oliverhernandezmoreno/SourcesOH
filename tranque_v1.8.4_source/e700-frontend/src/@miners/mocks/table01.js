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

const HeaderRows = [{header: 'Grupo de datos con frecuencia regular'}, {header: 'Próxima actualización'}];
const Rows = [{param: 'Altura de muro', date: '-'}, {
    param: 'Ancho de Coronamiento',
    date: '-'
}, {param: 'Pendiente de muro', date: '-'}];

function SimpleTable(props) {
    const {classes} = props;
    return (
        <Paper className={classes.root}>
            <Table>
                <TableHead>
                    <TableRow>
                        {HeaderRows.map((obj, i) => (
                            <TableCell key={i} className={classes.tablecell} align="left">
                                {obj.header}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Rows.map((row, i) => (
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

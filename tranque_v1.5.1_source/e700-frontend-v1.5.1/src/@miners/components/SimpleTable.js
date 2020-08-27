import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {withStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const styles = {
    headerCell: {
        fontSize: '8pt',
        backgroundColor: '#323232',
        color: '#8E8E8E',
        borderBottom: '4px solid #323232'
    },

    tableRow: {
        height: '35px'
    },

    dataCell: {
        fontSize: '10pt',
        backgroundColor: '#323232',
        color: '#ffffff',
        borderBottom: '1px solid #323232'
    },

    cellLink: {
        textDecoration: 'none',
        color: 'inherit'
    }
};

styles.disabledDataCell = {
    ...styles.dataCell,
    color: '#8e8e8e'
};

styles.greenDataCell = {
    ...styles.dataCell,
    color: '#38e47b'
};

styles.yellowDataCell = {
    ...styles.dataCell,
    color: '#fdff3f'
};

const SimpleTable = (props) => {
    const {classes} = props;
    const cellStyles = {
        normal: classes.dataCell,
        gray: classes.disabledDataCell,
        green: classes.greenDataCell,
        yellow: classes.yellowDataCell
    };
    return (
        <Table padding="none" size="small">
            <TableHead>
                <TableRow className={classes.tableRow}>{props.header.map(({label}, i) => (
                    <TableCell key={`header-${i}`} className={classes.headerCell}
                        component="th"
                        align="left">
                        {label}
                    </TableCell>
                ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {props.data.map((row, i) => (
                    <TableRow className={classes.tableRow} key={`row-${i}`}>
                        {row.map(({value, style, link}, j) => (
                            <TableCell key={`cell-${i}-${j}`}
                                className={style ? (cellStyles[style] || classes.dataCell) : classes.dataCell}
                                component="td"
                                scope="row">
                                {link ? (<Link className={classes.cellLink} to={link}>{value}</Link>) : value}
                            </TableCell>
                        ))}
                    </TableRow>))}
            </TableBody>
        </Table>
    );
};

SimpleTable.propTypes = {
    classes: PropTypes.object.isRequired,
    header: PropTypes.array,
    data: PropTypes.array.isRequired
};

export default withStyles(styles)(SimpleTable);

import React, {Component} from 'react';
import PropTypes from 'prop-types';

import { Table, TableHead, TableBody, TableRow, TableCell } from '@material-ui/core';

/**
 * A generic table component.
 *
 * @version 1.0.0
 * @author [Natalia Vidal](https://gitlab.com/nattoV)
 */
class TTable extends Component {
    /**
    * Function triggered to create a single row for a table.
    *
    * @param {row} an array with data for a row.
    * @param {index} an index to identify the row.
    * @public
    */
    getRow(row, index) {
        return (
            <TableRow key={index} >
                {row.map((cell, index) => this.getCell(cell, index))}
            </TableRow>
        );
    }

    /**
    * Function triggered to create a single cell for a table.
    *
    * @param {cell} the data/elements in a cell.
    * @param {index} an index to identify the cell.
    * @public
    */
    getCell(cell, index) {
        return (
            <TableCell key={index} >
                {cell}
            </TableCell>
        );
    }

    /**
    * Render this component.
    *
    * @public
    */
    render() {
        return (
            <Table>
                <TableHead>
                    {this.getRow(this.props.headers, "table_header_index")}
                </TableHead>
                <TableBody>
                    {this.props.rowData.map((row, index) => this.getRow(row, index))}
                </TableBody>
            </Table>
        );
    }
}


TTable.propTypes = {
    headers: PropTypes.array.isRequired,
    rowData: PropTypes.array.isRequired
};


export default TTable;

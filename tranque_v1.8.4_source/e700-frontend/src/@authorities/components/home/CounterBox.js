import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import {Box, Typography} from '@material-ui/core';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const EF_CANONICAL_NAME = 'ef';
const EMAC_CANONICAL_NAME = 'emac';
const EF_EMAC_CANONICAL_NAME = 'ef+emac';

const styles = theme => ({
    dataBox: {
        backgroundColor: theme.palette.primary.main,
        padding: theme.spacing(2),
        borderRadius: "8px",
        height: '100%',
        display: 'flex',
        alignItems: 'flex-start'
    },
    dataBoxBottomText: {
        color: theme.palette.text.secondary
    },
    dataBoxMuiTableRow: {
        background: 'none'
    },
    dataBoxMuiTableCell: {
        border: 'none'
    },
    dataBoxMuiTableCellWithRightBorder: {
        border: 'none',
        borderRight: '1px solid gray'
    },
    dataBoxMuiTableCellSmall: {
        border: 'none',
        width: '60px'
    }
});

/**
 * A component for rendering a table with total, EF and EMAC counters.
 *
 * @version 1.0.0
 */
class CounterBox extends Component {

    render() {
        const {classes, rows, totalHeaderText, bottomText, selectedProfile} = this.props;
        const profile = selectedProfile || EF_EMAC_CANONICAL_NAME;
        const profileCellClass = profile === EF_EMAC_CANONICAL_NAME ?
            classes.dataBoxMuiTableCellSmall : classes.dataBoxMuiTableCell;
        return (<div>
            <Box className={classes.dataBox}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow className={classes.dataBoxMuiTableRow}>
                                <TableCell className={classes.dataBoxMuiTableCell}></TableCell>
                                <TableCell className={classes.dataBoxMuiTableCell} align="right"></TableCell>
                                { profile === EF_EMAC_CANONICAL_NAME && (<>
                                    <TableCell className={classes.dataBoxMuiTableCell} align="right">
                                        <Typography variant="subtitle2">EF</Typography>
                                    </TableCell>
                                    <TableCell className={classes.dataBoxMuiTableCell} align="right">
                                        <Typography variant="subtitle2">EMAC</Typography>
                                    </TableCell>
                                </>) }
                            </TableRow>
                            {totalHeaderText && (<TableRow className={classes.dataBoxMuiTableRow}>
                                <TableCell className={classes.dataBoxMuiTableCell}>
                                    <Typography variant="h5">{totalHeaderText}</Typography>
                                </TableCell>
                                { profile === EF_EMAC_CANONICAL_NAME &&
                                    <TableCell className={classes.dataBoxMuiTableCellWithRightBorder} align="right">
                                        <Typography variant="h5">
                                            {rows.reduce((acc, row) => (acc + row.totalEF + row.totalEMAC), 0)}
                                        </Typography>
                                    </TableCell>
                                }
                                { profile !== EMAC_CANONICAL_NAME &&
                                    <TableCell className={profileCellClass} align="right">
                                        {rows.reduce((acc, row) => (acc + row.totalEF), 0)}
                                    </TableCell>
                                }
                                { profile !== EF_CANONICAL_NAME &&
                                    <TableCell className={profileCellClass} align="right">
                                        {rows.reduce((acc, row) => (acc + row.totalEMAC), 0)}
                                    </TableCell>
                                }
                            </TableRow>)}
                        </TableHead>
                        <TableBody>
                            {rows.map((row) => (
                                <TableRow key={row.type} className={classes.dataBoxMuiTableRow}>
                                    <TableCell className={classes.dataBoxMuiTableCell}>
                                        {row.icon || null}{row.label}
                                    </TableCell>
                                    { profile === EF_EMAC_CANONICAL_NAME && (
                                        <TableCell className={classes.dataBoxMuiTableCellWithRightBorder} align="right">
                                            {row.totalEF + row.totalEMAC}
                                        </TableCell>
                                    )}
                                    {profile !== EMAC_CANONICAL_NAME && (
                                        <TableCell className={classes.dataBoxMuiTableCell} align="right">
                                            {row.totalEF}
                                        </TableCell>
                                    )}
                                    {profile !== EF_CANONICAL_NAME && (
                                        <TableCell className={classes.dataBoxMuiTableCell} align="right">
                                            {row.totalEMAC}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
            {bottomText && (
                <Box pt={1} className={classes.dataBoxBottomText} display="flex" justifyContent="flex-end" fontSize={12}>
                    {bottomText}
                </Box>)}
        </div>);
    }
}

CounterBox.propTypes = {
    rows: PropTypes.array.isRequired,
    selectedProfile: PropTypes.string.isRequired
};

export default withStyles(styles)(CounterBox);

import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {Table, TableBody, TableCell, TableRow, Tooltip, Typography} from '@material-ui/core';
import {ChipStatus} from '@miners/components/utils/ChipStatus';
import {Help} from '@material-ui/icons';
import classNames from 'classnames';

const textColor = '#000000';
const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: '#ffffff',
        padding: theme.spacing(2),
        color: textColor,
        maxWidth: 'none',
        whiteSpace: 'nowrap'
    },
    child: {
        display: 'inline-flex',
        alignItems: 'center',
        color: '#8D8D8D',
        fontSize: '12px',
        cursor: 'default'
    },
    icon: {
        marginRight: theme.spacing(0.5)
    },
    table: {
        marginTop: theme.spacing(1)
    },
    cell: {
        color: textColor,
        border: 'none'
    }
}));

export function ChipStatusLegend({options, className}) {
    const classes = useStyles();
    const renderRow = (option, tsi) => {
        return (
            <TableRow key={tsi}>
                <TableCell className={classes.cell}>
                    <ChipStatus status={option.status} noMargin={true} text="Variable"/>
                </TableCell>
                <TableCell className={classes.cell}>
                    {option.text}
                </TableCell>
            </TableRow>
        );
    };

    const childClass = classNames(classes.child, className);

    return (
        <Tooltip
            classes={{tooltip: classes.root}}
            placement="top-start"
            title={<>
                <Typography variant="subtitle1">Simbología</Typography>
                <Table size="small" className={classes.table}>
                    <TableBody>
                        {options.map(renderRow)}
                    </TableBody>
                </Table>
            </>}>
            <div className={childClass}>
                <Help className={classes.icon}/> Simbología
            </div>
        </Tooltip>
    );
};

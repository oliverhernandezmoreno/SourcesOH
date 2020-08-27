import React from 'react';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/core/styles';
import {
    Card,
    CardContent,
    CardHeader,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Tooltip,
    Typography
} from '@material-ui/core';
import {COLORS} from '@communities/theme';
import {IndexStatusIcon} from '@authorities/components/IndexStatusIcon';
import {getIndexStateLabel} from '@authorities/constants/indexState';
import {getIndexStatus} from '@communities/services/status';
import classNames from 'classnames';

const useStyles = makeStyles(theme => ({
    fullHeight: {
        height: '100%'
    },
    root: {
        backgroundColor: theme.palette.background.paper
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerTitle: {
        display: 'inline-block',
        fontSize: '16px',
        textAlign: 'left'
    },
    headerSubheader: {
        display: 'inline-block',
        color: theme.palette.text.secondary,
        fontSize: '10px',
        textAlign: 'right'
    },
    tableHeader: {
        color: theme.palette.text.secondary,
        backgroundColor: theme.palette.background.paper,
        paddingBottom: theme.spacing(1)
    },
    labelCell: {
        paddingLeft: 0
    },
    iconCell: {
        width: '1px',
        whiteSpace: 'nowrap'
    },
    iconWrap: {
        height: theme.spacing(4),
        display: 'inline-flex',
        alignItems: 'center'
    },
    current: {
        fontSize: theme.spacing(3)
    },
    previous: {
        fontSize: theme.spacing(2)
    },
    tooltip: {
        maxWidth: 'none',
        backgroundColor: theme.palette.secondary.dark,
        color: COLORS.black
    },
    arrow: {
        color: theme.palette.secondary.dark
    }
}));

function renderRows(status, templates, i, target, classes) {
    return templates.map((t, j) => {
        const st = status.find(s => s.module.endsWith(t.template_name)) || {result_state: {level: 0}};
        const indexStatus = getIndexStatus(st);
        const cell = (
            <Tooltip arrow key={i} classes={{tooltip: classes.tooltip, arrow: classes.arrow}}
                title={<>
                    <Typography variant='body2'>{getIndexStateLabel(indexStatus)}</Typography>
                </>}>
                <div>
                    <IndexStatusIcon key={i} status={indexStatus}/>
                </div>
            </Tooltip>
        );
        return (
            <TableRow key={`${i}-${j}`}>
                <TableCell className={classes.iconCell}>
                </TableCell>
                <TableCell className={classes.labelCell}>{t.label}</TableCell>
                <TableCell align="center" className={classes.iconCell}>
                    <div className={classNames(classes.iconWrap, classes.current)}>
                        {cell}
                    </div>
                </TableCell>
            </TableRow>
        );
    });
}

export function TargetIndexTable({title, subtitle, groups, status, target, fullHeight}) {
    const classes = useStyles();
    const rows = groups.map((g, i) => (
        [
            <TableRow key={i}>
                <TableCell className={classes.tableHeader} colSpan={2}>{g.header}</TableCell>
                <TableCell align="center" className={classes.tableHeader}>Actual</TableCell>
            </TableRow>,
            renderRows(status, g.templates, i, target, classes)
        ]
    ));
    const noData = <TableRow>
        <TableCell colSpan={4}>No data</TableCell>
    </TableRow>;
    const tableBody = rows.length > 0 ? rows : noData;
    return (
        <Card classes={{root: classes.root}} className={fullHeight ? classes.fullHeight : ''}>
            <CardHeader
                classes={{
                    content: classes.header,
                    title: classes.headerTitle,
                    subheader: classes.headerSubheader
                }} title={title} subheader={subtitle}/>
            <CardContent>
                <Table>
                    <TableBody>
                        {tableBody}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

TargetIndexTable.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    groups: PropTypes.arrayOf(
        PropTypes.shape({
            header: PropTypes.string,
            templates: PropTypes.arrayOf(
                PropTypes.shape({
                    visible: PropTypes.bool,
                    template_name: PropTypes.string.isRequired,
                    label: PropTypes.string.isRequired
                })
            ).isRequired
        })
    ).isRequired,
    status: PropTypes.arrayOf(PropTypes.object).isRequired,
    target: PropTypes.string.isRequired,
    fullHeight: PropTypes.bool
};

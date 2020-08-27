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
import {COLORS} from '@authorities/theme';
import {Visibility} from '@material-ui/icons';
import history from '@app/history';
import {reverse} from '@app/urls';
import {IndexStatusIcon} from '@authorities/components/IndexStatusIcon';
import {getIndexStateLabel} from '@authorities/constants/indexState';
import {getIndexStatus} from '@authorities/services/indexes';
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
    row: {
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: theme.palette.secondary.main
        }
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

function goTo(target, templateName) {
    return () => {
        history.push(reverse('authorities.target.indexes.detail', {target, templateName}));
    };
}

function renderRows(timeseries, templates, i, target, classes) {
    return templates.map((t, j) => {
        const ts = timeseries.find(ts => ts.template_name === t.template_name) || {events: []};
        const events = ts.events.slice(0, 6).map(
            (e, i) => {
                const indexStatus = getIndexStatus(e.value, ts.thresholds);
                return (
                    <Tooltip arrow key={i} classes={{tooltip: classes.tooltip, arrow: classes.arrow}}
                        title={<>
                            <Typography variant='body2'>{e.date.format('DD-MM-YYYY HH:mm')}</Typography>
                            <Typography variant='body2'>{getIndexStateLabel(indexStatus)}</Typography>
                        </>}>
                        <div>
                            <IndexStatusIcon key={i} status={indexStatus}/>
                        </div>
                    </Tooltip>
                );
            }
        );
        const current = events.shift();
        return (
            <TableRow key={`${i}-${j}`} className={classes.row} onClick={goTo(target, t.template_name)}>
                <TableCell className={classes.iconCell}>
                    <div className={classNames(classes.iconWrap)}>
                        {t.visible ? <Visibility/> : null}
                    </div>
                </TableCell>
                <TableCell className={classes.labelCell}>{t.label}</TableCell>
                <TableCell>
                    <div className={classNames(classes.iconWrap, classes.previous)}>
                        {events.reverse()}
                    </div>
                </TableCell>
                <TableCell align="center" className={classes.iconCell}>
                    <div className={classNames(classes.iconWrap, classes.current)}>
                        {current}
                    </div>
                </TableCell>
            </TableRow>
        );
    });
}

export function TargetIndexTable({title, subtitle, groups, timeseries, target, fullHeight}) {
    const classes = useStyles();
    const rows = groups.map((g, i) => (
        [
            <TableRow key={i}>
                <TableCell className={classes.tableHeader} colSpan={2}>{g.header}</TableCell>
                <TableCell className={classes.tableHeader}>5 anteriores</TableCell>
                <TableCell align="center" className={classes.tableHeader}>Actual</TableCell>
            </TableRow>,
            renderRows(timeseries, g.templates, i, target, classes)
        ]
    ));
    const noData = <TableRow>
        <TableCell colSpan={4}>Sin datos</TableCell>
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
    timeseries: PropTypes.arrayOf(PropTypes.object).isRequired,
    target: PropTypes.string.isRequired,
    fullHeight: PropTypes.bool
};

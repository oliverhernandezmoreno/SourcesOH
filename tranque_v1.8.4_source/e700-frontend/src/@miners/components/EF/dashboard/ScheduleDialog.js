import React from 'react';
import moment from 'moment';
import {withStyles} from '@material-ui/core/styles';
import {
    Button,
    CircularProgress,
    DialogActions,
    DialogTitle,
    Dialog,
    DialogContent,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Typography,
} from '@material-ui/core';
import AbstractSchedule from '@miners/containers/EF/dashboard/AbstractSchedule';

const removeCommon = (sample, universe) => {
    if (universe.length === 1) {
        return sample;
    }
    const common = new Set();
    universe.forEach((set) =>
        set
            .filter((element) => !common.has(element))
            .forEach((element) => {
                if (universe.every((otherset) => otherset.indexOf(element) !== -1)) {
                    common.add(element);
                }
            })
    );
    return sample.filter((e) => !common.has(e));
};

const styles = (theme) => {
    const cell = {
        fontSize: '1.1rem',
        color: '#d0d0d0',
    };
    return {
        dataTable: {
            overflowY: 'auto',
            maxHeight: '420px',
        },
        dataTableTitle: {
            fontSize: '1.2rem',
            marginTop: '15px',
        },
        dataTableTable: {
            backgroundColor: '#262629',
            borderRadius: '10px',
        },
        subtitle: {
            paddingBottom: '10px',
        },
        cell,
        headerCell: {
            ...cell,
            fontSize: '1rem',
        },
        disabledCell: {
            ...cell,
            color: '#8e8e8e',
        },
        pendingCell: {
            ...cell,
            color: '#ffff3f',
        },
        loadingContainer: {
            textAlign: 'center',
        },
        loading: {
            color: 'white',
            marginTop: '1rem',
        },
    };
};

class Inner extends React.Component {
    getDialogTitle = () => (this.props.rows ?? [])[this.props.openRow]?.label ?? '';

    getDialogSubtitle() {
        if (!this.props.rowData || this.props.openRow === null) {
            return '';
        }
        const timeseries = Object.values(this.props.rowData[this.props.openRow]).flat();
        return `Frecuencia de ingreso: ${AbstractSchedule.humanizeFrequencies(timeseries)}`;
    }

    getDialogContent = () => {
        if (!this.props.rowData || this.props.openRow === null) {
            return [
                {
                    table: {
                        header: [],
                        body: [],
                    },
                },
            ];
        }
        const tables = Object.values(this.props.rowData[this.props.openRow]);
        return tables
            .filter((timeseries) => timeseries.length > 0)
            .map((timeseries) => {
                const headerSuffix = ['Último ingreso', 'Próximo ingreso', 'Retraso'];
                const global = timeseries.every((ts) => !ts.data_source_group && !ts.data_source);
                const groupOnly =
                    !global && timeseries.every((ts) => ts.data_source_group && !ts.data_source);
                const sourced = !global && !groupOnly && timeseries.every((ts) => ts.data_source);
                const header = [
                    ...(groupOnly ? ['Agrupación'] : sourced ? ['Agrupación', 'Punto de medición'] : []),
                    ...headerSuffix,
                ];
                return {
                    tableHeader: tables.length <= 1 ? null : timeseries[0].name,
                    table: {
                        header,
                        body: timeseries.map((ts) => {
                            const cell = AbstractSchedule.worstFrequency([ts]);
                            return [
                                ...(groupOnly
                                    ? [{value: ts.data_source_group.name}]
                                    : sourced
                                        ? [
                                            {
                                                value: removeCommon(
                                                  ts.data_source?.group_names ?? [],
                                                  timeseries.map((ts) => ts.data_source?.group_names ?? [])
                                                ).join(', '),
                                            },
                                            {value: ts.data_source?.name},
                                        ]
                                        : []),
                                {
                                    value:
                                        (ts.events ?? []).length > 0
                                            ? moment(ts.events[0]['@timestamp']).format('D.MM.YYYY hh:mm')
                                            : 'Pendiente',
                                    style:
                                        (ts.events ?? []).length > 0 ? null : AbstractSchedule.styles.PENDING,
                                },
                                {value: cell.next},
                                {
                                    value: cell.delay,
                                    style: cell.delay === null ? null : AbstractSchedule.styles.PENDING,
                                },
                            ];
                        }),
                    },
                };
            });
    };

    valueForCell(cell) {
        const {classes} = this.props;
        const {value, style} = cell;
        return {
            className:
                {
                    [AbstractSchedule.styles.DISABLED]: classes.disabledCell,
                    [AbstractSchedule.styles.PENDING]: classes.pendingCell,
                }[style] || classes.cell,
            label: value || '',
        };
    }

    renderLoading() {
        const {classes} = this.props;
        return (
            <div className={classes.loadingContainer}>
                <CircularProgress className={classes.loading} />
            </div>
        );
    }

    render() {
        const {classes} = this.props;
        const content = this.props.rowData === null ? null : this.getDialogContent();
        return (
            <>
                <DialogTitle>{this.getDialogTitle()}</DialogTitle>
                <DialogContent>
                    <Typography className={classes.subtitle}>{this.getDialogSubtitle()}</Typography>
                    {this.props.rowData === null ? (
                        this.renderLoading()
                    ) : (
                        <div className={classes.dataTable}>
                            {content.map(({table, tableHeader}, tableIndex) => (
                                <React.Fragment key={`table-${tableIndex}`}>
                                    {tableHeader && (
                                        <Typography className={classes.dataTableTitle}>
                                            {tableHeader}
                                        </Typography>
                                    )}
                                    <Table className={classes.dataTableTable}>
                                        <TableHead>
                                            <TableRow>
                                                {table.header.map((h, index) => (
                                                    <TableCell
                                                        key={`header-${index}`}
                                                        component="th"
                                                        className={classes.headerCell}
                                                        width={`${100 / table.header.length}%`}
                                                    >
                                                        {h}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {table.body.map((row, index) => (
                                                <TableRow key={`row-${index}`}>
                                                    {row
                                                        .map((cell) => this.valueForCell(cell))
                                                        .map(({className, label}, cellIndex) => (
                                                            <TableCell
                                                                key={`cell-${index}-${cellIndex}`}
                                                                className={className}
                                                            >
                                                                {label}
                                                            </TableCell>
                                                        ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button size="large" onClick={this.props.closeDialog}>
                        ENTENDIDO
                    </Button>
                </DialogActions>
            </>
        );
    }
}

const ScheduleDialog = (props) => (
    <Dialog onClose={props.closeDialog} open={!!props.open} maxWidth="lg" fullWidth={true}>
        <ScheduleDialog.Inner {...props} />
    </Dialog>
);

ScheduleDialog.Inner = withStyles(styles)(Inner);

export default ScheduleDialog;

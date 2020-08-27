import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import {ChevronLeft, ChevronRight} from '@material-ui/icons';
import {Button, Table, TableBody, TableCell, TableHead, TableRow, Typography} from '@material-ui/core';
import {styles} from '@miners/containers/EMAC/dashboard/styles';
import moment from 'moment';
import history from '@app/history';
import {reverse} from '@app/urls';
import {formatDecimal} from '@app/services/formatters';
import {DataSourcesVariableTooltip} from '@miners/containers/EMAC/dashboard/DataSourcesVariableTooltip';
import {DataSourcesProgress} from '@miners/containers/EMAC/dashboard/DataSourcesProgress';


const waterType = {
    'superficial': 'superficial',
    'subterraneo': 'subterráneo'
};
const waterLocation = {
    'aguas-abajo': 'aguas abajo',
    'aguas-arriba': 'aguas arriba'
};

class EMACDataSources extends Component {

    state = {
        stationIndex: 0,
        pauseProgress: false
    };

    toggleNext = () => {
        let newIndex = 0;
        if (this.state.stationIndex < this.props.sources.length - 1) {
            newIndex = this.state.stationIndex + 1;
        }
        this.setState({stationIndex: newIndex});
    };

    togglePrev = () => {
        let newIndex = this.props.sources.length - 1;
        if (this.state.stationIndex > 0) {
            newIndex = this.state.stationIndex - 1;
        }
        this.setState({stationIndex: newIndex});
    };

    togglePause = () => {
        this.setState(state => ({pauseProgress: !state.pauseProgress}));
    };

    frequencyMsn(data, classes) {
        const defaultFromDate = moment().subtract(480, 'minutes');
        let status = 'Sin datos disponibles';
        let className = classes.statusDisabled;

        if (data.events.length > 0) {
            let fromDate = defaultFromDate;
            if (data.frequencies.length > 0) {
                fromDate = moment().subtract(+data.frequencies[0].minutes, 'minutes');
            }

            const date = data.events[0].date;
            if (date.isSameOrAfter(fromDate)) {
                status = 'Cumple frecuencia esperada';
                className = classes.statusOk;
            } else {
                status = 'No cumple frecuencia esperada';
                className = classes.statusWarning;
            }
        }

        return <Typography className={className}>{status}</Typography>;
    }

    onRowClick(timeseries) {
        return () => {
            history.push(
                reverse(
                    'miners.target.emac.data.raw.byVariable',
                    {target: this.props.target},
                    {template: timeseries.template_name}
                )
            );
        };
    }

    getGroups(dataSource) {
        if (dataSource) {
            const a = dataSource.groups.map(g => waterType[g]).filter(g => g !== undefined).join(', ');
            const b = dataSource.groups.map(g => waterLocation[g]).filter(g => g !== undefined).join(', ');
            return [a, b].join(', ');
        } else {
            return '';
        }
    }

    render() {
        const {classes, loading} = this.props;
        const {stationIndex, pauseProgress} = this.state;

        let stationSelected;
        if (this.props.sources.length > 0) {
            stationSelected = this.props.sources[stationIndex];
        }

        return (
            <div style={{flexGrow: 1, backgroundColor: '#323232', padding: '5px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <Button onClick={this.togglePrev}><ChevronLeft/></Button>
                    <div>
                        <Typography align="center" variant='subtitle1' style={{marginTop: '10px'}}>
                            {stationSelected && stationSelected.name}
                        </Typography>
                        <Typography align="center" variant='caption'>
                            {this.getGroups(stationSelected)}
                        </Typography>
                    </div>
                    <Button onClick={this.toggleNext}><ChevronRight/></Button>
                </div>
                <DataSourcesProgress
                    key={stationIndex} onComplete={this.toggleNext} onClick={this.togglePause}
                    pauseProgress={pauseProgress} disabled={loading}/>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align='left' style={{width: '14rem', whiteSpace: 'nowrap'}}>
                                <Typography className={classes.tableHead}>Variables</Typography>
                            </TableCell>
                            <TableCell align='left' style={{width: '12rem', whiteSpace: 'nowrap'}}>
                                <Typography className={classes.tableHead}>Disponibilidad de datos</Typography>
                            </TableCell>
                            <TableCell align='left' style={{width: '6rem', whiteSpace: 'nowrap'}}>
                                <Typography className={classes.tableHead}>Último valor</Typography>
                            </TableCell>
                            <TableCell className={classes.tableHead}>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {stationSelected && stationSelected._timeseries.sgt
                            .map((ts, index) =>
                                <DataSourcesVariableTooltip key={index} timeseries={ts}>
                                    <TableRow
                                        className={`${classes.indexRow} clickable`}
                                        onClick={this.onRowClick(ts)}>
                                        <TableCell className={classes.noBorder}>
                                            <div>
                                                <Typography className={classes.rowLabel} variant='subtitle1'>{ts.description}</Typography>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                {this.frequencyMsn(ts, classes)}
                                            </div>
                                        </TableCell>
                                        <TableCell style={{whiteSpace: 'nowrap'}}>
                                            <div>
                                                {ts.events.length > 0 ? formatDecimal(ts.events[0].value, 3) : '-- '} [{ts.unit ? ts.unit.abbreviation : '--'}]
                                            </div>
                                        </TableCell>
                                        <TableCell style={{whiteSpace: 'nowrap'}}>
                                            <div>
                                                {ts.events.length > 0 ?
                                                    (ts.events[0].date.fromNow()) : '--'}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                </DataSourcesVariableTooltip>
                            )}
                    </TableBody>
                </Table>
            </div>
        );
    }
}

EMACDataSources.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(EMACDataSources);

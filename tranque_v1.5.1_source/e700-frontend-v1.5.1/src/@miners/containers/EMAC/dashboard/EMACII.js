import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import {FiberManualRecord} from '@material-ui/icons';
import {Chip, Table, TableBody, TableCell, TableRow, Typography} from '@material-ui/core';

import classNames from 'classnames';
import history from '@app/history';
import {reverse} from '@app/urls';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import {forkJoin} from 'rxjs';
import * as TimeseriesService from '@app/services/backend/timeseries';
import {styles} from '@miners/containers/EMAC/dashboard/styles';

class EMACII extends SubscribedComponent {
    state = {
        data: {
            subterranean: {
                value: undefined,
                date: undefined,
                threshold: undefined
            },
            superficial: {
                value: undefined,
                date: undefined,
                threshold: undefined
            }
        },
        loading: true
    };

    componentDidMount() {
        const {target} = this.props;
        this.subscribe(
            forkJoin({
                sub: TimeseriesService.list({
                    target,
                    template_name: 'emac-mvp.subterraneo.ii',
                    max_events: 1
                }),
                sup: TimeseriesService.list({
                    target,
                    template_name: 'emac-mvp.superficial.ii',
                    max_events: 1
                })
            }),
            ({sub, sup}) => {
                const newData = {
                    subterranean: {
                        value: undefined,
                        date: undefined,
                        threshold: undefined
                    },
                    superficial: {
                        value: undefined,
                        date: undefined,
                        threshold: undefined
                    }
                };
                if (sub.length > 0) {
                    if (sub[0].events.length > 0) {
                        newData.subterranean.value = sub[0].events[0].value;
                        newData.subterranean.date = sub[0].events[0].date;
                    }
                    if (sub[0].thresholds.length > 0) {
                        newData.subterranean.threshold = +sub[0].thresholds[0].upper;
                    }
                }
                if (sup.length > 0) {
                    if (sup[0].events.length > 0) {
                        newData.superficial.value = sup[0].events[0].value;
                        newData.superficial.date = sup[0].events[0].date;
                    }
                    if (sup[0].thresholds.length > 0) {
                        newData.superficial.threshold = +sup[0].thresholds[0].upper;
                    }
                }
                this.setState({data: newData, loading: false});
            }
        );
    }

    goToIISup = () => {
        history.push(reverse('miners.target.emac.data.iiSuperficial', {target: this.props.target}));
    };

    goToIISub = () => {
        history.push(reverse('miners.target.emac.data.iiSubterranean', {target: this.props.target}));
    };

    renderIndexCell(value, threshold, onClick) {
        const {classes} = this.props;
        let msg, status;

        if (this.state.loading) {
            msg = '--';
            status = classes.statusDisabled;
        } else if (Number.isNaN(Number.parseFloat(threshold)) || value === undefined) {
            msg = 'No configurado';
            status = classes.statusDisabled;
        } else if (value > threshold) {
            msg = 'Alerta amarilla';
            status = classes.statusWarning;
        } else {
            msg = 'Sin alerta';
            status = classes.statusOk;
        }

        return <TableCell>
            <div className={classes.impactIndexWrapper}>
                <Chip
                    onClick={onClick}
                    clickable={true}
                    className={classes.chip}
                    icon={<FiberManualRecord className={classNames(classes.statusIcon, status)}/>}
                    label={<Typography
                        variant='body1' color='primary'
                        classes={{colorPrimary: status}}
                        className={classes.impactIndexText}>{msg}</Typography>}
                />
            </div>
        </TableCell>;
    }

    renderIndexRow(water, value, threshold, onClick) {
        const {classes} = this.props;
        const disabled = value === undefined ? classes.statusDisabled : '';
        return <TableRow className={classNames(classes.indexRow, disabled)}>
            <TableCell>
                <div className={disabled}>
                    <Typography variant='subtitle1'>{water}</Typography>
                </div>
            </TableCell>
            {this.renderIndexCell(value, threshold, onClick)}
        </TableRow>;
    }

    render() {
        const {data} = this.state;
        return <Table>
            <TableBody>
                {this.renderIndexRow(
                    'Aguas subterráneas',
                    data.subterranean.value,
                    data.subterranean.threshold,
                    this.goToIISub
                )}
                {this.renderIndexRow(
                    'Aguas superficiales',
                    data.superficial.value,
                    data.superficial.threshold,
                    this.goToIISup
                )}
            </TableBody>
        </Table>;
    }
}

EMACII.propTypes = {
    classes: PropTypes.object.isRequired,
    target: PropTypes.string.isRequired
};

export default withStyles(styles)(EMACII);

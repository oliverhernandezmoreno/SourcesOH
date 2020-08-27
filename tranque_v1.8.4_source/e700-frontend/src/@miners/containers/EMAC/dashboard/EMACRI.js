import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import {FiberManualRecord} from '@material-ui/icons';
import {Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography} from '@material-ui/core';

import classNames from 'classnames';
import history from '@app/history';
import {reverse} from '@app/urls';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import {styles as stylesII} from '@miners/containers/EMAC/dashboard/styles';
import * as TimeseriesService from '@app/services/backend/timeseries';
import {forkJoin} from 'rxjs';

const styles = theme => {
    const sii = stylesII(theme);
    return {
        ...sii,
        chip: {
            ...sii.chip,
            width: '170px'
        }
    };
};

class EMACRI extends SubscribedComponent {
    state = {
        data: [
            {
                label: 'Uso riego',
                path: 'riego',
                subterranean: {
                    template: 'emac-mvp.riego.subterraneo.ir',
                    value: undefined,
                    date: undefined,
                    threshold: undefined
                },
                superficial: {
                    template: 'emac-mvp.riego.superficial.ir',
                    value: undefined,
                    date: undefined,
                    threshold: undefined
                }
            },
            {
                label: 'Uso consumo humano/bebida animal',
                path: 'agua-potable',
                subterranean: {
                    template: 'emac-mvp.agua-potable.subterraneo.ir',
                    value: undefined,
                    date: undefined,
                    threshold: undefined
                },
                superficial: {
                    template: 'emac-mvp.agua-potable.superficial.ir',
                    value: undefined,
                    date: undefined,
                    threshold: undefined
                }
            },
            {
                label: 'Uso recreacional',
                path: 'recreacion',
                subterranean: {
                    template: 'emac-mvp.recreacion.subterraneo.ir',
                    value: undefined,
                    date: undefined,
                    threshold: undefined
                },
                superficial: {
                    template: 'emac-mvp.recreacion.superficial.ir',
                    value: undefined,
                    date: undefined,
                    threshold: undefined
                }
            },
            {
                label: 'Uso protección vida acuática',
                path: 'vida-acuatica',
                subterranean: {
                    template: 'emac-mvp.vida-acuatica.subterraneo.ir',
                    value: undefined,
                    date: undefined,
                    threshold: undefined
                },
                superficial: {
                    template: 'emac-mvp.vida-acuatica.superficial.ir',
                    value: undefined,
                    date: undefined,
                    threshold: undefined
                }
            }
        ],
        loading: true
    };

    componentDidMount() {
        const {target} = this.props;
        this.subscribe(
            forkJoin({
                sub: TimeseriesService.list({
                    target,
                    template_name: this.state.data.map((riskIndex) => riskIndex.subterranean.template).join(','),
                    max_events: 1,
                    page_size: 500
                }),
                sup: TimeseriesService.list({
                    target,
                    template_name: this.state.data.map((riskIndex) => riskIndex.subterranean.template).join(','),
                    max_events: 1,
                    page_size: 500
                })
            }),
            ({sub, sup}) => {
                this.state.data.forEach((index, riskIndex) => {
                    const newIndex = {
                        ...riskIndex,
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
                    sub = sub.filter((_sub) => ((_sub.data_source || {}).id ===  riskIndex.id));
                    sup = sup.filter((_sup) => ((_sup.data_source || {}).id ===  riskIndex.id));
                    if (sub.length > 0) {
                        if (sub[0].events.length > 0) {
                            newIndex.subterranean.value = sub[0].events[0].value;
                            newIndex.subterranean.date = sub[0].events[0].date;
                        }
                        if (sub[0].thresholds.length > 0) {
                            newIndex.subterranean.threshold = +sub[0].thresholds[0].upper;
                        }
                    }
                    if (sup.length > 0) {
                        if (sup[0].events.length > 0) {
                            newIndex.superficial.value = sup[0].events[0].value;
                            newIndex.superficial.date = sup[0].events[0].date;
                        }
                        if (sup[0].thresholds.length > 0) {
                            newIndex.superficial.threshold = +sup[0].thresholds[0].upper;
                        }
                    }
                    this.setState(state => {
                        const newData = state.data.slice();
                        newData[index] = newIndex;
                        return {data: newData, loading: false};
                    });
                    return newIndex
                });
            }
        );
    };

    goToIRSub(path) {
        return () => {
            history.push(reverse('miners.target.emac.data.irSubterranean.forUse', {target: this.props.target, path}));
        };
    }

    goToIRSup(path) {
        return () => {
            history.push(reverse('miners.target.emac.data.irSuperficial.forUse', {target: this.props.target, path}));
        };
    }

    renderIndexCell(value, threshold, onClick) {
        const {classes} = this.props;

        let msg, status;
        if (this.state.loading) {
            status = classes.statusDisabled;
            msg = '--';
        } else if (Number.isNaN(Number.parseFloat(threshold)) || value === undefined) {
            status = classes.statusDisabled;
            msg = 'No configurado';
        } else if (value > threshold) {
            status = classes.statusWarning;
            msg = 'Alerta amarilla';
        } else {
            status = classes.statusOk;
            msg = 'Sin alerta';
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

    renderIndexRow(data, i) {
        const {classes} = this.props;

        const disabled = data.subterranean.value === undefined && data.superficial.value === undefined ?
            classes.statusDisabled : '';

        return (
            <TableRow key={i} className={classNames(classes.indexRow, disabled)}>
                <TableCell>
                    <div className={disabled}>
                        <Typography className={classes.rowLabel} variant='subtitle1'>{data.label}</Typography>
                    </div>
                </TableCell>
                {this.renderIndexCell(data.subterranean.value, data.superficial.value, this.goToIRSub(data.path))}
                {this.renderIndexCell(data.superficial.value, data.superficial.threshold, this.goToIRSup(data.path))}
            </TableRow>
        );
    }

    render() {
        const {classes} = this.props;
        const {data} = this.state;
        return (
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell className={classes.noBorder}/>
                        <TableCell className={classNames(classes.noBorder, classes.noWrap)}>
                            <Typography variant='subtitle1'>Aguas subterráneas</Typography>
                        </TableCell>
                        <TableCell className={classNames(classes.noBorder, classes.noWrap)}>
                            <Typography variant='subtitle1'>Aguas superficiales</Typography>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((data, i) => this.renderIndexRow(data, i))}
                </TableBody>
            </Table>
        );
    }
}

EMACRI.propTypes = {
    classes: PropTypes.object.isRequired,
    target: PropTypes.string.isRequired
};

export default withStyles(styles)(EMACRI);

import React from 'react';
import PropTypes from 'prop-types';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import * as actionTypes from '@miners/actions';
import {connect} from 'react-redux';
import {reverse} from '@app/urls';
import history from '@app/history';
import ParamStatusCard from '@miners/components/EF/dashboard/ParamStatusCard';
import * as TimeseriesService from '@app/services/backend/timeseries';
import {UPPER, LOWER} from '@miners/constants/thresholdTypes';
import {isYellow} from '@miners/components/EF/IconStatus';


export function getThresholdValue(thresholds, type) {
    let values = thresholds.map(t => parseFloat(t[type])).filter(v => !isNaN(v));
    switch(type) {
        case UPPER:
            return Math.min(...values);
        case LOWER:
            return Math.max(...values);
        default:
            return null;
    }
}

export function getCommonThresholds(thresholds) {
    return (thresholds || []).filter(t => t ? t.kind === null : false);
}

class ParamStatusContainer extends SubscribedComponent {

    state = {
        paramValue: '-',
        date: '-',
        sector: '-',
        thresholdUnit: '',
        serie: null,
        threshold: null,
        thresholdType: null,
        loading: false,
    }

    componentDidMount() {
        this.loadParamData();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.currentTime !== this.props.currentTime ||
            prevProps.template !== this.props.template) {
            this.loadParamData();
        }
    }

    loadParamData() {
        const timeFormat = 'HH:mm DD.MM.YY';
        if (!this.props.template) return;
        this.setState({loading: true});
        // Get Last event
        this.subscribe(
            TimeseriesService.list({
                cache: 60 * 1000,  // one minute
                target: this.props.target,
                template_name: this.props.template,
                max_events: 1
            }),
            (tss) => {
                const withEvents = tss.filter((ts) => ts.events.length > 0);
                if (withEvents.length === 0) {
                    this.setState({loading: false});
                    return;
                }
                this.setState({
                    sector: withEvents[0].data_source || null,
                    date: withEvents[0].events[0].date.format(timeFormat),
                    paramValue: withEvents[0].events[0].roundedValue.toString(),
                    thresholdUnit: `[${withEvents[0].unit.abbreviation}]`,
                    serie: withEvents[0].events[0].name,
                    loading: false
                });
                const thresholds = getCommonThresholds(withEvents[0].thresholds);
                let thresholdType = thresholds[0]?.upper ? UPPER : LOWER;
                let thresholdValue = getThresholdValue(thresholds, thresholdType);
                if (thresholds.length > 0) {
                    this.setState({
                        threshold: thresholdValue,
                        thresholdType
                    });
                }
            },
            (err) => this.setState({loading: false})
        );
    }

    goToDetail() {
        return () => {
            this.props.onSerieCanonicalName(this.state.serie);
            history.push(reverse('miners.target.ef.data.template', {
                target: this.props.target,
                template: this.props.routeTemplate
            }));
        };
    }

    render() {
        const {title, radioOptions, template, onRadioChange} = this.props;
        const {thresholdType, threshold, paramValue} = this.state;
        return <ParamStatusCard
            yellow={isYellow(thresholdType, paramValue, threshold)}
            data={{...this.state, title}}
            initialRadioValue={template}
            onAcceptOption={onRadioChange}
            radioOptions={radioOptions}
            loading={this.state.loading}
            goToDetail={this.goToDetail()}
        />
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onSerieCanonicalName: (group) => dispatch({
            type: actionTypes.ADD_SERIE_CANONICAL_NAME,
            serie_canonical_name: group
        })
    };
};

ParamStatusContainer.propTypes = {
    target: PropTypes.string.isRequired,
    currentTime: PropTypes.string.isRequired,
    routeTemplate: PropTypes.string.isRequired
}

export default connect(null, mapDispatchToProps)(ParamStatusContainer);

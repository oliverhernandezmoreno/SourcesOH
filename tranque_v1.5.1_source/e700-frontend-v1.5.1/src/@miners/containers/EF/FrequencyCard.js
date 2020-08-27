import React from 'react';
import PropTypes from 'prop-types';
import * as moment from 'moment/moment';

import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import FrequencyCardComponent from '@miners/components/FrequencyCard';
import * as TimeseriesService from '@app/services/backend/timeseries';

const random = (low, high) => Math.random() * (high - low) + low;

class FrequencyCard extends SubscribedComponent {

    // static methods used as common cell functions
    static worstFrequency(template, tss) {
        const withFreq = tss.filter((ts) => ts.frequencies.length > 0);
        if (withFreq.length === 0) {
            return {
                value: 'Sin definición',
                style: 'gray'
            };
        }
        if (withFreq.some((ts) => ts.events.length === 0)) {
            return {
                value: 'Pendiente',
                style: 'yellow'
            };
        }
        const withEvents = withFreq.filter((ts) => ts.events.length > 0);

        const mostUrgent = moment.min(
            withEvents
                .map((ts) => ts.events[0].date.clone().add(Math.min(...ts.frequencies.map(
                    (f) => parseFloat(f.minutes) + parseFloat(f.tolerance_upper || '0')
                )), 'minutes'))
        );
        return {
            value: mostUrgent.diff(moment()) > 0 ? mostUrgent.fromNow() : 'Pendiente',
            style: mostUrgent.diff(moment()) > 0 ? 'green' : 'yellow'
        };
    }

    state = {
        groupState: {}
    };

    fetchByTemplateNames(templates) {
        return TimeseriesService.list({
            cache: random(60 * 1000, 60 * 5 * 1000),  // random cache to avoid request bursts
            target: this.props.target,
            template_name: templates.join(","),
            max_events: 1
        });
    }
    componentDidMount() {
        this.props.dataGroups
            .map((group, index) => ({group, index}))
            .filter(({group}) => !group.data)  // data should be fetched, wasn't provided
            .forEach(({group: {dataTemplate}, index: groupIndex}) => dataTemplate.forEach(
                (row, rowIndex) => this.subscribe(
                    this.fetchByTemplateNames(row.queryTemplate ? [row.queryTemplate] : row.queryTemplates),
                    (tss) => this.setState((state) => ({
                        groupState: {
                            ...state.groupState,
                            [groupIndex]: {
                                ...(state.groupState[groupIndex] || {}),
                                [rowIndex]: tss
                            }
                        }
                    })),
                )
            ));
    }

    buildDataGroup({title, header, dataTemplate}, state) {
        return {
            title,
            header,
            data: dataTemplate
                .map((row, rowIndex) => ({row, rowIndex}))
                .filter(({rowIndex}) => state[rowIndex] && state[rowIndex].length > 0)
                .map(({row, rowIndex}) => header.map(
                    ({cellFn}, cellIndex) => cellFn(row, state[rowIndex] || null)
                ))
        };
    }

    buildDataGroups() {
        return this.props.dataGroups.map(
            (group, index) => group.data ?
                group :
                this.buildDataGroup(
                    group,
                    this.state.groupState[index] || {}
                )
        );
    }

    render() {
        return <FrequencyCardComponent title={this.props.title} dataGroups={this.buildDataGroups()}/>;

    }
}

FrequencyCard.propTypes = {
    target: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    dataGroups: PropTypes.arrayOf(PropTypes.shape({
        data: PropTypes.array,
        dataTemplate: PropTypes.array,
        header: PropTypes.array
    }))
};

export default FrequencyCard;

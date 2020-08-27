import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {forkJoin} from 'rxjs';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import * as TimeseriesService from '@app/services/backend/timeseries';

const random = (low, high) => Math.random() * (high - low) + low;

// The amount of templates to fetch in a single request
const REQUEST_BATCH = 5;

const pristineState = {
    rowData: null,
    openRow: null,
    loading: false,
    loadingError: false,
};

class AbstractSchedule extends SubscribedComponent {
    static propTypes = {
        target: PropTypes.string.isRequired,
        currentTime: PropTypes.string.isRequired,
        rows: PropTypes.arrayOf(
            PropTypes.shape({
                label: PropTypes.string,
                templates: PropTypes.arrayOf(PropTypes.string),
            })
        ),
    };

    state = {...pristineState};

    static withRows = (rows) => (component) => (props) => React.createElement(component, {rows, ...props});

    static styles = {
        DISABLED: 'gray',
        PENDING: 'yellow',
        UP_TO_DATE: 'white',
    };

    // static method used as common cell functions
    static worstFrequency(tss) {
        const withFreq = tss.filter((ts) => ts.frequencies.length > 0);
        if (withFreq.length === 0) {
            return {
                value: 'Sin definición',
                style: AbstractSchedule.styles.DISABLED,
                next: null,
                delay: null,
            };
        }
        if (withFreq.some((ts) => (ts.events ?? []).length === 0)) {
            return {
                value: 'Pendiente',
                style: AbstractSchedule.styles.PENDING,
                next: null,
                delay: null,
            };
        }
        const withEvents = withFreq.filter((ts) => ts.events.length > 0);

        const mostUrgent = moment.min(
            withEvents.map((ts) =>
                ts.events[0].date
                    .clone()
                    .add(
                        Math.min(
                            ...ts.frequencies.map(
                                (f) => parseFloat(f.minutes) + parseFloat(f.tolerance_upper || '0')
                            )
                        ),
                        'minutes'
                    )
            )
        );
        const delay = moment().diff(mostUrgent);
        return {
            value: delay > 0 ? 'Pendiente' : mostUrgent.fromNow(),
            style: delay > 0 ? AbstractSchedule.styles.PENDING : AbstractSchedule.styles.UP_TO_DATE,
            next: delay > 0 ? null : mostUrgent.fromNow(),
            delay: delay > 0 ? moment.duration(delay).humanize() : null,
        };
    }

    static humanizeFrequencies(tss) {
        const withFreq = tss.filter((ts) => ts.frequencies.length > 0);
        if (withFreq.length === 0) {
            return 'no definida';
        }
        const frequencies = Array.from(
            new Set(
                tss.flatMap((ts) =>
                    ts.frequencies
                        .map((f) => parseFloat(f.minutes))
                        .filter((m) => !isNaN(m))
                        .sort((a, b) => a - b)
                        .map((m) => moment.duration(m, 'minutes').humanize())
                )
            )
        );
        return frequencies.map((f) => `cada ${f}`).join(', ');
    }

    // service utils

    fetchTimeseries() {
        this.setState({loading: true, loadingError: false});
        const allTemplates = Array.from(
            new Set((this.props.rows ?? []).flatMap(({templates}) => templates ?? []))
        );
        const batches = Array.from({length: Math.ceil(allTemplates.length / REQUEST_BATCH)}, (_, index) =>
            allTemplates.slice(index * REQUEST_BATCH, (index + 1) * REQUEST_BATCH)
        );
        this.subscribe(
            forkJoin(
                batches.map((batch) =>
                    TimeseriesService.list({
                        cache: random(60 * 1000, 60 * 5 * 1000), // random cache to avoid request bursts
                        target: this.props.target,
                        template_name: batch.join(','),
                        max_events: 1,
                    })
                )
            ),
            (nested) => {
                const tss = nested.flat();
                this.setState({
                    loading: false,
                    loadingError: false,
                    rowData: this.props.rows.map(({templates}) =>
                        (templates ?? []).reduce(
                            (acc, template) => ({
                                ...acc,
                                [template]: tss.filter(({template_name}) => template_name === template),
                            }),
                            {}
                        )
                    ),
                });
            },
            () => this.setState({loading: false, loadingError: true})
        );
    }

    componentDidMount() {
        this.fetchTimeseries();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.currentTime !== this.props.currentTime) {
            this.fetchTimeseries();
        }
    }

    render() {
        throw new Error("AbstractSchedule can't be rendered");
    }
}

export default AbstractSchedule;

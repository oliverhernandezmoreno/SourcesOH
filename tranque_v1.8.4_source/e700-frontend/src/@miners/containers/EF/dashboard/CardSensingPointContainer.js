import React from 'react';
import PropTypes from 'prop-types';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import {reverse} from '@app/urls';
import history from '@app/history';
import CardSensingPoint from '@miners/components/EF/dashboard/CardSensingPoint';
import * as TimeseriesService from '@app/services/backend/timeseries';


class CardSensingPointContainer extends SubscribedComponent {

    state = {
        data: [],
        loading: false
    }

    componentDidMount() {
        this.loadSensingData();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.currentTime !== this.props.currentTime ) {
            this.loadSensingData();
        }
    }

    loadSensingData() {
        this.setState({loading: true});
        // Get last event piezometers
        this.subscribe(
            TimeseriesService.list({
                cache: 60 * 1000,  // one minute
                target: this.props.target,
                template_name: 'ef-mvp.m2.parameters.presion-poros'
            }),
            (tss) => {
                this.subscribe(
                    TimeseriesService.list({
                        cache: 60 * 1000,  // one minute
                        target: this.props.target,
                        canonical_name__in: tss.map(ts => ts.canonical_name).join(","),
                        max_events: 1,
                        page_size: 500
                    }),
                    (objs) => {
                        let data = [];
                        objs.forEach( obj => {
                            const thresholds = obj.thresholds
                                .filter((t) => t.upper !== null)
                                .map((t) => parseFloat(t.upper));
                            data.push({
                                name: obj.data_source?.name.replace('Piezómetro', 'PZ'),
                                values: (obj.events[0] || {}).value,
                                threshold: thresholds[0] || null,
                                units: obj.unit_abbreviation
                            });
                        });
                        this.setState({
                            data: data,
                            loading: false
                        });
                    },
                    () => this.setState({loading: false})
                );
            }
        );
    }

    goToDetail() {
        return () => {
            history.push(reverse('miners.target.ef.data.template', {
                target: this.props.target,
                template: 'cotas-piezometricas-en-el-tiempo'
            }));
        };
    }

    render() {
        return <CardSensingPoint
            title={'Piezometría'}
            values={this.state.data}
            goToDetail={() => this.goToDetail()}
            loading={this.state.loading}
        />
    }
}

CardSensingPointContainer.propTypes = {
    target: PropTypes.string.isRequired,
    currentTime: PropTypes.string.isRequired
}

export default CardSensingPointContainer;

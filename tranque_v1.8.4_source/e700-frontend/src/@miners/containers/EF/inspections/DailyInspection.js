import React  from 'react';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import {forkJoin} from 'rxjs';
import {sortByCategory} from '@app/services/backend/timeseries';

import * as TimeseriesService from '@app/services/backend/timeseries';
import InspectStepper from '@miners/components/EF/InspectStepper';

import seriesWithSelectEvent from '@miners/components/EF/seriesWithSelectEvent'


class DailyInspection extends SubscribedComponent {

    state = {
        target:"",
        triggers: {
            itemsTriggers:[],
            itemsTriggersImportant:[],
            itemsTriggersCritical:[],
            itemsTriggersForecasts:[],
            answersTriggers:[],
            answersTriggersImportant:[],
            answersTriggersCritical:[],
            answersTriggersForecasts:[],
        },
        design:{
            itemsDesign:[],
            answersDesign:[]
        },

        events:[],
        loading:true,
    }

    componentDidMount(){
        this.loadData()
    }

    componentDidUpdate(prevProps,prevState){
        if (prevState.events !== this.state.events) {
            this.loadData();
        }
    }

    loadData = () => {
        this.unsubscribeAll();
        const target = this.props.match.params.target;
        this.setState({target})

        // Load triggers
        this.subscribe(
            forkJoin({
                triggers: TimeseriesService.list({
                    target:target,
                    template_category: 'm1-triggers',
                    max_events: 1
                }),
                triggersImportant: TimeseriesService.list({
                    target:target,
                    template_category: 'm1-important-triggers',
                    max_events: 1
                }),
                triggersCritical: TimeseriesService.list({
                    target:target,
                    template_category: 'm1-critical-triggers',
                    max_events: 1
                }),
                triggersForecasts: TimeseriesService.list({
                    target:target,
                    template_category: 'm1-forecasts-triggers',
                    max_events: 1
                }),
                design: TimeseriesService.list({
                    target:target,
                    template_category: 'm1-design',
                    max_events: 1
                }),

            }),({triggers,
                triggersImportant,
                triggersCritical,
                triggersForecasts,
                design}) => {

                const dataTriggers = {
                    itemsTriggers:[],
                    itemsTriggersImportant:[],
                    itemsTriggersCritical:[],
                    itemsTriggersForecasts:[],
                    answersTriggers:[],
                    answersTriggersImportant:[],
                    answersTriggersCritical:[],
                    answersTriggersForecasts:[],
                    answersTriggersEvents:[],
                }
                const dataDesign = {
                    itemsDesign:[],
                    answersDesign:[],
                }

                if(triggers.length > 0){
                    dataTriggers.itemsTriggers = sortByCategory(triggers)
                    dataTriggers.itemsTriggers.forEach((index) => {
                        if(seriesWithSelectEvent
                            .find(e => e === index.template_name) !== undefined){
                            dataTriggers.answersTriggersEvents = {
                                ...dataTriggers.answersTriggersEvents,
                                [index.canonical_name]: index.events[0].value
                            }
                        }else{
                            dataTriggers.answersTriggers={
                                ...dataTriggers.answersTriggers,
                                [index.canonical_name]: !!parseInt(index.events[0].value)}
                        }
                    })
                };

                if(triggersImportant.length > 0){
                    dataTriggers.itemsTriggersImportant = sortByCategory(triggersImportant)
                    dataTriggers.itemsTriggersImportant.forEach((index) => {
                        dataTriggers.answersTriggersImportant={
                            ...dataTriggers.answersTriggersImportant,
                            [index.canonical_name]: !!parseInt(index.events[0].value)}
                    })
                };

                if(triggersCritical.length > 0){
                    dataTriggers.itemsTriggersCritical = sortByCategory(triggersCritical)
                    dataTriggers.itemsTriggersCritical.forEach((index) => {
                        if(seriesWithSelectEvent
                            .find(e => e === index.template_name) !== undefined){
                            dataTriggers.answersTriggersEvents = {
                                ...dataTriggers.answersTriggersEvents,
                                [index.canonical_name]: index.events[0].value
                            }
                        }else{
                            dataTriggers.answersTriggersCritical={
                                ...dataTriggers.answersTriggersCritical,
                                [index.canonical_name]: !!parseInt(index.events[0].value)}
                        }
                    })
                };

                if(triggersForecasts.length > 0){
                    dataTriggers.itemsTriggersForecasts = sortByCategory(triggersForecasts)
                    dataTriggers.itemsTriggersForecasts.forEach((index) => {
                        dataTriggers.answersTriggersForecasts={
                            ...dataTriggers.answersTriggersForecasts,
                            [index.canonical_name]: !!parseInt(index.events[0].value)}
                    })
                };

                if(design.length > 0){
                    dataDesign.itemsDesign = sortByCategory(design)
                    dataDesign.itemsDesign.forEach((index) => {
                        dataDesign.answersDesign={
                            ...dataDesign.answersDesign,
                            [index.canonical_name]: !!parseInt(index.events[0].value)}
                    })
                };

                this.setState({ triggers: dataTriggers,
                    design: dataDesign,
                    loading:false})
            })
    }

  stateReset = () => {
      this.setState({events:[]})
  };

  render(){
      const {triggers,design,loading,target,events} = this.state;
      return(
          <InspectStepper
              target={target}
              events={events}
              triggers={triggers}
              design={design}
              loading={loading}
              stateReset={this.stateReset}/>
      );
  }
}

export default DailyInspection;

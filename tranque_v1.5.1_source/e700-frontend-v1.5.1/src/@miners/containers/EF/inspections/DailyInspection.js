import React  from 'react';

import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import {forkJoin} from 'rxjs';
import {sortByCategory} from '@app/services/backend/timeseries';


import * as TimeseriesService from '@app/services/backend/timeseries';
import InspectStepper from '@miners/components/EF/InspectStepper';


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
        const target = this.props.match.params.target
        this.setState({target:target})

        // Load triggers
        this.subscribe(
            forkJoin({
                triggers: TimeseriesService.list({
                    target:target,
                    template_category: 'm1-triggers',
                }),
                triggersImportant: TimeseriesService.list({
                    target:target,
                    template_category: 'm1-important-triggers',
                }),
                triggersCritical: TimeseriesService.list({
                    target:target,
                    template_category: 'm1-critical-triggers',
                }),
                triggersForecasts: TimeseriesService.list({
                    target:target,
                    template_category: 'm1-forecasts-triggers',
                }),
                design: TimeseriesService.list({
                    target:target,
                    template_category: 'm1-design',
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
                }
                const dataDesign = {
                    itemsDesign:[],
                    answersDesign:[],
                }


                if(triggers.length > 0){
                    dataTriggers.itemsTriggers = sortByCategory(triggers)
                    triggers.forEach((obj) =>
                        dataTriggers.answersTriggers = {...dataTriggers.answersTriggers,
                            [obj.canonical_name]:false})
                };
                if(triggersImportant.length > 0){
                    dataTriggers.itemsTriggersImportant = sortByCategory(triggersImportant)
                    triggersImportant.forEach((obj) =>
                        dataTriggers.answersTriggersImportant = {...dataTriggers.answersTriggersImportant,
                            [obj.canonical_name]:false})
                };
                if(triggersCritical.length > 0){
                    dataTriggers.itemsTriggersCritical = sortByCategory(triggersCritical)
                    triggersCritical.forEach((obj) =>
                        dataTriggers.answersTriggersCritical = {...dataTriggers.answersTriggersCritical,
                            [obj.canonical_name]:false})
                };
                if(triggersForecasts.length > 0){
                    dataTriggers.itemsTriggersForecasts = sortByCategory(triggersForecasts)
                    triggersForecasts.forEach((obj) =>
                        dataTriggers.answersTriggersForecasts = {...dataTriggers.answersTriggersForecasts,
                            [obj.canonical_name]:false})
                };
                if(design.length > 0){
                    dataDesign.itemsDesign = sortByCategory(design)
                    design.forEach((obj) =>
                        dataDesign.answersDesign = {...dataDesign.answersDesign,
                            [obj.canonical_name]:false})
                };
                this.setState({ triggers: dataTriggers,
                    design: dataDesign,
                    loading:false})
            });
    }

  stateReset = () => {
      this.setState({events:[]})
  };

  render(){
      const {triggers,design,loading,target} = this.state;
      return(

          <InspectStepper
              target={target}
              triggers={triggers}
              design={design}
              loading={loading}
              stateReset={this.stateReset}/>

      );
  }
}

export default DailyInspection;

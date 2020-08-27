import React from 'react';
import { TEMPLATE_TO_PLOTS } from './nav.js'
import DefaultTemporalView from './EFViews/DefaultTemporalView/DefaultTemporalView';


const CardGraphicFilter =  (props) => {
   
    const { template, target } = props.match.params;
    const plotTemplates = TEMPLATE_TO_PLOTS[template];
    const { Component, sections } = plotTemplates;

    if(!Component){
        return <DefaultTemporalView template={template} target={target} sections={sections}/>
    }

    return <Component template={template} target={target} sections={sections}></Component>
}

export default CardGraphicFilter;
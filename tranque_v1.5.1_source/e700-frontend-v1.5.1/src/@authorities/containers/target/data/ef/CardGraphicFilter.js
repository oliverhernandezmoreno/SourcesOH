import React from 'react';
import { TEMPLATE_TO_PLOTS } from '@miners/containers/EF/data/nav.js'
import DefaultTemporalView from '@miners/containers/EF/data/EFViews/DefaultTemporalView/DefaultTemporalView';


const CardGraphicFilter =  (props) => {
    const { dataDumps, handleRequest, match: {params: {template, target} } } = props;
    const plotTemplates = TEMPLATE_TO_PLOTS[template];
    const { Component, sections } = plotTemplates;

    if(!Component){
        return <DefaultTemporalView dataDumps={dataDumps} handleRequest={handleRequest} template={template} target={target} sections={sections}/>
    }

    return <Component dataDumps={dataDumps} handleRequest={handleRequest} template={template} target={target} sections={sections}></Component>
}

export default CardGraphicFilter;
import React from 'react';
import { TEMPLATE_TO_PLOTS } from '@miners/containers/EF/data/nav.js'
import DefaultTemporalView from '@miners/containers/EF/data/EFViews/DefaultTemporalView/DefaultTemporalView';


const CardGraphicFilter =  (props) => {
    const { dataDumps, handleRequest, match: {params: {template, target} } } = props;
    const plotTemplates = TEMPLATE_TO_PLOTS[template];
    const { Component, sections, wikiLink } = plotTemplates;

    if(!Component){
        return <DefaultTemporalView disableSwitches={true} dataDumps={dataDumps} handleRequest={handleRequest} template={template} target={target} sections={sections} wikiLink={wikiLink}/>
    }

    return <Component disableActions={true} dataDumps={dataDumps} handleRequest={handleRequest} template={template} target={target} sections={sections} wikiLink={wikiLink}></Component>
}

export default CardGraphicFilter;
import React from 'react';

import AbstractSchedule from '@miners/containers/EF/dashboard/AbstractSchedule';
import Schedule from '@miners/components/EF/dashboard/Schedule';

const rows = [
    {
        label: 'Diaria',
        templates: [
            'ef-mvp.m1.triggers.prisma',
            'ef-mvp.m1.triggers.distribucion-inadecuada',
            'ef-mvp.m1.triggers.deslizamiento-menor',
            'ef-mvp.m1.triggers.estribo',
            'ef-mvp.m1.triggers.vertedero',
            'ef-mvp.m1.triggers.cota-vertedero',
            'ef-mvp.m1.triggers.aguas-claras',
            'ef-mvp.m1.triggers.canales-perimetrales',
            'ef-mvp.m1.triggers.asentamientos-diferenciales',
            'ef-mvp.m1.triggers.drenaje',
            'ef-mvp.m1.triggers.turbiedad',
            'ef-mvp.m1.triggers.filtraciones',
            'ef-mvp.m1.triggers.subsidencia-muro',
            'ef-mvp.m1.triggers.subsidencia-cubeta',
            'ef-mvp.m1.triggers.grietas',
            'ef-mvp.m1.triggers.deslizamiento-inminente',
            'ef-mvp.m1.triggers.important.lluvia',
            'ef-mvp.m1.triggers.important.terremoto-4-6',
            'ef-mvp.m1.triggers.critical.deslizamiento-critico',
            'ef-mvp.m1.triggers.critical.deslizamiento-mayor',
            'ef-mvp.m1.triggers.critical.rebalse',
            'ef-mvp.m1.triggers.critical.terremoto-7',
            'ef-mvp.m1.triggers.forecasts.lluvia',
            'ef-mvp.m1.triggers.forecasts.nevazon',
            'ef-mvp.m1.triggers.forecasts.vientos',
            'ef-mvp.m1.design.altura',
            'ef-mvp.m1.design.revancha',
            'ef-mvp.m1.design.coronamiento',
            'ef-mvp.m1.design.superficie',
            'ef-mvp.m1.design.laguna',
            'ef-mvp.m1.design.talud',
            'ef-mvp.m1.design.materiales',
            'ef-mvp.m1.design.geomembrana',
        ],
    },
    {
        label: 'Mensual',
        templates: [
            'ef-mvp.m1.vulnerability.estado',
            'ef-mvp.m1.vulnerability.tipo',
            'ef-mvp.m1.vulnerability.metodo',
            'ef-mvp.m1.vulnerability.gobernanza',
            'ef-mvp.m1.vulnerability.instrumentacion',
            'ef-mvp.m1.vulnerability.exposicion-crecidas',
            'ef-mvp.m1.vulnerability.exposicion-escorrentias',
            'ef-mvp.m1.vulnerability.exposicion-avalanchas',
            'ef-mvp.m1.vulnerability.actualizado',
            'ef-mvp.m1.vulnerability.vulnerabilidad',
        ],
    },
];

class InspectionsSchedule extends AbstractSchedule {
    render = () => <Schedule {...this.props} {...this.state} title="Inspección" />;
}

export default AbstractSchedule.withRows(rows)(InspectionsSchedule);

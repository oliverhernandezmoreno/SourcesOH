import React from 'react';

import AbstractSchedule from '@miners/containers/EF/dashboard/AbstractSchedule';
import Schedule from '@miners/components/EF/dashboard/Schedule';
import ScheduleDialog from '@miners/components/EF/dashboard/ScheduleDialog';

const rows = [
    {
        label: 'Cota de espejo de agua',
        templates: ['ef-mvp.m2.parameters.variables.cota-laguna'],
    },
    {
        label: 'Cota de lamas',
        templates: ['ef-mvp.m2.parameters.variables.cota-lamas'],
    },
    {
        label: 'Distancia mínima laguna-muro',
        templates: ['ef-mvp.m2.parameters.distancia-laguna'],
    },
    {
        label: 'Altura de coronamiento',
        templates: ['ef-mvp.m2.parameters.altura-muro'],
    },
    {
        label: 'Ancho de coronamiento',
        templates: ['ef-mvp.m2.parameters.ancho-coronamiento'],
    },
    {
        label: 'Pendiente de talud',
        templates: [
            'ef-mvp.m2.parameters.pendiente-muro.global-aguas-abajo',
            'ef-mvp.m2.parameters.pendiente-muro.global-aguas-arriba',
        ],
    },
    {
        label: 'Deformación en superficie',
        templates: [
            'ef-mvp.m2.parameters.deformacion-monolito-eje-x',
            'ef-mvp.m2.parameters.deformacion-monolito-eje-y',
            'ef-mvp.m2.parameters.deformacion-monolito-eje-z',
        ],
    },
    {
        label: 'Deformación en profundidad',
        templates: [
            'ef-mvp.m2.parameters.deformacion-inclinometro-z-eje-x',
            'ef-mvp.m2.parameters.deformacion-inclinometro-z-eje-y',
            'ef-mvp.m2.parameters.deformacion-inclinometro-z-eje-z',
        ],
    },
    {
        label: 'Porcentaje de finos',
        templates: ['ef-mvp.m2.parameters.porcentaje-finos'],
    },
    {
        label: 'Densidad del muro',
        templates: ['ef-mvp.m2.parameters.densidad'],
    },
    {
        label: 'Curva granulométrica',
        templates: ['ef-mvp.m2.parameters.granulometria'],
    },
    {
        label: 'Presión de poros',
        templates: ['ef-mvp.m2.parameters.presion-poros'],
    },
    {
        label: 'Tonelaje',
        templates: ['ef-mvp.m2.parameters.tonelaje'],
    },
    {
        label: 'Nivel freático de cubeta',
        templates: ['ef-mvp.m2.parameters.nivel-freatico-cubeta-deposito'],
    },
    {
        label: 'Pendiente de playa',
        templates: ['ef-mvp.m2.parameters.pendiente-playa'],
    },
];

class ParametersSchedule extends AbstractSchedule {
    openRowDialog = (row) => this.setState({openRow: this.rowData === null ? null : row});

    closeDialog = () => this.setState({openRow: null});

    render = () => (
        <>
            <Schedule {...this.props} {...this.state} openRowDialog={this.openRowDialog} title="Parámetro" />
            <ScheduleDialog
                {...this.props}
                {...this.state}
                open={this.state.openRow !== null}
                closeDialog={this.closeDialog}
            />
        </>
    );
}

export default AbstractSchedule.withRows(rows)(ParametersSchedule);

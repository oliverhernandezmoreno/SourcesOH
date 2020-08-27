import React from 'react';

import OperationsList from '@miners/containers/etl/OperationsList';
import Stepper from '@miners/containers/etl/Stepper';
import EMACETLLoader from '@miners/containers/EMAC/etl/EMACETLLoader';
import EMACETLValidator from '@miners/containers/EMAC/etl/EMACETLValidator';
import EMACETLVoucher from '@miners/containers/EMAC/etl/EMACETLVoucher';
import {API_HOST} from '@app/config';
import {reverse} from '@app/urls';

// Fully supported executors
export const EXECUTORS = [
    {
        executor: 'sma_v1_2019',
        title: 'Plantilla estándar SMA',
        sample: `${API_HOST}/static/etl/samples/PlanillaSMAV12019.xlsx`,
        loader: EMACETLLoader,
        validator: EMACETLValidator,
        voucher: EMACETLVoucher,
        header: 'Carga de datos de calidad de agua',
        subheader: 'Según plantilla estándar SMA',
        description: 'La plantilla estándar SMA establece un formato para registrar resultados de mediciones por punto de monitoreo.',
        loaderRoute: 'miners.target.emac.massLoad',
        exitRoute: 'miners.target.emac.data.load'
    },
    {
        executor: 'emac_rev0',
        title: 'Plantilla SMA adaptada a plataforma tranque',
        sample: `${API_HOST}/static/etl/samples/PlanillaEMACREV0.xlsx`,
        loader: EMACETLLoader,
        validator: EMACETLValidator,
        voucher: EMACETLVoucher,
        header: 'Carga de datos de calidad de agua',
        subheader: 'Según plantilla SMA adaptada a plataforma tranque',
        description: 'La plantilla SMA adaptada a plataforma tranque establece un formato para registrar resultados de mediciones por punto de monitoreo.',
        loaderRoute: 'miners.target.emac.massLoad',
        exitRoute: 'miners.target.emac.data.load'
    }
];

// Executors supported in read-only mode
export const LEGACY_EXECUTORS = [];

export default ({match: {params: {target, executor, operation}}}) => (
    !executor ?
        <OperationsList
            target={target}
            link={(operation) => reverse('miners.target.emac.massLoad', {
                target,
                executor: operation.executor,
                operation: operation.id
            })}
            executors={[...EXECUTORS, ...LEGACY_EXECUTORS]}/> :
        <Stepper
            target={target}
            executors={EXECUTORS}
            executor={executor}
            operation={operation}/>
);

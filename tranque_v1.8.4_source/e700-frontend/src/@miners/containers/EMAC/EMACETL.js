import React from 'react';

import OperationsList from '@miners/containers/etl/OperationsList';
import Stepper from '@miners/containers/etl/Stepper';
import {reverse} from '@app/urls';
import {EXECUTORS, LEGACY_EXECUTORS} from '@miners/containers/EMAC/etl/executors';


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

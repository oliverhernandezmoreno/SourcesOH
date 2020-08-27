import React from 'react';

import OperationsList from '@miners/containers/etl/OperationsList';
import {EXECUTORS} from '@miners/containers/EF/etl/executors';
import {reverse} from '@app/urls';

export default ({match: {params: {target, executor}}}) => (
    <OperationsList target={target}
        link={(operation) => reverse('miners.target.ef.dataLoad.fromFile', {
            target,
            executor,
            operation: operation.id
        })
        }
        executors={EXECUTORS.filter((e) => e.executor === executor)}/>
)

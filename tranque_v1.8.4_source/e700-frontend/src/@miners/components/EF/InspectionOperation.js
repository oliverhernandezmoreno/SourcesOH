import React from 'react';
import OperationsList from '@miners/containers/etl/OperationsList';
import {EXECUTORS} from '@miners/containers/EF/inspections/executors';
import {reverse} from '@app/urls';

export default ({match: {params: {target}}}) => (
    <OperationsList target={target}
        link={(operation) => reverse('miners.target.ef.inspection-and-evaluation.voucher', {
            target,
            operation: operation.id
        })}
        executors={EXECUTORS}
    />
)

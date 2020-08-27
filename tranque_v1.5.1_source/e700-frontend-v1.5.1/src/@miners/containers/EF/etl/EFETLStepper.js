import React from 'react';

import Stepper from '@miners/containers/etl/Stepper';
import {EXECUTORS} from '@miners/containers/EF/etl/executors';

export default (props) => {
    const {match: {params: {target, executor, operation}}} = props;
    return (
        <Stepper target={target}
            executors={EXECUTORS}
            executor={executor}
            operation={operation}/>
    );
}

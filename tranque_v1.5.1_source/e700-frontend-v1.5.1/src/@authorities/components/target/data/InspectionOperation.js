import React from 'react';
import OperationsList from '@miners/containers/etl/OperationsList';
import {EXECUTORS} from '@miners/containers/EF/inspections/executors';
import {reverse} from '@app/urls';
import { Card, makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
    root: {
        padding: 32
    },
});

export default ({match: {params: {target}}}) => {
    const classes = useStyles();
    return (
        <Card className={classes.root}>
            <OperationsList target={target}
                link={(operation) => reverse('authorities.target.data.ef.inspections.voucher', {
                    target,
                    operation: operation.id
                })}
                executors={EXECUTORS}
            />
        </Card>)
}

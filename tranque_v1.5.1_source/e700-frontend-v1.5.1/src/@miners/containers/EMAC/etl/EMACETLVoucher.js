import React from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';

import {history} from '@app/history';
import {reverse} from '@app/urls';
import DefaultVoucher from '@miners/containers/etl/DefaultVoucher';
import EMACETLDataDisplay from '@miners/containers/EMAC/etl/EMACETLDataDisplay';

export default ({target, operation, executor, spec}) => (
    <DefaultVoucher operation={operation}>
        <EMACETLDataDisplay target={target} operation={operation}/>
        <Grid container direction="row" justify="space-around">
            <Grid item xs={4}>
                <Button variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => history.push(reverse(spec.loaderRoute, {target, executor}))}>
                    <ChevronLeft/>
                    Comenzar nueva carga
                </Button>
            </Grid>
            <Grid item xs={4}>
                <Button variant="contained"
                    fullWidth
                    size="large"
                    onClick={() =>
                    {
                        history.push(reverse(spec.exitRoute, {target, executor}));
                        document.getElementById("scrolled-content").scrollTop = 0
                    }}>
                    Ver registros
                    <ChevronRight/>
                </Button>
            </Grid>
        </Grid>
    </DefaultVoucher>
);

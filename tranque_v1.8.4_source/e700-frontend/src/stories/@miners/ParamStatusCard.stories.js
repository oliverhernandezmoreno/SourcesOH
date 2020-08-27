import React from 'react';
import ParamStatusCard from '@miners/components/EF/dashboard/ParamStatusCard';
import { storiesOf } from "@storybook/react";
import theme from '../../@miners/theme';
import {muiTheme} from 'storybook-addon-material-ui';
import {UPPER, LOWER} from '@miners/constants/thresholdTypes';

const divStyle = {
    backgroundColor: '#000000',
    padding: 100
}

const radioOptions = [
    {label: 'REVANCHA OPERACIONAL MÍNIMA', value: 'rom',
        description: '[Explicación del parámetro Lorem ipsum sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore mag,a aliqua. Ut enim ad mimim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat]. Este parámetro posee un valor umbral contra el que se contradtan las mediciones'},
    {label: 'REVANCHA OPERACIONAL MÍNIMA PROMEDIO', value: 'romp',
        description: '[Explicación del parámetro Lorem ipsum sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore mag,a aliqua. Ut enim ad mimim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat]. Este parámetro NO posee un valor umbral contra el que se contradtan las mediciones'},
]

const paramInfo = {
    title: 'Distancia mínima Laguna-Muro',
    paramValue: '8,9',
    date: '12.02.2019',
    sector: '[Nombre de sector]',
    thresholdType: LOWER,
    threshold: 4,
    thresholdUnit: '[m]',
    serie: '....'
}

const nullValues = {
    title: null,
    paramValue: null,
    date: null,
    sector: null,
    thresholdType: null,
    threshold: null,
    thresholdUnit: null,
    serie: null
}

const undefinedValues = {
    title: undefined,
    paramValue: undefined,
    date: undefined,
    sector: undefined,
    thresholdType: undefined,
    threshold: undefined,
    thresholdUnit: undefined,
    serie: undefined
}

function getParaStatusCard(yellow, radio, extraParamInfo, loading) {
    return <div style={divStyle}>
        <ParamStatusCard
            yellow={yellow}
            data={{...paramInfo, ...extraParamInfo}}
            initialRadioValue={radio && radioOptions[0].value}
            onAcceptOption={() => {}}
            radioOptions={radio && radioOptions}
            loading={loading}
            goToDetail={() => {}}
        />
    </div>
}

storiesOf('Miners/ParamStatusCard', module)
    .addDecorator(muiTheme([theme]))
    .add('Green', () => getParaStatusCard(false, false, {}, false))
    .add('Yellow (icon + name)', () => getParaStatusCard(true, false, {paramValue: 3}, false))
    .add('Grey (yellow=null, value=null)', () => getParaStatusCard(
        null /*title not yellow*/,
        false,
        {paramValue: null /*icon grey*/},
        false)
    )
    .add('Grey (serie=null)', () => getParaStatusCard(false, false, {serie: null}, false))
    .add('With upper threshold', () => getParaStatusCard(false, false, {thresholdType: UPPER, threshold: 10}, false))
    .add('Loading...', () => getParaStatusCard(false, false, {}, true))
    .add('With radio options', () => getParaStatusCard(false, true, {}, false))
    .add('With null values', () => getParaStatusCard(false, false, nullValues, false))
    .add('With undefined values', () => getParaStatusCard(false, false, undefinedValues, false))

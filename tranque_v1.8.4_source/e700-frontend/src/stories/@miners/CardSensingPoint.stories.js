import React from 'react';
import CardSensingPoint from '@miners/components/EF/dashboard/CardSensingPoint';
import { storiesOf } from "@storybook/react";
import theme from '../../@miners/theme';
import {muiTheme} from 'storybook-addon-material-ui';

const divStyle = {
    backgroundColor: '#000000',
    padding: 100
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function getChips(num) {
    let chips = [];
    const names = ['PZ short', 'PZ medium name', 'PZ very large name for a piezometer'];
    for (var i=0; i < num; i++) {
        chips.push({name: names[getRandomInt(3)], values: getRandomInt(10), threshold: 4, units: undefined});
    }
    return chips;
}

const cardProps = {
    title: 'Título',
    values: getChips(1),
    goToDetail: () => {},
    loading: false
}

const nullValues = {
    title: null,
    values: null,
    goToDetail: null,
    loading: null
}

const undefinedValues = {
    title: undefined,
    values: undefined,
    goToDetail: undefined,
    loading: undefined
}

function getCardSensingPoint(extraProps) {
    return <div style={divStyle}>
        <CardSensingPoint {...cardProps} {...extraProps}/>
    </div>
}

storiesOf('Miners/CardSensingPoint', module)
    .addDecorator(muiTheme([theme]))
    .add('Example', () => getCardSensingPoint({values: getChips(3)}))
    .add('No chips', () => getCardSensingPoint({values: []}))
    .add('20 chips', () => getCardSensingPoint({values: getChips(20)}))
    .add('Null props', () => getCardSensingPoint(nullValues))
    .add('Undefined props', () => getCardSensingPoint(undefinedValues))
    .add('Loading chips', () => getCardSensingPoint({loading: true}))

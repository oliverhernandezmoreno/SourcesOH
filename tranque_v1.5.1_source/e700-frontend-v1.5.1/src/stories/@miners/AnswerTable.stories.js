import React from 'react';
import AnswerTable from '@miners/components/EF/AnswerTable.js';

import theme from '@miners/theme';
import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';

const items1 = [{
    canonical_name: "el-mauro.none.ef-mvp.m1.triggers.prisma",
    choices: [{value: {gt: 0, choiceValue: 1}, choice: "Sí"},
        {value: {lte: 0, choiceValue: 0}, choice: "No"}],
    description :"Corresponde a ...",
    name: "Reducción del prisma resistente en el pie del muro"},
{canonical_name: "el-mauro.none.ef-mvp.m1.triggers.distribucion-inadecuada",
    choices: [{value: {gt: 0, choiceValue: 1}, choice: "Sí"},
        {value: {lte: 0, choiceValue: 0}, choice: "No"}],
    description :"Corresponde a ...",
    name: "Distribución inadecuada de lamas o relave en el interior de la cubeta"},
{canonical_name: "el-mauro.none.ef-mvp.m1.triggers.deslizamiento-menor",
    choices: [{value: {gt: 0, choiceValue: 1}, choice: "Sí"},
        {value: {lte: 0, choiceValue: 0}, choice: "No"}],
    description :"Corresponde a ...",
    name:"Deslizamiento superficial de un sector del talud del muro"}
]

const answers =[
    {"el-mauro.none.ef-mvp.m1.triggers.prisma": false,
        "el-mauro.none.ef-mvp.m1.triggers.distribucion-inadecuada": false,
        "el-mauro.none.ef-mvp.m1.triggers.deslizamiento-menor": false}]

const items2 = ["eventos"]
const items3 = [true]

storiesOf('Miners/AnswerTable', module)
    .addDecorator(muiTheme([theme]))
    .add('Normal input props', () => (<AnswerTable items={items1}
        answers={answers} group={items2[0]} daily={items3}/>))
    .add('The component does not receive items and answers objects', () => (<AnswerTable
        group={items2[0]} daily={items3[0]} />))
    .add('The component does not receive any input', () => (<AnswerTable />))

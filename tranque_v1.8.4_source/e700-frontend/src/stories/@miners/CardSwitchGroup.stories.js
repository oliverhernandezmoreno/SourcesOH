import React from 'react';
import CardSwitchGroup from '@miners/components/EF/CardSwitchGroup';

import theme from '../../@miners/theme';
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
    {canonical_name: "el-mauro.none.ef-mvp.m1.triggers.prisma", value: undefined},
    {canonical_name: "el-mauro.none.ef-mvp.m1.triggers.distribucion-inadecuada", value: undefined},
    {canonical_name: "el-mauro.none.ef-mvp.m1.triggers.deslizamiento-menor", value: undefined}]


const handleChangeTriggers = name => event => {
    this.setState({answersTriggers: {...this.state.answersTriggers, [name]: event.target.checked}});
};

storiesOf('Miners/CardSwitchGroup', module)
    .addDecorator(muiTheme([theme]))
    .add('Normal input props', () => (<CardSwitchGroup items={items1}
        answers={answers}
        handleChange={handleChangeTriggers}/> ))
    .add('Undefined items props (Problems with the request)', () => (
        <CardSwitchGroup items={undefined}
            answers={answers[0]}
            handleChange={handleChangeTriggers}/>))
    .add('Undefined answers props (Problems with answers dictionary)', () => (
        <CardSwitchGroup items={items1}
            answers={undefined}
            handleChange={handleChangeTriggers}/>))

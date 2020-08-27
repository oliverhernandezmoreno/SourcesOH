import React from 'react';
import CardSwitch from '@miners/components/EF/CardSwitch';

import theme from '../../@miners/theme';
import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';

const items1 = [{
    canonical_name: "el-mauro.none.ef-mvp.m1.triggers.prisma",
    choices: [{value: {gt: 0, choiceValue: 1}, choice: "Sí"},
        {value: {lte: 0, choiceValue: 0}, choice: "No"}],
    description :"Corresponde a ...",
    name: "Reducción del prisma resistente en el pie del muro"}]

const items2 = [{
    canonical_name: undefined,
    choices: [{value: {gt: 0, choiceValue: 1}, choice: "Sí"},
        {value: {lte: 0, choiceValue: 0}, choice: "No"}],
    description :"Corresponde a ...",
    name: "Reducción del prisma resistente en el pie del muro"}]

const items3 = [{
    canonical_name: "el-mauro.none.ef-mvp.m1.triggers.prisma",
    choices: undefined,
    description :"Corresponde a ...",
    name: undefined}]

const items4 = [{
    canonical_name: "el-mauro.none.ef-mvp.m1.triggers.prisma",
    choices: undefined,
    description : undefined,
    name: "Reducción del prisma resistente en el pie del muro"}]

const answers =[
    {canonical_name: "el-mauro.none.ef-mvp.m1.triggers.prisma", value: undefined}]

/**
* Function to handle a select event.
*
* @public
*/
const handleChangeTriggers = name => event => {
    this.setState({answersTriggers: {...this.state.answersTriggers, [name]: event.target.checked}});
};

storiesOf('Miners/CardSwitch', module)
    .addDecorator(muiTheme([theme]))
    .add(' Normal input props', () => (<CardSwitch values={items1[0]}
        answers={answers[0]}
        handleChange={handleChangeTriggers}/> ))
    .add('Undefined canonical_name props', () => (
        <CardSwitch values={items2[0]}
            answers={answers[0]}
            handleChange={handleChangeTriggers}/>))
    .add('Undefined name props', () => (
        <CardSwitch values={items3[0]}
            answers={answers[0]}
            handleChange={handleChangeTriggers}/>))
    .add('Undefined description props', () => (
        <CardSwitch values={items4[0]}
            answers={answers[0]}
            handleChange={handleChangeTriggers}/>))

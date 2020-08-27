import React from 'react';
import CardRadioButton from '@miners/components/EF/CardRadioButton';
import theme from '../../@miners/theme';
import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';

const items1 = [{
    canonical_name: "el-mauro.none.ef-mvp.m1.triggers.critical.deslizamiento-critico",
    choices: [{value: {gt: 1, choiceValue: 2}, choice: "Sí, gatillará una alerta roja"},
        {value: {lte: 0, choiceValue: 1}, choice: "Sí, gatillará una alerta amarilla"}],
    description :"Corresponde a ...",
    name: "Remoción en masa de terreno natural hacia el muro o hacia sectores críticos"}
]

const items2 = [{
    canonical_name: undefined,
    choices: [{value: {gt: 1, choiceValue: 2}, choice: "Sí, gatillará una alerta roja"},
        {value: {lte: 0, choiceValue: 1}, choice: "Sí, gatillará una alerta amarilla"}],
    description :"Corresponde a ...",
    name: "Reducción del prisma resistente en el pie del muro"}]

const items3 = [{
    canonical_name: "el-mauro.none.ef-mvp.m1.triggers.prisma",
    choices: undefined,
    description :"Corresponde a ...",
    name: undefined}]


const answers =[
    {canonical_name: "el-mauro.none.ef-mvp.m1.triggers.critical.deslizamiento-critico", value: undefined}]
// {canonical_name: "el-mauro.none.ef-mvp.m1.triggers.critical.deslizamiento-mayor", value: undefined},
// {canonical_name: "el-mauro.none.ef-mvp.m1.triggers.deslizamiento-inminente", value: undefined}]


const handleChangeRadioButton = (group,name) => event => {
    if(group === "m1-critical-triggers"){
        const triggers = {...this.props.triggers};
        triggers.answersTriggers[name]= event.target.value;
        this.setState({triggers:triggers})
    }
}

storiesOf('Miners/CardRadioButton', module)
    .addDecorator(muiTheme([theme]))
    .add('Normal input props', () => (<CardRadioButton group={"m1-critical-triggers"}
        values={items1}
        answers={answers}
        handleChangeEvents={handleChangeRadioButton}/> ))
    .add('Undefined canonical_name props', () => (<CardRadioButton group={"m1-critical-triggers"}
        values={items2}
        answers={answers}
        handleChangeEvents={handleChangeRadioButton}/> ))
    .add('Undfined name props ', () => (<CardRadioButton group={"m1-critical-triggers"}
        values={items3}
        answers={answers}
        handleChangeEvents={handleChangeRadioButton}/> ))

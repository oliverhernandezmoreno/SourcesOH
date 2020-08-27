import React from 'react';
import RadioButtonGroup from '@app/components/utils/RadioButtonGroup';
import { storiesOf } from "@storybook/react";


function getOptions(num, description) {
    let options = [];
    for (var i = 0; i < num; i ++) {
        options.push({
            label: `Opción ${i + 1}`,
            value: `option-${i+1}`,
            description: description ? '[Explicación del parámetro Lorem ipsum sit amet, consectetur adipiscing ' +
            'elit, sed do eiusmod tempor incididunt ut labore et dolore mag,a aliqua.' : ''
        })
    }
    return options;
}

const nulls = {label: null, value: null, description: null}
const undefineds={label: undefined, value: undefined, description: undefined}

function getRadioButtonGroup(radioOptions) {
    return <RadioButtonGroup
        value={radioOptions[0]?.value}
        title={<b>OPCIONES:</b>}
        data={radioOptions}
        onChange={() => {}}/>
}

storiesOf('App/RadioButtonGroup', module)
    .add('Example', () => getRadioButtonGroup(getOptions(3)))
    .add('With descriptions', () => getRadioButtonGroup(getOptions(3, true)))
    .add('No options', () => getRadioButtonGroup([]))
    .add('10 options', () => getRadioButtonGroup(getOptions(10)))
    .add('Option with null attributes', () => getRadioButtonGroup([nulls]))
    .add('Option with undefined attributes', () => getRadioButtonGroup([undefineds]))
    .add('Null & undefined options', () => getRadioButtonGroup([null, undefined]))

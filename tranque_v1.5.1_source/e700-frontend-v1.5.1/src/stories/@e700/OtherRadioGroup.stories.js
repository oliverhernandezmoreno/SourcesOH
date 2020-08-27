import React from 'react';
import theme from '@e700/theme';
import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import OtherRadioGroup from '@e700/components/inputs/OtherRadioGroup';

const fields = [
    {
        key: "0",
        type: "radio",
        options: [
            {label: "RadioButton1", value: "rb1"},
            {label: "RadioButton2", value: "rb2"},
            {label: "RadioButton3", value: "rb3"},
            {label: "RadioButton4", value: "rb4"},
            {label: "RadioButton5", value: "rb5"}
        ]
    },
    {
        key: "1",
        type: "radio",
        options: [
            {label: "RadioButton1", value: "rb1", allowText: true},
            {label: "RadioButton2", value: "rb2"},
            {label: "RadioButton3", value: "rb3", allowText: true},
            {label: "RadioButton4", value: "rb4"},
            {label: "RadioButton5", value: "rb5", allowText: true}
        ]
    },
    {
        key: "2",
        type: "radio",
        options: [
            {label: "RadioButton1", value: "rb1", allowText: true},
            {label: "RadioButton2", value: "rb2", allowText: true},
            {label: "RadioButton3", value: "rb3", allowText: true},
            {label: "RadioButton4", value: "rb4", allowText: true},
            {label: "RadioButton5", value: "rb5", allowText: true}
        ]
    },
]

const answers = [
    {"0": { key: 5, value: "rb2" }},
    {"1": { key: 5, value: "rb2" }},
    {"2": { key: 5, value: "rb2", 'text': 'default text' }},
];

storiesOf('e700/Other Radio Group', module)
    .addDecorator(muiTheme([theme]))
    .add('Example', () => (
        <OtherRadioGroup defaultValue={answers["0"]}
            onChange={() => {}}
            options={fields[0].options}
            state={'open'}
        />
    ))
    .add('Some with optional text field', () => (
        <OtherRadioGroup defaultValue={answers["1"]}
            onChange={() => {}}
            options={fields[1].options}
            state={'open'}
        />
    ))
    .add('All with optional text fields', () => (
        <OtherRadioGroup defaultValue={answers["2"]}
            onChange={() => {}}
            options={fields[2].options}
            state={'open'}
        />
    ))
    .add('Disabled', () => (
        <OtherRadioGroup disabled
            defaultValue={answers["1"]}
            options={fields[1].options}
        />
    ))






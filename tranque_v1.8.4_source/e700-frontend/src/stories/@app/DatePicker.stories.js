import React from 'react';
import CustomDatePicker from '@app/components/utils/DatePicker';
import { storiesOf } from "@storybook/react";
import { action } from '@storybook/addon-actions';

storiesOf('App/CustomDatePicker', module)
    .add('customDatePicker', () => (<CustomDatePicker onChange={action('clicked')}/> ))
    .add('default', () => <CustomDatePicker onChange={() => action('clicked')}/>);

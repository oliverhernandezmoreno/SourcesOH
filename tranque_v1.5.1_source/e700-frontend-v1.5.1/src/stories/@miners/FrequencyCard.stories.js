import React from 'react';
import FrequencyCard from '@miners/components/FrequencyCard';
import { storiesOf } from "@storybook/react";

storiesOf('Miners/FrequencyCard', module)
    .add('frequencyCard', () => (<FrequencyCard/> ));

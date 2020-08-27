import React from 'react';

import theme from '../../@authorities/theme';
import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';

import IconTextGrid from '@app/components/utils/IconTextGrid';
import CheckCircle from '@material-ui/icons/CheckCircle';
import { Container, Typography } from '@material-ui/core';

// ARRANGE
const simpleText = "Texto corto";
const longText = "Este es un texto largo con un ícono al lado derecho"

// ACT
storiesOf('App/IconTextGrid', module)
    .addDecorator(muiTheme([theme]))
    .add('Simple Icon + Text', () => (
        <React.Fragment>
            <IconTextGrid text={simpleText} icon={<CheckCircle />}/>
            <IconTextGrid text={longText} icon={<CheckCircle />} />
        </React.Fragment>
    ))
    .add('inside a container with a fixed width', () => (
        <Container style={{width: "300px"}}>
            <IconTextGrid text={longText} icon={<CheckCircle />} />
        </Container>
    ))
    .add('Text inside a Typography component', () => (
        <Container style={{width: "300px"}}>
            <IconTextGrid text={<Typography>{longText}</Typography>} icon={<CheckCircle />} />
        </Container>

    ));

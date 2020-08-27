import React from 'react';
import theme from '@authorities/theme';
import {storiesOf} from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import AlertBox from '@authorities/components/home/AlertBox';


const EF = 'ef';
const EMAC = 'emac';
const EF_EMAC = 'ef+emac';

storiesOf('Authorities/AlertBox/EF', module)
    .addDecorator(muiTheme([theme]))
    .add('Red (number 5 should be displayed)', () => (
        <AlertBox
            alertType={'red-alert'}
            selectedProfile={EF}
            efTotal={5}
            emacTotal={10}
        />))
    .add('Yellow (number 5 should be displayed)', () => (
        <AlertBox
            alertType={'yellow-alert'}
            selectedProfile={EF}
            efTotal={5}
            emacTotal={10}
        />))
    .add('Disconnected (number 5 should be displayed)', () => (
        <AlertBox
            alertType={'disconnected-alert'}
            selectedProfile={EF}
            efTotal={5}
            emacTotal={10}
        />))

storiesOf('Authorities/AlertBox/EMAC', module)
    .addDecorator(muiTheme([theme]))
    .add('Red (number 10 should be displayed)', () => (
        <AlertBox
            alertType={'red-alert'}
            selectedProfile={EMAC}
            efTotal={5}
            emacTotal={10}
        />))
    .add('Yellow (number 10 should be displayed)', () => (
        <AlertBox
            alertType={'yellow-alert'}
            selectedProfile={EMAC}
            efTotal={5}
            emacTotal={10}
        />))
    .add('Disconnected (number 10 should be displayed)', () => (
        <AlertBox
            alertType={'disconnected-alert'}
            selectedProfile={EMAC}
            efTotal={5}
            emacTotal={10}
        />))

storiesOf('Authorities/AlertBox/EF+EMAC', module)
    .addDecorator(muiTheme([theme]))
    .add('Red (number 15 should be displayed)', () => (
        <AlertBox
            alertType={'red-alert'}
            selectedProfile={EF_EMAC}
            efTotal={5}
            emacTotal={10}
        />))
    .add('Yellow (number 15 should be displayed)', () => (
        <AlertBox
            alertType={'yellow-alert'}
            selectedProfile={EF_EMAC}
            efTotal={5}
            emacTotal={10}
        />))
    .add('Disconnected (number 15 should be displayed)', () => (
        <AlertBox
            alertType={'disconnected-alert'}
            selectedProfile={EF_EMAC}
            efTotal={5}
            emacTotal={10}
        />))

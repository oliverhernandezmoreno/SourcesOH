import React from 'react';

import theme from '@authorities/theme';

import {Container} from '@material-ui/core';
import {storiesOf} from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import {TargetMap} from '@authorities/components/map/TargetMap';
import {generateTargetData, TARGETS_CENTER} from 'stories/data/targets';
import {createMemoryHistory} from 'history';
import {Route, Router} from 'react-router-dom';

function C(props) {
    return <Container {...props} style={{height: '600px'}} maxWidth="lg"/>;
}

const commonProps = {
    center: TARGETS_CENTER,
    zoom: 12
};

storiesOf('Authorities/TargetMap', module)
    .addDecorator(muiTheme([theme]))
    .addDecorator(story => (
        <Router history={createMemoryHistory({initialEntries: ['/']})}>
            <Route path="/" component={() => story()}/>
        </Router>
    ))
    .addDecorator(muiTheme([theme]))
    .add('empty', () => (<C><TargetMap {...commonProps}/></C>))
    .add('multiple targets',
        () => {
            const {targets, tickets} = generateTargetData(12, 3, 1, "ef");
            return <C><TargetMap {...commonProps} targets={targets} tickets={tickets} profile="ef"/></C>;
        }
    );

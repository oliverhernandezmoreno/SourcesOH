import React, {useState} from 'react';

import theme from '@authorities/theme';

import {Container} from '@material-ui/core';
import {storiesOf} from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import {ResponsiveMap} from '@app/components/map/ResponsiveMap';
import {Marker, Popup} from 'react-leaflet';
import {JSXMarker} from '@app/components/map/JSXMarker';

function TestContainer(props) {
    return <Container {...props} style={{height: '600px'}} maxWidth="lg"/>;
}

storiesOf('App/ResponsiveMap', module)
    .addDecorator(muiTheme([theme]))
    .add('no props', () => (<Container maxWidth="lg"><ResponsiveMap/></Container>))
    .add('some props', () => {
        const props = {
            center: [51.5, -0.09],
            zoom: 10
        };
        return (
            <TestContainer>
                <div>PROPS:</div>
                <pre>{JSON.stringify(props, null, 2)}</pre>
                <ResponsiveMap {...props}/>
            </TestContainer>
        );
    })
    .add('some props and a pop up marker', () => {
        const position = [51.5, -0.09];
        const props = {
            center: position,
            zoom: 10
        };
        return (
            <TestContainer>
                <div>PROPS:</div>
                <pre>{JSON.stringify(props, null, 2)}</pre>
                <ResponsiveMap {...props}>
                    <Marker position={position}>
                        <Popup>
                            A pretty CSS3 popup. <br/> Easily customizable.
                        </Popup>
                    </Marker>
                </ResponsiveMap>
            </TestContainer>
        );
    })
    .add('satellite and a pop up marker', () => {
        const position = [51.5, -0.09];
        const props = {
            satellite: true,
            center: position,
            zoom: 10
        };
        return (
            <TestContainer>
                <div>PROPS:</div>
                <pre>{JSON.stringify(props, null, 2)}</pre>
                <ResponsiveMap {...props}>
                    <Marker position={position}>
                        <Popup>
                            A pretty CSS3 popup. <br/> Easily customizable.
                        </Popup>
                    </Marker>
                </ResponsiveMap>
            </TestContainer>
        );
    })
    .add('JSXMarker (react component as marker)', () => {
        const position = [51.5, -0.09];
        const [counter, setCounter] = useState(0);
        const props = {
            satellite: false,
            center: position,
            zoom: 10
        };
        return (
            <TestContainer>
                <ResponsiveMap {...props}>
                    <JSXMarker position={position}>
                        <Popup>
                            Custom marker on [51.5, -0.09]
                        </Popup>
                        <div
                            style={{
                                backgroundColor: ['blue', 'green'][counter % 2],
                                color: 'white',
                                whiteSpace: 'nowrap',
                                padding: '5px 10px'
                            }}
                            onClick={() => setCounter(counter + 1)}>
                            Click ME!
                        </div>
                        clicks: {counter}
                    </JSXMarker>
                </ResponsiveMap>
            </TestContainer>
        );
    });

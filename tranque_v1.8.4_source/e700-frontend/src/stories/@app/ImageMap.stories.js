import React from 'react';
import theme from '@authorities/theme';
import {storiesOf} from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import ImageMap from '@app/components/map/ImageMap';
import tranqueImage from '../data/tranque.jpg';


const imageProps = {
    name: 'Imagen de un depósito',
    width: 690,
    imageUrl: tranqueImage,
    imageName: 'image-tranque',
    imageWidth: 690,
    imageHeight: 436
}

storiesOf('App/ImageMap', module)
    .addDecorator(muiTheme([theme]))
    .add('Example', () => <ImageMap {...imageProps}/>)
    .add('loading image', () => <ImageMap {...imageProps} loading/>)
    .add('Without image', () => <ImageMap {...imageProps} imageUrl={null}/>)
    .add('Large image', () =>
        <div>
            Imagen de 1000x632 se adapta al ancho declarado en el componente (690)
            <ImageMap {...imageProps} imageWidth={1000} imageHeight={632}/>
        </div>
    )


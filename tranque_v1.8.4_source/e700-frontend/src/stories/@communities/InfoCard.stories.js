import React from 'react';
import theme from '@communities/theme';
import { storiesOf } from '@storybook/react';
import {muiTheme} from 'storybook-addon-material-ui';
import logo from '../data/logo_tranque.png';
import InfoCard from '@communities/components/home/InfoCard';
import Grid from '@material-ui/core/Grid';

const divStyle = {background: 'linear-gradient(180deg, #36ADDC 0%, #007FBD 100%)'};

const data = {
    id: 0,
    title: 'Observatorio de Relaves',
    image_url: logo,
    description: 'Es la iniciativa público-privada encargada de dar seguimiento a la actividad de' +
               ' los depósitos de relave a nivel nacional. Si bien hay varios organismos públicos participantes,' +
               ' el principal actor es el Servicio Nacional de Geología y Minería.'
}

const longData = {
    id: 1,
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, ' +
         'sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
    image_url: logo,
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, ' +
               'sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' +
               'Ullamcorper a lacus vestibulum sed arcu non odio. ' +
               'Sapien nec sagittis aliquam malesuada bibendum arcu vitae elementum. ' +
               'Nec feugiat nisl pretium fusce id velit ut tortor pretium. ' +
               'Auctor eu augue ut lectus. Commodo viverra maecenas accumsan lacus. ' +
               'Faucibus pulvinar elementum integer enim neque volutpat ac. ' +
               'Vitae tempus quam pellentesque nec nam aliquam sem. ' +
               'Etiam dignissim diam quis enim lobortis scelerisque. ' +
               'Quam adipiscing vitae proin sagittis nisl rhoncus mattis rhoncus urna. ' +
               'Ullamcorper dignissim cras tincidunt lobortis feugiat vivamus. ' +
               'Scelerisque purus semper eget duis at. ' +
               'Eget nunc lobortis mattis aliquam faucibus purus in massa. ' +
               'Pharetra sit amet aliquam id diam maecenas ultricies mi. ' +
               'Pellentesque habitant morbi tristique senectus et netus. ' +
               'In cursus turpis massa tincidunt dui ut ornare lectus sit. ' +
               'Vitae congue eu consequat ac felis. Et tortor consequat id porta nibh venenatis cras sed.\n\n' +
               'Bibendum arcu vitae elementum curabitur vitae nunc. ' +
               'Egestas tellus rutrum tellus pellentesque eu tincidunt tortor aliquam nulla. ' +
               'Viverra mauris in aliquam sem. Massa id neque aliquam vestibulum. ' +
               'Suscipit tellus mauris a diam maecenas sed enim. Nunc mattis enim ut tellus elementum. ' +
               'Vitae justo eget magna fermentum iaculis. Tristique senectus et netus et malesuada fames ac turpis. ' +
               'Pretium vulputate sapien nec sagittis. Eget lorem dolor sed viverra ipsum nunc aliquet. ' +
               'Lorem sed risus ultricies tristique nulla aliquet enim. Enim tortor at auctor urna nunc id cursus metus. ' +
               'Fringilla urna porttitor rhoncus dolor purus non enim. Lectus arcu bibendum at varius vel pharetra vel turpis. ' +
               'Proin fermentum leo vel orci porta non pulvinar.'}

const noData = {
    id: 2,
    title: null,
    image_url: null,
    description: null
}

const emptyData = {
    id: 3,
    title: '',
    image_url: '',
    description: ''
}

const undefinedData = {
    id: 4,
    title: undefined,
    image_url: undefined,
    description: undefined
}

const onlyDescriptionData = {
    id: 5,
    title: null, image: null,
    description: "Esta es una targeta sin título ni imagen. Sólo hay una descripción."
}

storiesOf('Communities/InfoCard', module)
    .addDecorator(muiTheme([theme]))
    .addParameters({ component: InfoCard,
        info: 'Se utiliza un "div" con fondo de color para visualizar mejor el componente, ' +
              'es decir, el fondo no es parte del componente InfoCard.' })
    .add('Simple example', () => (
        <div style={divStyle}>
            <InfoCard id={data.id} title={data.title} image={data.image_url} description={data.description} />
        </div>
    ))
    .add('Long data', () => (
        <div style={divStyle}>
            <InfoCard id={longData.id} title={longData.title} image={longData.image_url} description={longData.description} />
        </div>
    ))
    .add('No data', () => (
        <div style={divStyle}>
            <InfoCard id={noData.id} title={noData.title} image={noData.image_url} description={noData.description} />
        </div>
    ))
    .add('Empty data', () => (
        <div style={divStyle}>
            <InfoCard id={emptyData.id} title={emptyData.title} image={emptyData.image_url} description={emptyData.description} />
        </div>
    ))
    .add('Undefined data', () => (
        <div style={divStyle}>
            <InfoCard id={undefinedData.id} title={undefinedData.title} image={undefinedData.image_url} description={undefinedData.description} />
        </div>
    ))
    .add('Only description', () => (
        <div style={divStyle}>
            <InfoCard id={onlyDescriptionData.id} title={onlyDescriptionData.title} image={onlyDescriptionData.image_url}
                description={onlyDescriptionData.description} />
        </div>
    ))
    .add('Group of info cards', () => (
        <div style={divStyle}>
            <Grid container>
                <Grid item xs={12} sm={12} lg={4}>
                    <InfoCard id={data.id} title={data.title} image={data.image_url} description={data.description} />
                </Grid>
                <Grid item xs={12} sm={12} lg={4}>
                    <InfoCard id={longData.id} title={longData.title} image={longData.image_url} description={longData.description} />
                </Grid>
                <Grid item xs={12} sm={12} lg={4}>
                    <InfoCard id={noData.id} title={noData.title} image={noData.image_url} description={noData.description} />
                </Grid>
                <Grid item xs={12} sm={12} lg={4}>
                    <InfoCard id={emptyData.id} title={emptyData.title} image={emptyData.image_url} description={emptyData.description} />
                </Grid>
                <Grid item xs={12} sm={12} lg={4}>
                    <InfoCard id={undefinedData.id} title={undefinedData.title} image={undefinedData.image_url} description={undefinedData.description} />
                </Grid>
                <Grid item xs={12} sm={12} lg={4}>
                    <InfoCard id={onlyDescriptionData.id} title={onlyDescriptionData.title} image={onlyDescriptionData.image_url}
                        description={onlyDescriptionData.description} />
                </Grid>
            </Grid>
        </div>
    ))

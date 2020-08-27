import React from 'react';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import * as mapsService from '@app/services/backend/maps';
import * as SiteParameterService from '@app/services/backend/siteParameter';
import * as config from '@app/config';
import {withRouter} from 'react-router';
import InstrumentsMap from '@app/components/map/InstrumentsMap';
import {ConsoleHelper} from '@app/ConsoleHelper';

class InstrumentsMapContainer extends SubscribedComponent {

    state = {
        imageUrl: '',
        imageWidth: 0,
        imageHeight: 0,
        imageName: '',
        upperRightX: 0,
        upperRightY: 0,
        lowerLeftX: 0,
        lowerLeftY: 0,
        mapProps: null,
        showImage: false
    }

    componentDidMount() {
        this.loadMaps();
        this.getMapParameters();
    }

    loadMaps() {
        const {map_canonical_name} = this.props;
        this.setState({showImage: false});
        const {target} = this.props.match.params;
        this.subscribe(
            mapsService.listAll({target}),
            (data) => {
                const map = data.find(m => m.canonical_name === map_canonical_name);
                if (!map) return null;
                this.setState({
                    imageUrl: map.image,
                    upperRightX: map.upper_right_deg_coords.lat,
                    upperRightY: map.upper_right_deg_coords.lng,
                    lowerLeftX: map.lower_left_deg_coords.lat,
                    lowerLeftY: map.lower_left_deg_coords.lng,
                    showImage: true,
                    imageWidth: map.image_width,
                    imageHeight: map.image_height,
                    imageName: map.name
                })
            },
            (err) => ConsoleHelper("Error al cargas mapas " + err, "log")
        );
    }

    getMapParameters() {
        this.subscribe(
            SiteParameterService.getMapParameters({
                cache: config.DEFAULT_CACHE_TIME * 3
            }),
            (mapProps) => this.setState({mapProps}),
            (err) => ConsoleHelper("Error en siteParemeters service", "log")
        );
    }

    render() {
        const {dataSources, name} = this.props;
        const {mapProps, upperRightX, upperRightY, lowerLeftX, lowerLeftY, imageUrl, showImage, imageName, imageWidth, imageHeight} = this.state;
        const image = {upperRightX, upperRightY, lowerLeftX, lowerLeftY, imageUrl, imageName, imageWidth, imageHeight};
        const InstrumentsMapProps = {dataSources, mapProps: {...mapProps, zoom: 18}, showImage, image};
        if (!mapProps && !showImage) return '';
        return <InstrumentsMap name={name} {...InstrumentsMapProps}/>;
    }
}

export default withRouter(InstrumentsMapContainer);

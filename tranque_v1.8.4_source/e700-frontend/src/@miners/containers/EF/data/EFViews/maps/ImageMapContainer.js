import React from 'react';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import * as mapsService from '@app/services/backend/maps';
import {withRouter} from 'react-router';
import ImageMap from '@app/components/map/ImageMap';
import {ConsoleHelper} from '@app/ConsoleHelper';

class ImageMapContainer extends SubscribedComponent {

    state = {
        imageUrl: '',
        imageName: '',
        loading: false
    }

    componentDidMount() {
        this.loadMaps();
    }

    loadMaps() {
        const {map_canonical_name} = this.props;
        const {target} = this.props.match.params;
        this.setState({loading: true});
        this.subscribe(
            mapsService.listAll({target}),
            (data) => {
                const map = data.find(m => m.canonical_name === map_canonical_name);
                if (!map) this.setState({loading: false});
                else {
                    this.setState({
                        imageUrl: map.image,
                        imageName: map.name,
                        imageWidth: map.image_width,
                        imageHeight: map.image_height,
                        loading: false
                    });
                }
            },
            (err) => {
                this.setState({loading: false});
                ConsoleHelper("Error al cargas mapas " + err, "log");
            }
        );
    }

    render() {
        const {name, width} = this.props;
        const {imageUrl, imageName, imageWidth, imageHeight, loading} = this.state;
        const imageProps = {name, width, imageUrl, imageName, imageWidth, imageHeight, loading}
        return <ImageMap {...imageProps}/>;
    }
}

export default withRouter(ImageMapContainer);

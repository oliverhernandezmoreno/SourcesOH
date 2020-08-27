import React, {Component} from 'react';
import 'leaflet/dist/leaflet.css';
import {LayersControl, Map, TileLayer, ImageOverlay} from 'react-leaflet';
import L from 'leaflet';
import PropTypes from 'prop-types';

// Fix default icon marker not working when importing css in component
// https://github.com/PaulLeCam/react-leaflet/issues/453
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const MIN_HEIGHT = 200;

export class ResponsiveMap extends Component {
    constructor(props) {
        super(props);
        this.wrapperRef = React.createRef();
        this.mapRef = React.createRef();
    }

    state = {
        height: MIN_HEIGHT
    };

    updateDimensions = () => {
        const {clientHeight} = this.wrapperRef.current;
        const height = clientHeight > MIN_HEIGHT ? clientHeight : MIN_HEIGHT;
        this.setState({height: height});
    };

    componentDidMount() {
        this.updateDimensions();
        window.addEventListener('resize', this.updateDimensions);
    }

    componentDidUpdate(prevProps, prevState) {
        const {fitBounds} = this.props;
        if (prevState.height !== this.state.height) {
            this.mapRef.current.leafletElement.invalidateSize();
        }
        if (fitBounds) {
            this.mapRef.current.leafletElement.fitBounds(fitBounds);
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }


    render() {
        const {
            imageLayer,
            image,
            imageName,
            imageBounds,
            mapLayerUrl,
            mapAttribution,
            satelliteLayerUrl,
            satelliteAttribution,
            style,
            layers,
            layersProps,
            children,
            satellite,
            controlledLayers,
            ...rest
        } = this.props;
        const mapProps = {
            center: [-38.134556, -72.465820],
            zoom: 4,
            ref: this.mapRef,
            ...rest,
            style: {...style, height: this.state.height, width: '100%'}
        };
        const _controlledLayers = (controlledLayers || []).slice();

        if (satelliteLayerUrl && !imageLayer) {
            _controlledLayers.unshift(
                <LayersControl.BaseLayer key={"satelite"} name="Satelite" checked={satellite}>
                    <TileLayer
                        url={satelliteLayerUrl}
                        attribution={satelliteAttribution}
                    />
                </LayersControl.BaseLayer>
            );
        }
        if (imageLayer) {
            _controlledLayers.unshift(
                <LayersControl.BaseLayer key='image' name={imageName} checked={!satellite}>
                    <ImageOverlay
                        url={image}
                        bounds={imageBounds}
                    />
                </LayersControl.BaseLayer>
            )
        }
        else if (mapLayerUrl) {
            _controlledLayers.unshift(
                <LayersControl.BaseLayer key={"mapa"} name="Mapa" checked={!satellite}>
                    <TileLayer
                        url={mapLayerUrl}
                        attribution={mapAttribution}
                    />
                </LayersControl.BaseLayer>
            );
        }

        return (
            <div ref={this.wrapperRef} style={{width: '100%', height: '100%'}}>
                <Map {...mapProps}>
                    <LayersControl position="topright" collapsed={false} {...layersProps}>
                        {_controlledLayers}
                    </LayersControl>
                    {children}
                </Map>
            </div>
        );
    }
}

ResponsiveMap.propTypes = {
    controlledLayers: PropTypes.node,
    layersProps: PropTypes.object,
    mapLayerUrl: PropTypes.string,
    mapAttribution: PropTypes.string,
    satelliteLayerUrl: PropTypes.string,
    satelliteAttribution: PropTypes.string
};

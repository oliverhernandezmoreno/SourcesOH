import * as React from 'react';
import {createPortal} from 'react-dom';
import {DivIcon, Marker} from 'leaflet';
import {LeafletProvider, MapLayer, withLeaflet} from 'react-leaflet';

// Adapted from https://stackoverflow.com/a/54504646
export const JSXMarker = withLeaflet(
    class extends MapLayer {
        constructor(props) {
            super(props);
            this.leafletElement.on('add', () => this.forceUpdate());
        }

        createLeafletElement(props) {
            const {map, layerContainer, position, ...rest} = props;

            // when not providing className, the element's background is a white square
            // when not providing iconSize, the element will be 12x12 pixels
            const icon = new DivIcon({...rest, className: '', iconSize: undefined});

            const el = new Marker(position, {icon: icon, ...rest});
            this.contextValue = {...props.leaflet, popupContainer: el};
            return el;
        }

        updateLeafletElement(fromProps, toProps) {
            const {position: fromPosition, zIndexOffset: fromZIndexOffset, opacity: fromOpacity, draggable: fromDraggable, className: fromClassName} = fromProps;
            const {position: toPosition, zIndexOffset: toZIndexOffset, toOpacity, draggable: toDraggable, className: toClassName} = toProps;

            if (toPosition !== fromPosition) {
                this.leafletElement.setLatLng(toPosition);
            }
            if (toZIndexOffset !== fromZIndexOffset) {
                this.leafletElement.setZIndexOffset(toZIndexOffset);
            }
            if (toOpacity !== fromOpacity) {
                this.leafletElement.setOpacity(toOpacity);
            }
            if (toDraggable !== fromDraggable) {
                if (toDraggable) {
                    this.leafletElement.dragging.enable();
                } else {
                    this.leafletElement.dragging.disable();
                }
            }
            if (toClassName !== fromClassName) {
                const fromClasses = fromClassName.split(' ');
                const toClasses = toClassName.split(' ');
                this.leafletElement._icon.classList.remove(...fromClasses);
                this.leafletElement._icon.classList.add(...toClasses);
            }
        }

        componentDidUpdate(fromProps) {
            this.updateLeafletElement(fromProps, this.props);
        }

        render() {
            const {children} = this.props;
            const container = this.leafletElement._icon;

            if (!container) {
                return null;
            }

            const portal = createPortal(children, container);
            return children == null || portal == null || this.contextValue == null ? null : (
                <LeafletProvider value={this.contextValue}>{portal}</LeafletProvider>
            );
        }
    }
);

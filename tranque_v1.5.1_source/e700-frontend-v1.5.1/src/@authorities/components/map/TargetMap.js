import React from 'react';
import PropTypes from 'prop-types';
import {ResponsiveMap} from '@app/components/map/ResponsiveMap';
import {TargetMarker} from '@authorities/components/map/TargetMarker';
import {getTargetTickets, getAlertColor, getAlertLabel} from '@authorities/services/tickets';
import { NO_ALERT_COLOR, YELLOW_ALERT_COLOR, RED_ALERT_COLOR, DISCONNECTED_ALERT_COLOR } from '@authorities/constants/alerts';
import {LayerGroup, LayersControl} from 'react-leaflet';

export function getAlertZIndex(alertColor) {
    switch (alertColor) {
        default:
        case NO_ALERT_COLOR:
            return 1;
        case YELLOW_ALERT_COLOR:
            return 2;
        case RED_ALERT_COLOR:
            return 3;
        case DISCONNECTED_ALERT_COLOR:
            return -1;
    }
}

export function TargetMap({targets, tickets, profile, ...rest}) {
    const targetsRender = targets.map(
        (target, i) => {
            if (!target.deg_coords) {
                return null;
            }
            const targetTickets = getTargetTickets(target.canonical_name, tickets);
            const alertColor = getAlertColor(targetTickets, profile);
            return {
                marker: <TargetMarker target={target} color={alertColor} zIndexOffset={getAlertZIndex(alertColor) * 1000} key={i}/>,
                color: alertColor
            };
        }
    ).reduce((acc, i) => ({...acc, [i.color]: [...(acc[i.color] || []), i.marker]}), {});
    const entries = Object.entries(targetsRender);
    entries.sort((a, b) => +a[0] > +b[0] ? 1 : -1);
    const layers = entries.map(([color, markers], i, entries) => (
        <LayersControl.Overlay key={color} name={getAlertLabel(color)} checked={true}>
            <LayerGroup>
                {markers}
            </LayerGroup>
        </LayersControl.Overlay>
    ));

    return <ResponsiveMap {...rest} controlledLayers={layers}/>;
}

TargetMap.propTypes = {
    targets: PropTypes.array.isRequired,
    tickets: PropTypes.array.isRequired
};

TargetMap.defaultProps = {
    targets: [],
    tickets: []
};

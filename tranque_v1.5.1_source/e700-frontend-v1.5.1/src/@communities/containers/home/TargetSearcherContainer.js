import React from 'react'
import * as ZoneService from '@app/services/backend/zone';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import TargetSearcher from '@communities/components/home/TargetSearcher';



class TargetSearcherContainer extends SubscribedComponent {

        state = {
            selectedRegion: "",
            selectedCommune: "",
            zoneInfo: [],
            regionCommunes: []
        };

        componentDidMount() {
            this.getZoneInfo();
        }


        getZoneInfo() {
            this.subscribe(
                ZoneService.listAllPublic(),
                zones => {
                    this.setState({
                        zoneInfo: ZoneService.parseZoneOptions(zones),
                    });
                }
            );
        }


        render() {
            return (<TargetSearcher regions={this.state.zoneInfo} />);
        }
}



export default TargetSearcherContainer;

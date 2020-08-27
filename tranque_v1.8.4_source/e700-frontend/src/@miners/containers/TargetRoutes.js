import React from 'react';
import {Route, Switch} from 'react-router';

import {Box} from '@material-ui/core';
import EMACRoutes from '@miners/containers/EMAC/EMAC.Routes';
import EFRoutes from '@miners/containers/EF/EF.Routes';
import {BasicInfoContainer} from '@authorities/containers/target/BasicInfoContainer';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import * as TargetService from '@app/services/backend/target';
import * as CameraService from '@app/services/backend/cameras';
import C40X from '@app/components/utils/C40X';
import {route} from '@app/urls';
import {ConsoleHelper} from '@app/ConsoleHelper';

export default class TargetRoutes extends SubscribedComponent {

    state = {
        targetData: {},
        cameras: [],
        videoFrames: [],
    }

    getTargetData = () => {
        const target = this.props.match.params.target;
        this.subscribe(
            TargetService.get({canonical_name: target}),
            targetData => {
                targetData.entityName = targetData?.work_sites?.length > 0 ? targetData.work_sites[0].entity.name : "--";
                targetData.regionName = targetData?.zone?.zone_hierarchy?.length > 0 ? targetData.zone.zone_hierarchy[1].name : "--";
                targetData.comunaName = targetData?.zone?.name ? targetData.zone.name : "--";
                targetData.workSiteName = targetData?.work_sites?.length > 0 ? targetData.work_sites[0].name : '--';

                this.setState({targetData});
            }
        );
    }

    getCamerasData = () => {
        const target = this.props.match.params.target;
        this.subscribe(
            CameraService.listAll({target}),
            cameras => {
                this.setState({cameras});
                cameras.forEach(cam => {
                    if (cam.video_frames.length > 0) this.getVideoFrameBlob(cam.id, cam.video_frames[0].id);
                });
            }
        )
    }

    getVideoFrameBlob = (cameraId, frameId) => {
        const target = this.props.match.params.target;
        this.subscribe(
            CameraService.downloadVideoFrame({target: target, cameraId, frameId, getBlobUrl: true}),
            res => {
                this.setState(state => ({
                    videoFrames: {...state.videoFrames, [frameId]: res}
                }));
            }
        );
    }

    componentDidMount() {
        this.getTargetData();
        this.getCamerasData();
    }

    render() {
        const target = this.props.match.params.target;
        const {targetData, cameras, videoFrames} = this.state;
        ConsoleHelper(cameras + " " + videoFrames, "log");
        return (
            <Switch>
                {/* Basic Info */}
                <Route path={route('miners.target.info')}
                    render={(props) => <Box px={5}><BasicInfoContainer
                        target={targetData}
                        cameras={cameras}
                        videoFrames={videoFrames}
                        entityName={targetData?.entityName}
                        regionName={targetData?.regionName}
                        comunaName={targetData?.comunaName}
                        workSiteName={targetData?.workSiteName}/></Box>}/>
                {/* EMAC */}
                <Route path={route('miners.target.emac')}
                    render={(props) => <EMACRoutes {...props} target={target}/>}/>
                {/* EF */}
                <Route path={route('miners.target.ef')}
                    render={(props) => <EFRoutes {...props} target={target}/>}/>
                {/* DEFAULT 404 */}
                <Route path={route('miners.target')} component={C40X}/>
            </Switch>
        );
    }
}

import {CONNECTED, CONNECTED_WINDOW, FAILED, NOT_IN_SMC} from '@authorities/constants/connectionState';
import moment from 'moment';

export function getRemoteStatus(remote) {
    if (!remote) {
        return NOT_IN_SMC;
    }
    if (moment().subtract(CONNECTED_WINDOW, 'minutes').isSameOrBefore(moment(remote.last_seen))) {
        return CONNECTED;
    } else {
        return FAILED;
    }
}

import {getRemoteStatus} from '@authorities/services/remote';
import moment from 'moment';
import {CONNECTED, CONNECTED_WINDOW, FAILED, NOT_IN_SMC} from '@authorities/constants/connectionState';

describe('getRemoteStatus ', () => {
    it('should return correct status', () => {
        const old = moment().subtract(CONNECTED_WINDOW * 2, 'minutes');
        const ok = moment().subtract(CONNECTED_WINDOW / 2, 'minutes');

        // Assert:
        expect(getRemoteStatus(null)).toEqual(NOT_IN_SMC);
        expect(getRemoteStatus({
            namespace: 'namespace',
            last_seen: old.toISOString()
        })).toEqual(FAILED);
        expect(getRemoteStatus({
            namespace: 'namespace',
            last_seen: null
        })).toEqual(FAILED);
        expect(getRemoteStatus({
            namespace: 'namespace',
            last_seen: ok.toISOString()
        })).toEqual(CONNECTED);
    });
});

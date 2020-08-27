import { PENDING, APPROVED, APPROVED_AND_USED, DENIED, getNumberOfRequests } from "@alerts_events/constants/authorizationStates"
import { ARCHIVE, UNESCALATE, CLOSE, ESCALATE } from "@alerts_events/constants/userActions";


function getRequest(authorizationString, status, scope) {
    return {
        authorization: authorizationString,
        created_at: "2020-05-12T16:03:51.240897Z",
        id: "uobaQjSEU7q31DvZqdtQsg",
        resolved_at: '',
        resolved_by: '',
        status: status,
        ticket: { scope }
    }
}

const EF = 'ef';
const EMAC = 'emac';

const requests = [
    getRequest('ticket.B.close.authorization.miner-2', PENDING, EF),
    getRequest('ticket.B.close.authorization.miner-2', APPROVED, EF),
    getRequest('ticket.B.close.authorization.miner-2', APPROVED_AND_USED, EF),
    getRequest('ticket.B.close.authorization.miner-2', DENIED, EF),
    getRequest('ticket.B.close.authorization.miner-2', PENDING, EMAC),
    getRequest('ticket.B.close.authorization.miner-2', APPROVED, EMAC),
    getRequest('ticket.B.close.authorization.miner-2', APPROVED_AND_USED, EMAC),
    getRequest('ticket.B.close.authorization.miner-2', DENIED, EMAC),
    getRequest('ticket.A.close.authorization.miner-2', PENDING, EF),
    getRequest('ticket.C.close.authorization.miner-2', PENDING, EF),
    getRequest('ticket.D.close.authorization.miner-2', PENDING, EF),
    getRequest('ticket.YELLOW.close.authorization.authority-2', PENDING, EMAC),
    getRequest('ticket.A.close.authorization.miner-1', PENDING, EMAC),

    getRequest('ticket.B.escalate.C.authorization.miner-2', PENDING, EF),
    getRequest('ticket.B.escalate.C.authorization.miner-2', APPROVED, EF),
    getRequest('ticket.B.escalate.C.authorization.miner-2', APPROVED_AND_USED, EF),
    getRequest('ticket.B.escalate.C.authorization.miner-2', DENIED, EF),
    getRequest('ticket.B.escalate.C.authorization.miner-2', PENDING, EMAC),
    getRequest('ticket.B.escalate.C.authorization.miner-2', APPROVED, EMAC),
    getRequest('ticket.B.escalate.C.authorization.miner-2', APPROVED_AND_USED, EMAC),
    getRequest('ticket.B.escalate.C.authorization.miner-2', DENIED, EMAC),
    getRequest('ticket.A.escalate.B.authorization.miner-2', PENDING, EF),
    getRequest('ticket.C.escalate.D.authorization.miner-2', PENDING, EF),
    getRequest('ticket.B.escalate.D.authorization.miner-2', PENDING, EF),
    getRequest('ticket.A.escalate.C.authorization.miner-2', PENDING, EF),
    getRequest('ticket.A.escalate.D.authorization.miner-2', PENDING, EF),
    getRequest('ticket.YELLOW.escalate.RED.authorization.authority-3', PENDING, EMAC),
    getRequest('ticket.B.escalate.D.authorization.miner-3', PENDING, EMAC),

    getRequest('ticket.RED.escalate.YELLOW.authorization.authority-3', PENDING, EF),
    getRequest('ticket.RED.escalate.YELLOW.authorization.authority-3', APPROVED, EF),
    getRequest('ticket.RED.escalate.YELLOW.authorization.authority-3', APPROVED_AND_USED, EF),
    getRequest('ticket.RED.escalate.YELLOW.authorization.authority-3', DENIED, EF),
    getRequest('ticket.RED.escalate.YELLOW.authorization.authority-3', PENDING, EMAC),
    getRequest('ticket.RED.escalate.YELLOW.authorization.authority-3', APPROVED, EMAC),
    getRequest('ticket.RED.escalate.YELLOW.authorization.authority-3', APPROVED_AND_USED, EMAC),
    getRequest('ticket.RED.escalate.YELLOW.authorization.authority-3', DENIED, EMAC),

    getRequest('ticket.B.archive.authorization.miner-2', PENDING, EF),
    getRequest('ticket.B.archive.authorization.miner-2', APPROVED, EF),
    getRequest('ticket.B.archive.authorization.miner-2', APPROVED_AND_USED, EF),
    getRequest('ticket.B.archive.authorization.miner-2', DENIED, EF),
    getRequest('ticket.B.archive.authorization.miner-2', PENDING, EMAC),
    getRequest('ticket.B.archive.authorization.miner-2', APPROVED, EMAC),
    getRequest('ticket.B.archive.authorization.miner-2', APPROVED_AND_USED, EMAC),
    getRequest('ticket.B.archive.authorization.miner-2', DENIED, EMAC),
    getRequest('ticket.A.archive.authorization.authority-2', PENDING, EF),
    getRequest('ticket.A.archive.authorization.miner-1', PENDING, EMAC),
    getRequest('ticket.C.archive.authorization.miner-3', PENDING, EMAC),
    getRequest('ticket.D.archive.authorization.miner-1', PENDING, EMAC),

    getRequest('', '', ''),
    getRequest(undefined, undefined, undefined),
    getRequest(null, null, null),
]

describe('Get the number of a certain kind of authorization requests', () => {
    test('it should return the number of EF authorization requests to close an e&a ticket', () => {
        expect(getNumberOfRequests(requests, EF, CLOSE)).toEqual(4);
    });
    test('it should return the number of EF authorization requests to escalate an e&a ticket', () => {
        expect(getNumberOfRequests(requests, EF, ESCALATE)).toEqual(6);
    });
    test('it should return the number of EF authorization requests to unescalate a red alert ticket', () => {
        expect(getNumberOfRequests(requests, EF, UNESCALATE)).toEqual(1);
    });
    test('it should return the number of EF authorization requests to archive an event ticket', () => {
        expect(getNumberOfRequests(requests, EF, ARCHIVE)).toEqual(2);
    });
    test('it should return the number of EMAC authorization requests to close an e&a ticket', () => {
        expect(getNumberOfRequests(requests, EMAC, CLOSE)).toEqual(3);
    });
    test('it should return the number of EMAC authorization requests to escalate an e&a ticket', () => {
        expect(getNumberOfRequests(requests, EMAC, ESCALATE)).toEqual(3);
    });
    test('it should return the number of EMAC authorization requests to unescalate a red alert ticket', () => {
        expect(getNumberOfRequests(requests, EMAC, UNESCALATE)).toEqual(1);
    });
    test('it should return the number of EMAC authorization requests to archive an event ticket', () => {
        expect(getNumberOfRequests(requests, EMAC, ARCHIVE)).toEqual(4);
    });
    test('it should return 0, because there is no requests', () => {
        expect(getNumberOfRequests([], EMAC, ESCALATE)).toEqual(0);
    });
});

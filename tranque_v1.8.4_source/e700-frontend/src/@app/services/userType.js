import {PERMS, userHasPerm} from '@app/permissions';

const MINERS_PERMS = [
    {codename: PERMS.miner.emac, fromAnyTarget: true},
    {codename: PERMS.miner.e700, fromAnyTarget: true},
    {codename: PERMS.miner.ef, fromAnyTarget: true}
];

const AUTHORITY_PERMS = [
    {codename: PERMS.authority.emac, fromAnyTarget: true},
    {codename: PERMS.authority.e700, fromAnyTarget: true},
    {codename: PERMS.authority.ef, fromAnyTarget: true}
];

export function getUserTypeRouteString(user) {
    if (AUTHORITY_PERMS.some(p => userHasPerm(user, p))) {
        return 'authorities';
    } else if (MINERS_PERMS.some(p => userHasPerm(user, p))) {
        return 'miners';
    } else return null;
}

export function isMiner(user) {
    return MINERS_PERMS.some(p => userHasPerm(user, p));
}

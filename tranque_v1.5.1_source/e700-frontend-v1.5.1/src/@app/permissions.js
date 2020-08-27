import PropTypes from 'prop-types';

export const PermissionProp = PropTypes.shape({
    codename: PropTypes.string.isRequired,
    fromAnyTarget: PropTypes.bool,
    target: PropTypes.string
});

export function getUserTargetPerm(user, target) {
    const ret = new Set();
    if (user.global_permissions) {
        user.global_permissions.forEach(p => ret.add(p));
    }
    const targetObj = user.targets?.find(t => t.canonical_name === target) || {};
    if (targetObj) {
        targetObj.permissions.forEach(p => ret.add(p));
    }
    return Array.from(ret);
}

export function getUserPerms(user, fromAnyTarget) {
    if (fromAnyTarget) {
        const ret = new Set();
        if (user.global_permissions) {
            user.global_permissions.forEach(p => ret.add(p));
        }
        if (user.targets) {
            user.targets.forEach(t => t.permissions.forEach(p => ret.add(p)));
        }
        return Array.from(ret);
    } else {
        return user.global_permissions;
    }
}

export function hasTargetPerm(target, codename) {
    return target.permissions && target.permissions.some(p => p === codename);
}


export function userHasPerm(user, perm) {
    // global permissions
    return user.global_permissions?.some(p => p === perm.codename)
        // permission in any target
        || (perm.fromAnyTarget && user.targets?.some(t => hasTargetPerm(t, perm.codename)))
        // permission in a specific target only
        || (perm.target && user.targets?.some(t => t.canonical_name === perm.target && hasTargetPerm(t, perm.codename)));
}

export const PERMS = {
    miner: {
        ef: 'view.EF.miner',
        emac: 'view.EMAC.miner',
        e700: 'view.E700.miner'
    },
    authority: {
        ef: 'view.EF.authority',
        emac: 'view.EMAC.authority',
        e700: 'view.E700.authority'
    }

};

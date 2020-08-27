/**
 * Get all disconnections of a specific target from a ticket list
 *
 * @param disconnections disconnections list
 * @param target target canonical name
 * @returns disconnections list of a target
 */
export function getTargetDisconnections(targetcanonicalname, disconnectionlist) {
    return disconnectionlist.filter((d) => d.target === targetcanonicalname);
}

/**
 * Reduce disconnections count with a specific scope
 *
 * @param disconnectionlist disconnections list
 * @param scope scope to reduce (ef or emac)
 * @returns disconnections count of the disconnections list by the specified scope
 */
export function getActiveDisconnectionsCount(disconnectionlist, scope) {
    const scopeactivedisconnectionlist = disconnectionlist 
        ? disconnectionlist.filter(d => !d.closed && d.scope === scope) 
        : [];
    return scopeactivedisconnectionlist.length;
}

/**
 * Check if exists active disconnection from disconnection list
 *
 * @param disconnectionlist disconnection list
 * @param scope type of index to reduce (ef or emac)
 * @returns true if has active disconnection else false
 */
export function hasActiveDisconnection(disconnectionlist, scope) {
    const scopeactivedisconnections = disconnectionlist 
        ? disconnectionlist.filter(d => d.scope === scope && !d.closed) 
        : [];
    if (scopeactivedisconnections.length > 0) return true;
    else return false;
}

/**
 * Get last active disconnection from disconnection list
 *
 * @param disconnectionlist disconnection list, ordered descending by disconnections created_at property
 * @param scope type of index to reduce (ef or emac)
 * @returns last active disconnection
 */
export function getLastActiveDisconnection(disconnectionlist, scope) {
    const scopeactivedisconnections = disconnectionlist 
        ? disconnectionlist.filter(d => d.scope === scope && !d.closed) 
        : [];
    if (scopeactivedisconnections.length > 0) return scopeactivedisconnections[0];
    else return null;
}

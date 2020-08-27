import {NONE, NOT_CONFIGURED, WITHOUT_ALERT, YELLOW_ALERT} from '@authorities/constants/indexState';

export function getIndexStatus(value, thresholds) {
    if (!thresholds || value === null) return NOT_CONFIGURED;
    if (thresholds.some(
        t => (t.upper !== null && t.upper !== undefined && +t.upper < value)
            || (t.lower !== null && t.lower !== undefined && +t.lower > value)
    )) {
        return YELLOW_ALERT;
    } else {
        return WITHOUT_ALERT;
    }
}

/**
 * Filter timeseries by target and map result to an array of {timeseries, status}
 *
 * @param canonicalName target canonical name
 * @param timeseries list of timeseries
 * @returns array of {timeseries, status}
 */
export function getTargetIndexesStatus(canonicalName, timeseries) {
    return timeseries
        .filter(t => t.target_canonical_name === canonicalName)
        .map(t => ({
            timeseries: t,
            status: t.events && t.events.length > 0 ? getIndexStatus(t.events[0].value, t.thresholds) : NOT_CONFIGURED
        }));
}

/**
 * Get worst index status value from an array of {timeseries, status}
 *
 * @param targetIndexStatus array of {timeseries, status}
 * @param templateSuffix optional parameter to filter timeseries by a suffix
 * @returns an indexStatus
 */
export function getWorstIndexStatus(targetIndexStatus, templateSuffix = '', defaultStatus=NONE) {
    return targetIndexStatus
        .filter(tis => tis.timeseries.template_name.endsWith(templateSuffix))
        .reduce((acc, tis) => tis.status > acc ? tis.status : acc, defaultStatus);
}

export function getIndexesStatusByTarget(targets, timeseries) {
    return targets.reduce((acc, t) => ({
        ...acc,
        [t.canonical_name]: getTargetIndexesStatus(t.canonical_name, timeseries)
    }), {});
}

export function getWorstIndexNumber(value1, value2) {
    if (isNaN(value1)) return value2;
    if (isNaN(value2)) return value1;
    return Math.max(value1, value2);
}

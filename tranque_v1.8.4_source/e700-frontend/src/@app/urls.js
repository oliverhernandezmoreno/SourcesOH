import * as namedUrls from 'named-urls';
import * as queryString from 'query-string';

const urls = require('./urls.json');

const buildUrl = (entry) => {
    if (typeof entry === 'string') {
        return entry;
    }
    const [base, entries] = entry;
    return namedUrls.include(
        base,
        Object.entries(entries)
            .map(([k, nested]) => [k, buildUrl(nested)])
            .reduce((acc, [k, nested]) => ({...acc, [k]: nested}), {})
    );
};

const ROUTES = buildUrl(urls);

export const route = (propPath) => {
    const v = propPath.split('.')
        .reduce((intermediate, k) => (intermediate || {})[k], ROUTES);
    if (typeof v === 'undefined') {
        throw new Error(`non-existent route ${propPath}`);
    }
    return v.toString();
};

export const reverse = (propPath, pathParams, queryParams = undefined) => {
    const url = namedUrls.reverse(
        route(propPath),
        pathParams
    );
    if (queryParams === undefined) {
        return url;
    } else {
        return `${url}?${queryString.stringify(queryParams)}`;
    }
};

export const parseQueryParams = (str) => queryString.parse(str, {parseNumbers: true, parseBooleans: true});

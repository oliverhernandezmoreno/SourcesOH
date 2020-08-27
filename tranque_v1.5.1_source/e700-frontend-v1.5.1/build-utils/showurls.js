const {include} = require('named-urls');
const urls = require('../src/@app/urls.json');

const buildUrl = (entry) => {
    if (typeof entry === 'string') {
        return entry;
    }
    const [base, entries] = entry;
    return include(
        base,
        Object.entries(entries)
            .map(([k, nested]) => [k, buildUrl(nested)])
            .reduce((acc, [k, nested]) => ({...acc, [k]: nested}), {})
    );
};

const ROUTES = buildUrl(urls);

const collectNested = (acc, name, path) => {
    acc.push({name, path: path.toString()});
    if (typeof path === 'object') {
        Object.entries(path)
            .filter(([nestedName]) => nestedName !== 'toString')
            .forEach(([nestedName, nestedPath]) => collectNested(acc, `${name}.${nestedName}`, nestedPath));
    }
};

const show = () => {
    const flattened = [];
    Object.entries(ROUTES)
        .filter(([name]) => name !== 'toString')
        .forEach(([name, path]) => collectNested(flattened, name, path));
    if (flattened.length === 0) {
        return console.log('-- Nothing to show --');
    }
    const maxPathLength = Math.max(...flattened.map(({path}) => path.length));
    console.log(`${'PATH'.padEnd(maxPathLength, ' ')}    NAME`);
    return flattened.forEach(({name, path}) => console.log(`${path.padEnd(maxPathLength, ' ')} => ${name}`));
};

if (module === require.main) {
    show();
}

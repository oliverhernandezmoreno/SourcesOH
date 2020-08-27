const {value} = utils.assert(await series.query({head: "*"}));
const ref = utils.assert(await refs.getOne("*"));
const threshold = utils.assert(
  ref.active_thresholds
    .filter(({upper, kind}) => kind === null && upper !== null)
    .map(({upper}) => parseFloat(upper))
    .sort((a, b) => a - b)[0]
);
series.yield(value > threshold, {meta: {value, threshold}});

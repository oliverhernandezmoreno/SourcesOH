const {value} = utils.assert(await series.query({head: "*.presion-poros"}));
const threshold = utils.assert(await refs.getOne("*.presion-poros")).active_thresholds
      .filter(({upper, kind}) => kind === null && upper !== null)
      .map(({upper}) => parseFloat(upper))
      .sort((a, b) => a - b)[0];
const valid = ((await series.query({head: "*.validado"})) || {value: 0}).value > 0;
const redundancy = await series.query({head: "*.redundancia"});
const redundant = utils.isDefined(redundancy)
      ? redundancy.meta.vars
      .filter(({data_source}) => data_source !== null)
      .filter(({data_source}) => data_source.id !== ctx.rootRef.data_source.id)
      .map(({data_source}) => data_source.id)
      : [];
series.yield(
  utils.isDefined(threshold) && value >= threshold,
  {meta: {value, threshold, valid, redundant}}
);

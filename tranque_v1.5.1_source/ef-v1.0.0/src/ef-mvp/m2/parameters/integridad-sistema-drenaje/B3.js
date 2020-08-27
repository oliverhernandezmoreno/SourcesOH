const {meta: {vars, heads}} = utils.assert(await series.query({head: "*"}));
// find the appropriate variable and head
const currentVar = utils.assert(
  vars
    .filter(({data_source}) => data_source !== null)
    .filter(({data_source}) => data_source.id === ctx.rootRef.data_source.id)
    .find(({canonical_name}) => canonical_name.endsWith("presion-poros"))
);
const validatorVar = utils.assert(
  vars
    .filter(({data_source}) => data_source !== null)
    .filter(({data_source}) => data_source.id === ctx.rootRef.data_source.id)
    .find(({canonical_name}) => canonical_name.endsWith("validado"))
);
const head = utils.assert(heads.find(({name}) => name === currentVar.canonical_name));
const valid = heads
      .filter(({name}) => name === validatorVar.canonical_name)
      .map(({value}) => value > 0)[0] || false;
// select the threshold
const threshold = utils.assert(
  currentVar.active_thresholds
    .filter(({upper, kind}) => kind === "dren" && upper !== null)
    .map(({upper}) => parseFloat(upper))
    .sort((a, b) => a - b)[0]
);
// yield
series.yield(head.value > threshold, {meta: {threshold, value: head.value, valid}});

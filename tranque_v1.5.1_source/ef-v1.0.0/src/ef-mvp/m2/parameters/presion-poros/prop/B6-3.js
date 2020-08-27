const {meta: {vars, heads}} = utils.assert(await series.query({head: "*"}));
// find the appropriate variable and head
const currentVar = utils.assert(
  vars
    .filter(({data_source}) => data_source !== null)
    .find(({data_source}) => data_source.id === ctx.rootRef.data_source.id)
);
const head = utils.assert(heads.find(({name}) => name === currentVar.canonical_name));
// end early if the value is not an event, or it's not valid
if (head.value <= 0 || !head.meta.valid) {
  return series.yield(false, {meta: {others: []}});
}
// look for other events
const others = heads
      .filter(({name}) => name !== head.name)
      .filter(({value}) => value > 0);
// check if others exist and at least one event is valid
series.yield(
  others.length > 0 && others.some(({meta}) => meta.valid),
  {meta: {others: others.map(({name}) => name)}},
);

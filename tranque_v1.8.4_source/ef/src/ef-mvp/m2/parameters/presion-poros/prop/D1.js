const {meta: {vars, heads}} = await series.query({head: "*"});
// find the appropriate variable and head
const currentVar = utils.assert(
  vars
    .filter(({data_source}) => data_source !== null)
    .find(({data_source}) => data_source.id === ctx.rootRef.data_source.id)
);
const head = utils.assert(heads.find(({name}) => name === currentVar.canonical_name));
// end early if the value is not an event
if (head.value <= 0) {
  return series.yield(false, {meta: {others: []}});
}
// look for others
const others = heads
      .filter(({name}) => name !== head.name)
      .filter(({value}) => value > 0);

series.yield(
  others.length > 0,
  {meta: {others: others.map(({name}) => name)}}
);

const {meta: {vars, heads}} = utils.assert(await series.query({head: "*.t1.*"}));
// find the appropriate variable and head
const currentVar = utils.assert(
  vars
    .filter(({data_source}) => data_source !== null)
    .find(({data_source}) => data_source.id === ctx.rootRef.data_source.id)
);
const head = utils.assert(heads.find(({name}) => name === currentVar.canonical_name));
// end early if the value is not a valid event
if (head.value <= 0 && !head.meta.valid) {
  return series.yield(false, {meta: {others: []}});
}
// look for other events
const {meta: {vars: t2Vars, heads: t2Heads}} = utils.assert(await series.query({head: "*.t2.*"}));
const others = t2Vars
      .filter(({data_source}) => data_source !== null)
      .filter(({data_source}) => data_source.id !== ctx.rootRef.data_source.id)
      .map(({canonical_name}) => t2Heads.find(({name}) => name === canonical_name))
      .filter(utils.isDefined)
      .filter(({value}) => value > 0);

series.yield(
  others.length > 0,
  {meta: {others: others.map(({name}) => name)}}
);

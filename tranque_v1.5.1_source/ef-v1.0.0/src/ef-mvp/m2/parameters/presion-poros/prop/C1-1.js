const {meta: {vars, heads}} = utils.assert(await series.query({head: "*.t1.redundancia"}));
const {value: currentValue} = utils.assert(await series.query({head: "*.t2"}));
if (currentValue <= 0) {
  return series.yield(false, {meta: {others: []}});
}
const currentVar = utils.assert(
  vars
    .filter(({data_source}) => data_source !== null)
    .find(({data_source}) => data_source.id === ctx.rootRef.data_source.id)
);
const others = heads
      .filter(({name}) => name !== currentVar.canonical_name)
      .filter(({value}) => value > 0);
series.yield(
  others.length > 0,
  {meta: {others: others.map(({name}) => name)}},
);

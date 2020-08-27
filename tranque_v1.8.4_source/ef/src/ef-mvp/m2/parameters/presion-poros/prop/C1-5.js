const {meta: {vars, heads}} = utils.assert(await series.query({head: "*.t1.redundancia"}));
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
// look for other events
const others = heads
      .filter(({name}) => name !== head.name)
      .filter(({value}) => value > 0);
// end if no others are events
if (others.length === 0) {
  return series.yield(false, {meta: {others: []}});
}

const location = ctx.rootRef.data_source.groups.find((g) => g.startsWith("ubicacion-"));
if (utils.isUndefined(location)) {
  utils.debug("Instrument is not in a location");
  return series.yield(false, {meta: {others: []}});
}

// look for an event in t2.sector
const {meta: {vars: t2Vars, heads: t2Heads}} = utils.assert(await series.query({head: "*.t2.sector"}));
const candidates = t2Vars
      .filter(({data_source}) => data_source.groups.some((g) => g.startsWith("ubicacion-") && g !== location));
const candidateHeads = t2Heads
      .filter(({value}) => value > 0)
      .filter(({name}) => candidates.some(({canonical_name}) => name === canonical_name));
// abort early if no candidates are found
if (candidateHeads.length === 0) {
  return series.yield(false, {meta: {others: others.map(({name}) => name)}});
}
// look for redundant events in t1.sector
const {meta: {vars: t1Vars, heads: t1Heads}} = utils.assert(await series.query({head: "*.t1.sector"}));
const otherHeads = candidateHeads
      .map((e) => ({
        e,
        linked: t1Vars
          .filter(({data_source}) => e.meta.redundant.indexOf(data_source.id) !== -1)
          .map(({canonical_name}) => t1Heads.find(({name}) => canonical_name === name))
          .filter(utils.isDefined)
          .filter(({value}) => value > 0)
      }))
      .filter(({linked}) => linked.length > 0)
      .flatMap(({e, linked}) => [e, ...linked]);

series.yield(
  otherHeads.length > 0,
  {meta: {others: [...others, ...otherHeads].map(({name}) => name)}},
);

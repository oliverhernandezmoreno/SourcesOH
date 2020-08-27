const {meta: {vars, heads}} = utils.assert(await series.query({head: "*"}));
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
// if it is an event, identify its location
const location = ctx.rootRef.data_source.groups.find((g) => g.startsWith("ubicacion-"));
if (utils.isUndefined(location)) {
  utils.debug("Instrument is not in a location");
  return series.yield(false, {meta: {others: []}});
}
// look for instruments in other locations
const otherVars = vars.filter(
  ({data_source: {groups}}) => groups.some((g) => g.startsWith("ubicacion-") && g !== location)
);
const others = otherVars
      .map(({canonical_name}) => heads.find(({name}) => name === canonical_name))
      .filter(utils.isDefined)
      .filter(({value}) => value > 0);
series.yield(
  others.length > 0,
  {meta: {others: others.map(({name}) => name)}},
);

/**
 * Implements the base criterion for C1-2, C1-3 and C1-4 events, where
 * *n* is the minimum amount of other, same-sector, different-location
 * measurements.
 *
 * @param n <integer> the minimum of other measurements for the
 * raising of an event.
 * @returns <Promise<[bool, string[]]>> a pair of [event, names] where
 * names is a list of variable names contributing to the event.
 */
module.exports.baseCriterion = async (n) => {
  const {meta: {vars, heads}} = utils.assert(await series.query({head: "*.redundancia"}));
  // find the appropriate variable and head
  const currentVar = utils.assert(
    vars
      .filter(({data_source}) => data_source !== null)
      .find(({data_source}) => data_source.id === ctx.rootRef.data_source.id)
  );
  const head = utils.assert(heads.find(({name}) => name === currentVar.canonical_name));
  // end early if the value is not an event
  if (head.value <= 0) {
    return [false, []];
  }
  // look for other events
  const others = heads
        .filter(({name}) => name !== head.name)
        .filter(({value}) => value > 0);
  // end if no others are events
  if (others.length === 0) {
    return [false, []];
  }
  // find another variable in sector with a raised event
  const {meta: {vars: sectorVars, heads: sectorHeads}} = utils.assert(await series.query({head: "*.sector"}));
  const location = ctx.rootRef.data_source.groups.find((g) => g.startsWith("ubicacion-"));
  if (utils.isUndefined(location)) {
    utils.debug("Instrument is not in a location");
    return [false, []];
  }
  const otherVars = sectorVars
        .filter(({data_source: {groups}}) => groups.some((g) => g.startsWith("ubicacion-") && g !== location))
        .filter(({data_source: {id}}) => !vars.some(({data_source: {id: varId}}) => id === varId));
  const sectorOthers = otherVars
        .map(({canonical_name}) => sectorHeads.find(({name}) => name === canonical_name))
        .filter(utils.isDefined)
        .filter(({value}) => value > 0);

  return [
    sectorOthers.length >= n,
    [...others, ...sectorOthers].map(({name}) => name)
  ];
};

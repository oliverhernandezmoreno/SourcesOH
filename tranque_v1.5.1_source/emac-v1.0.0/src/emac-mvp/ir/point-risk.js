const heads = await series.queryAll({head: "*.normalized-variables.*"})
      .then((events) => events.filter(utils.isDefined));
const varRefs = await refs.getMany("*.normalized-variables.*");
const refsByName = varRefs.reduce((byName, varRef) => ({...byName, [varRef.canonical_name]: varRef}), {});
const {meta: {excludedTemplates}} = await series.query({head: "*.exclusions"});
if (heads.length > 0) {
  const previous = await series.query({head: ctx.rootRef});
  const headsToConsider = heads.filter(({name}) => excludedTemplates.indexOf(refsByName[name].template_name) === -1);
  // risk is 0, if no variable is below threshold
  // risk is n + previous risk value, where n is amount of variables over threshold, otherwise
  series.yield(
    headsToConsider.some(({value}) => value > 0.5) ?
      (
        headsToConsider.filter(({value}) => value > 0.5).length +
          (utils.isDefined(previous) ? previous.value : 0)
      ) :
    0,
    {meta: {excludedTemplates}},
  );
}

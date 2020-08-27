const vars = (await refs.getMany("*"))
      .filter((r) => r.data_source.groups.indexOf("aguas-arriba") !== -1);
const varsByName = vars.reduce((byName, v) => ({
  ...byName,
  [v.canonical_name]: v,
}), {});
const heads = await series.queryAll({head: vars});

const excludedTemplates = heads
      .filter(utils.isDefined)
      .filter(({value}) => value > 0.5)
      .map(({name}) => varsByName[name].template_name);

series.yield(
  excludedTemplates.length,
  {meta: {excludedTemplates}},
);

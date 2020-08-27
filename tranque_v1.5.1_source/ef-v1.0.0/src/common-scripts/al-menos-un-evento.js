const values = (await series.queryAll({head: "*"})).filter(utils.isDefined);

if (values.length > 0) {
  const events = values.filter(({value}) => value > 0);
  series.yield(~~(events.length > 0), {meta: {values}});
}

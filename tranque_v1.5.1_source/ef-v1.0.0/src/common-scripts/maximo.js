const values = await series.queryAll({head: "*"});
const maximum = values.slice()
      .sort(({value: vA}, {value: vB}) => vB - vA)[0];

if (utils.isDefined(maximum)) {
  series.yield(maximum.value, {meta: {maximum}});
}

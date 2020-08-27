const values = await series.queryAll({head: "*"});
const minimum = values.slice()
      .sort(({value: vA}, {value: vB}) => vA - vB)[0];

if (utils.isDefined(minimum)) {
  series.yield(minimum.value, {meta: {minimum}});
}

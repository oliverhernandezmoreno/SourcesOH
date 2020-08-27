const value = await series.query({head: "*"});
const variable = await refs.getOne("*");

const threshold = variable.active_thresholds
      .filter(({lower}) => lower !== null)
      .map(({lower}) => parseFloat(lower))
      .sort((a, b) => b - a)[0];

if (utils.isDefined(threshold)) {
  series.yield(~~(value.value < threshold), {meta: {
    value: value.value,
    threshold,
  }});
}

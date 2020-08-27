const value = await series.query({head: "*"});
const ref = await refs.getOne("*");

const threshold = ref.active_thresholds
      .filter(({upper}) => upper !== null)
      .map(({upper}) => parseFloat(upper))
      .sort((a, b) => a - b)[0]  // the lowest

if (utils.isDefined(value) && utils.isDefined(threshold)) {
  series.yield(
    ~~(value.value > threshold),
    {meta: {value: value.value, threshold}}
  );
}

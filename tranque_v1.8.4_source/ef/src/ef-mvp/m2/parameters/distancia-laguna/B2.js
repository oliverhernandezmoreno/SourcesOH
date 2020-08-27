const value = await series.query({head: "*"});
const ref = await refs.getOne("*");

const threshold = ref.active_thresholds
      .filter(({lower}) => lower !== null)
      .map(({lower}) => parseFloat(lower))
      .sort((a, b) => a - b)[1]  // the second lowest

if (utils.isDefined(value) && utils.isDefined(threshold)) {
  series.yield(
    ~~(value.value < threshold),
    {meta: {value: value.value, threshold}}
  );
}

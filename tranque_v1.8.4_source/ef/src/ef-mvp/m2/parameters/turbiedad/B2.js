const ref = await refs.getOne("*");
const threshold = ref.active_thresholds
      .filter(({upper}) => upper !== null)
      .map(({upper}) => parseFloat(upper))
      .sort((u1, u2) => u1 - u2)[0];
const event = await series.query({head: "*"});

series.yield(
  utils.isDefined(threshold) && event.value > threshold,
  {meta: {value: event.value, threshold}},
);

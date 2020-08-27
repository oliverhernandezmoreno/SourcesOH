const head = await series.query({head: "*"});
const ref = await refs.getOne("*");

const thresholds = ref.active_thresholds
      .filter(({kind, upper}) => kind === null && upper !== null)
      .map(({upper}) => parseFloat(upper))
      .sort((a, b) => a - b)
      .slice(0, 2);

const firstCriticalTime = ref.active_thresholds
      .filter(({kind, lower}) => kind === "tiempo-critico-primer-umbral" && lower !== null)
      .map(({lower}) => parseFloat(lower))
      .sort((a, b) => b - a)[0];

const secondCriticalTime = ref.active_thresholds
      .filter(({kind, lower}) => kind === "tiempo-critico-segundo-umbral" && lower !== null)
      .map(({lower}) => parseFloat(lower))
      .sort((a, b) => b - a)[0];

const slice = await series.query({
  slice: "*",
  since: utils.minutesAgo(head["@timestamp"], 60 * 120 + 1),
  count: 1000
});

if (slice.length < 120) {
  return series.yield(0, {timestamp: head["@timestamp"], meta: {}});
}

const regression = await utils.stats("linear-regression", {
  dates: slice.map((e) => e["@timestamp"]).reverse(),
  values: slice.map(({value}) => value).reverse(),
  critical_values: thresholds
});

series.yield(0, {
  timestamp: head["@timestamp"],
  meta: {
    thresholds,
    firstCriticalTime,
    secondCriticalTime,
    regression,
    head
  }
});

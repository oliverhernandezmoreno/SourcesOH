// Extract the timestamp from a potential event
const ts = (e) => utils.isUndefined(e) ? null : e["@timestamp"];

// Find the starting event for a period of *value* which ends at *end*
const startOfPeriod = async (value, end) => {
  const previous = ts((await series.query({
    slice: "*.estado-lluvia",
    count: 1,
    until: end,
    valueEq: (1 - value)
  }))[0]);
  return ts((await series.earliest(
    "*.estado-lluvia",
    {
      count: 1,
      valueEq: value,
      ...(previous === null ? {} : {since: previous}),
    },
  ))[0]);
};

// If there is no data, do nothing
const lastState = await series.query({head: "*.estado-lluvia"}).then(ts);
if (lastState === null) {
  return;
}

const latestNonRain = await series.query({head: "*.estado-lluvia", valueEq: 0}).then(ts);
const latestRain = await series.query({head: "*.estado-lluvia", valueEq: 1}).then(ts);
// If it hasn't rained ever, save a "zero seconds"
if (latestRain === null) {
  return series.yield(0, {meta: {startOfRain: null}});
}
// If the latest period is not rainy, save a "zero seconds"
if (latestNonRain !== null && latestNonRain > latestRain) {
  return series.yield(0, {meta: {startOfRain: null}});
}

const startRain = (await startOfPeriod(1, latestRain)) || latestRain;
const correction = await series.query({head: "*.lluvia.inicio"}).then(ts);
// If it has always rained, save the difference to the correction or
// to the actual start
if (latestNonRain === null) {
  return series.yield(
    Math.max(0, utils.diffInSeconds(latestRain, correction || startRain)),
    {meta: {startOfRain: correction || startRain}},
  );
}

// Any other case, decide whether the correction is relevant:
// - if it shifts the start of the rain back in time, or
// - if it shifts it forward in time
// A non-relevant correction is one that's too old: behind the start
// of the previous dry period
const startNonRain = (await startOfPeriod(0, latestNonRain)) || latestNonRain;
const startOfRain = correction === null || correction < startNonRain ? startRain : correction;
return series.yield(
  Math.max(0, utils.diffInSeconds(latestRain, startOfRain)),
  {meta: {startOfRain}},
);

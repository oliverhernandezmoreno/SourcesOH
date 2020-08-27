const events = series.current("*.m2.*").slice().reverse();
const trigger = await series.query({head: "*.m1.*"});
const forced = utils.isDefined(trigger) && trigger.value > 0;

if (events.length === 0) {
  return series.yield(forced);
}

const beforeTrigger = events
      .filter((e) => !forced || e["@timestamp"] < trigger["@timestamp"]);
const afterTrigger = events
      .filter((e) => forced && e["@timestamp"] >= trigger["@timestamp"]);

const threshold = ctx.rootRef.active_thresholds
      .map((th) => parseFloat(th.upper))
      .find((v) => !isNaN(v));
if (utils.isUndefined(threshold)) {
  // react to the immediate change in the series
  beforeTrigger.forEach((e) => series.yield(
    e.value > 0,
    {timestamp: e["@timestamp"]},
  ));
} else {
  for (let e of beforeTrigger) {
    if (e.value > 0) {
      series.yield(true, {timestamp: e["@timestamp"]});
    } else {
      const window = await series.query({
        slice: "*.m2.*",
        since: utils.minutesAgo(e["@timestamp"], threshold + 1),
        until: e["@timestamp"],
        count: 1000,  // hopefully enough
      });
      series.yield(
        window.some((e) => e.value > 0),
        {timestamp: e["@timestamp"]},
      );
    }
  }
}

afterTrigger.forEach((e) => series.yield(true, {timestamp: e["@timestamp"]}));

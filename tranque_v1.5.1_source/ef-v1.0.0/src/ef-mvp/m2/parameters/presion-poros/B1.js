const {
  meta: {
    thresholds,
    firstCriticalTime,
    regression,
    head
  }
} = await series.query({head: "*"});

if (utils.isUndefined(thresholds) ||
    utils.isUndefined(thresholds[0]) ||
    utils.isUndefined(firstCriticalTime) ||
    utils.isUndefined(regression) ||
    utils.isUndefined(regression.critical_dates) ||
    utils.isUndefined(regression.critical_dates[0])) {
  return series.yield(0);
}

const diff = utils.diffInMinutes(regression.critical_dates[0], head["@timestamp"]) / 60;

series.yield(
  head.value <= thresholds[0] &&
    utils.isAfter(regression.critical_dates[0], head["@timestamp"]) &&
    diff < firstCriticalTime,
  {meta: {diff}}
);

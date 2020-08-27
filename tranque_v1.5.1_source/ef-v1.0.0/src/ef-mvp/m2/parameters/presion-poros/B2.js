const {
  meta: {
    thresholds,
    secondCriticalTime,
    regression,
    head
  }
} = await series.query({head: "*"});

if (utils.isUndefined(thresholds) ||
    utils.isUndefined(thresholds[1]) ||
    utils.isUndefined(secondCriticalTime) ||
    utils.isUndefined(regression) ||
    utils.isUndefined(regression.critical_dates) ||
    utils.isUndefined(regression.critical_dates[1])) {
  return series.yield(0);
}

const diff = utils.diffInMinutes(regression.critical_dates[1], head["@timestamp"]) / 60;

series.yield(
  head.value <= thresholds[1] &&
    utils.isAfter(regression.critical_dates[1], head["@timestamp"]) &&
    diff < secondCriticalTime,
  {meta: {diff}}
);

const {
  meta: {
    thresholds,
    firstCriticalTime,
    regression,
    head
  }
} = await series.query({head: "*.trend"});

const manual = await series.query({head: "*.tendencia-activacion-manual"});
const manualActivation = utils.isDefined(manual) && manual.value > 0;

if (utils.isUndefined(thresholds) ||
    utils.isUndefined(thresholds[0]) ||
    utils.isUndefined(firstCriticalTime) ||
    utils.isUndefined(regression) ||
    utils.isUndefined(regression.critical_dates) ||
    utils.isUndefined(regression.critical_dates[0])) {
  if (manualActivation) {
    return series.yield(true, {meta: {manual: true}});
  }
  return series.yield(false);
}

const diff = utils.diffInMinutes(regression.critical_dates[0], head["@timestamp"]) / 60;

series.yield(
  (
    head.value <= thresholds[0] &&
      utils.isAfter(regression.critical_dates[0], head["@timestamp"]) &&
      diff < firstCriticalTime
  ) || manualActivation,
  {meta: {diff, manual: manualActivation}}
);

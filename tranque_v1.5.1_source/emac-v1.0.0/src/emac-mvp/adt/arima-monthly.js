const data = await series.query({
  slice: "*",
  since: utils.monthsAgo(ctx.timeframe.end, 49),
  count: 240,  // some sensible limit to allow multiple measurements whithin each month
});
// regularize data
const values = data
      .filter((event) => utils.isDefined(event.value) && event.value !== null)
      .filter(
        // keep the last event of every month
        (event, index, arr) => index === 0 ||
          utils.getMonth(arr[index - 1]["@timestamp"]) !== utils.getMonth(event["@timestamp"]),
      )
      .slice(0, 48)
      .map(({value}) => value)
      .reverse();

if (values.length === 48) {
  const head = await series.query({head: "*"});
  const varName = ctx.rootRef
        .canonical_name
        .split(".")
        .reverse()[0];
  const lambda = (await refs.getParameter(`box-cox-lambda-variable-${varName}`)).value;
  const range = (head.meta || {}).range;
  const fitToRange = utils.isDefined(range) ?
        ((x) => {
          let fit = x;
          if (utils.isDefined(range.lt)) {
            fit = Math.min(fit, range.lt);
          }
          if (utils.isDefined(range.lte)) {
            fit = Math.min(fit, range.lte);
          }
          if (utils.isDefined(range.gt)) {
            fit = Math.max(fit, range.gt);
          }
          if (utils.isDefined(range.gte)) {
            fit = Math.max(fit, range.gte);
          }
          return fit;
        }) :
        ((x) => x);

  const arima = await utils.stats("auto-arima", {
    n: ~~(values.length / 2),
    frequency: 12,
    data: values,
    ...(lambda === null ? {} : {lambda}),
  });
  const predictions = arima.mean.map((value, index) => ({
    value: fitToRange(value),
    ...arima.level.reduce((prediction, level, levelIndex) => ({
      ...prediction,
      [`lower${level}`]: fitToRange(arima.lower[index][levelIndex]),
      [`upper${level}`]: fitToRange(arima.upper[index][levelIndex]),
    }), {}),
  }));

  series.yield(head.value, {
    timestamp: head["@timestamp"],
    meta: {
      arima: {
        ...arima,
        lambda,
      },
      interval: "month",
      range,
      values,
      predictions: [
        arima.level
          .reduce((headPrediction, level) => ({
            ...headPrediction,
            [`lower${level}`]: head.value,
            [`upper${level}`]: head.value,
          }), {value: head.value}),
        ...predictions,
      ],
    },
  });
} else {
  utils.debug(`Not enough values for ARIMA ${ctx.rootRef.canonical_name} at ${ctx.timeframe.end} (${values.length} values)`);
}

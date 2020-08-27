const twoYears = 365 * 2;

const data = [];
// Fetch month by month
for (let month = 0; month < 25; month++) {
  const slice = await series.query({
    slice: "*",
    since: utils.monthsAgo(ctx.timeframe.end, month + 1),
    until: utils.monthsAgo(ctx.timeframe.end, month),
    count: 1000,
  });
  // regularize data (average by day)
  slice
    .filter((event) => utils.isDefined(event.value) && event.value !== null)
    .forEach((event, index, arr) => {
      const day = utils.getDay(event["@timestamp"]);
      if (index > 0 && utils.getDay(arr[index - 1]["@timestamp"]) === day) {
        return;
      }
      const dayEvents = [
        event,
        ...arr
          .slice(index + 1)
          .filter((e) => utils.getDay(e["@timestamp"]) === day),
      ];
      const sum = dayEvents.reduce((partial, e) => partial + e.value, 0);
      data.push(sum / dayEvents.length);
    });
}

const values = data
      .slice(0, twoYears)
      .reverse();

if (values.length === twoYears) {
  const head = await series.query({head: "*"});
  const varName = ctx.rootRef
        .canonical_name
        .split(".")
        .reverse()[0];
  const lambda = (await refs.getParameter(`box-cox-lambda-sgt-${varName}`)).value;

  const arima = await utils.stats("auto-arima", {
    n: ~~(values.length / 2),
    frequency: 365,
    data: values,
    ...(lambda === null ? {} : {lambda}),
  });
  const predictions = arima.mean.map((value, index) => ({
    value,
    ...arima.level.reduce((prediction, level, levelIndex) => ({
      ...prediction,
      [`lower${level}`]: arima.lower[index][levelIndex],
      [`upper${level}`]: arima.upper[index][levelIndex],
    }), {}),
  }));

  series.yield(head.value, {
    timestamp: head["@timestamp"],
    meta: {
      arima: {
        ...arima,
        lambda,
      },
      interval: "day",
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

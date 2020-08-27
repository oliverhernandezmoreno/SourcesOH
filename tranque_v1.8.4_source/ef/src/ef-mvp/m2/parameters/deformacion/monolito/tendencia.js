
const DAYSAGO = 36;

const until = await series.query({head: "*.monolito.*"});
const refMax = await refs.getOne("*.deformacion-monolito-*");


if (utils.isDefined(until) && utils.isDefined(until['@timestamp']) && until['@timestamp'] !== null &&
  utils.isDefined(refMax) && utils.isDefined(refMax.active_thresholds)) {

  const threshold = Math.min(
      ...refMax.active_thresholds
        .map(({upper}) => upper)
        .filter((x) => utils.isDefined(x) && x !== null)
        .map((x) => parseFloat(x))
    );


  const since = utils.minutesAgo(until['@timestamp'], DAYSAGO * 60 * 24 + 1);
  const raws = await series.query({
    slice: "*.monolito.*",
    until: until['@timestamp'],
    since: since
  });

  if (raws.length >= 5) {
    const dates = raws
      .filter((event) => utils.isDefined(event['@timestamp']) && event['@timestamp'] !== null)
      .map((event) => event["@timestamp"])

    const values = raws
      .filter((event) => utils.isDefined(event.value) && event.value !== null)
      .map((event) => event.value);


    // Calcular la tendencia en R
    const linear_regression = await utils.stats("linear-regression", {
      dates: dates,
      values: values,
      critical_values: [threshold],
    });

    return series.yield(1, {
      timestamp: until['@timestamp'],
      meta: {
        threshold,
        linear_regression,
        until
      }
    });
  }

  if (utils.isDefined(until) && utils.isDefined(until['@timestamp'])) {
    return series.yield(0, {timestamp: until['@timestamp'], meta: {}});
  } else {
    return series.yield(0, {meta: {}});
  }


}

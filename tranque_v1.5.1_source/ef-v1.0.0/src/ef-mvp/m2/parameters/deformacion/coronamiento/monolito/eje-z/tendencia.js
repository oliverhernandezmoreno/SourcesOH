
const DAYSAGO = 36;

const until = await series.query({head: "*.deformacion-monolito"});
const refMax = await refs.getOne("*.deformacion-monolito-eje-z");


if (utils.isDefined(until) && utils.isDefined(until['@timestamp']) && until['@timestamp'] !== null &&
  utils.isDefined(refMax) && utils.isDefined(refMax.active_thresholds)) {

  const maxThreshold = Math.min(
      ...refMax.active_thresholds
        .map(({upper}) => upper)
        .filter((x) => utils.isDefined(x) && x !== null)
        .map((x) => parseFloat(x))
    );

  const since = utils.daysAgo(until['@timestamp'], DAYSAGO);
  const raws = await series.query({
    slice: "*.deformacion-monolito",
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
      critical_values: [maxThreshold],
    });

    // const intercept = linear_regression.intercept;
    // const slope = linear_regression.slope;

    if (utils.isDefined(linear_regression) &&
      utils.isDefined(linear_regression.critical_timestamps)) {
        const timestamp_threshold = parseFloat(linear_regression.critical_timestamps[0]);
        series.yield(timestamp_threshold, {meta: {linear_regression, raws, until}});
    }

    // if (slope > 0) {
    //   timestamp_threshold = linear_regression.critical_timestamps;
    // } else if (slope < 0 && linear_regression.critical_timestamps.length > 0) {
    //   timestamp_threshold = -1 * linear_regression.critical_timestamps;
    // }

  }
}

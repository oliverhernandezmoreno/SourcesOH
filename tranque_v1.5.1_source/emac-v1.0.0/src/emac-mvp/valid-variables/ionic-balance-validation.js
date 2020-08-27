const balanceTs = refs.match("*.ionic-balance");
const variables = refs.expand("*");
const [variableTs] = variables.filter((name) => name !== balanceTs);
const events = series.current(variableTs);
const ref = await refs.getOne(variableTs);
const balanceRef = await refs.getOne(balanceTs);
const balanceThreshold = balanceRef.active_thresholds
      .find((th) => th.upper !== null);
const balance = await series.query({head: balanceTs});

if (utils.isDefined(balance) &&
    utils.isDefined(balanceThreshold) &&
    balance.value <= parseFloat(balanceThreshold.upper)) {
  const meta = {
    range: {
      ...(ref.range_lt !== null ? {lt: parseFloat(ref.range_lt)} : {}),
      ...(ref.range_lte !== null ? {lte: parseFloat(ref.range_lte)} : {}),
      ...(ref.range_gt !== null ? {gt: parseFloat(ref.range_gt)} : {}),
      ...(ref.range_gte !== null ? {gte: parseFloat(ref.range_gte)} : {}),
    },
  };
  events
    .filter((event) => event.value !== null)
    .filter((event) => {
      let valid = true;
      if (ref.range_gte !== null) {
        valid = valid && parseFloat(ref.range_gte) <= event.value;
      }
      if (ref.range_gt !== null) {
        valid = valid && parseFloat(ref.range_gt) < event.value;
      }
      if (ref.range_lte !== null) {
        valid = valid && parseFloat(ref.range_lte) >= event.value;
      }
      if (ref.range_lt !== null) {
        valid = valid && parseFloat(ref.range_lt) > event.value;
      }
      return valid;
    })
    .filter((event) => ref.validity_intervals.some(
      ({from, to}) => utils.timestampInInterval(event["@timestamp"], from, to),
    ))
    .forEach((event) => series.save(event.value, event["@timestamp"], null, null, meta));
}

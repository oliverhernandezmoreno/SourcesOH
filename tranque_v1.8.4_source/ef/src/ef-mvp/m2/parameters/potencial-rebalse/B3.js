const threshold = (await refs.getOne("*")).active_thresholds
      .filter(({lower, kind}) => lower !== null && kind === "tiempo-evacuacion")
      .map(({lower}) => parseFloat(lower))[0];

if (utils.isUndefined(threshold)) {
  return;
}

const time = await series.query({head: "*"});

if (utils.isUndefined(time)) {
  return;
}

series.yield(time.value < threshold, {meta: {
  inputValue: time.value,
  threshold: {lower: threshold}
}});

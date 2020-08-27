const pr = await series.query({head: "*"});

series.yield(utils.isDefined(pr) && pr.value >= 0.8 && pr.value <= 1.0, {meta: {
  inputValue: utils.isDefined(pr) ? pr.value : null,
  threshold: {upper: 0.8, lower: 1.0}
}});

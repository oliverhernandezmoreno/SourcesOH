const pr = await series.query({head: "*"});

series.yield(utils.isDefined(pr) && pr.value > 1, {meta: {
  inputValue: utils.isDefined(pr) ? pr.value : null,
  threshold: {upper: 1}
}});

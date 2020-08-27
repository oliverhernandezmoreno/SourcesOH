const slice = await series.query({
  slice: "*",
  since: utils.monthsAgo(ctx.timeframe.end, 3)
});

series.yield(~~(slice.length > 0 && slice.every((e) => e.value === 1)));

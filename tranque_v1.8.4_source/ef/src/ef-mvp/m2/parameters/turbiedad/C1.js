const alfa = (await refs.param("alfa-turbiedad")) || 0;

const latest = await series.query({head: "*"});
const slice = await series.query({
  slice: "*",
  count: 1000,
  since: utils.minutesAgo(latest["@timestamp"], alfa * 60 + 1),
});

series.yield(
  slice.every(({value}) => value > 0),
  {meta: {alfa, latest}},
);

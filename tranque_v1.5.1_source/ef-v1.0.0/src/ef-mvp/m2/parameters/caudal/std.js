const {standardDeviation} = require("common-modules/stats");

const head = utils.assert(await series.query({head: "*"}));
const ref = await refs.getOne("*");
const window = utils.assert(
  ref.active_thresholds
    .filter(({kind, upper}) => kind === "ventana-movil" && upper !== null)
    .map(({upper}) => parseFloat(upper))[0]
);

const slice = await series.query({
  slice: "*",
  since: utils.minutesAgo(head["@timestamp"], (window * 60) - 1),
  count: 1000,
});

if (slice.length < window) {
  return;
}

series.yield(standardDeviation(slice), {meta: {window}});

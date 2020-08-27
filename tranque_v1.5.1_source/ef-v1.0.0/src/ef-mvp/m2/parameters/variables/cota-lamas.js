const labelVerticeCubeta = await refs.getParameter("label-vertice-talud-cubeta");

const vertice = await series.query({
  head: "*.elevacion",
  tag: labelVerticeCubeta.value,
});

if (utils.isDefined(vertice) &&
    utils.timestampInInterval(
      vertice["@timestamp"],
      ctx.timeframe.start,
      ctx.timeframe.end,
    )) {
  series.yield(vertice.value, {
    timestamp: vertice["@timestamp"],
    meta: {x: vertice.coords.x}
  });
}

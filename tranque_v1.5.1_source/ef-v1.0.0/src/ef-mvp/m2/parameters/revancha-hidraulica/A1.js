const estadoLluvia = await series.query({head: "*.estado-lluvia"});
const [current, previous] = await series.query({
  slice: "*.revancha-hidraulica",
  count: 2,
});

if (utils.isDefined(current)) {
  series.yield(~~(
    utils.isDefined(previous) &&
      utils.isDefined(estadoLluvia) &&
      estadoLluvia.value > 0 &&
      current.value > previous.value
  ), {meta: {
    current: current.value,
    previous: utils.isDefined(previous) ? previous.value : null
  }});
}

const elevaciones = refs.expand("*.elevacion");
const labelVerticeCoronamiento = await refs.getParameter("label-vertice-coronamiento-aguas-arriba");

const [
  cotaLaguna,
  ...verticesAguasArriba
] = await series.query([
  {head: "*.cota-laguna"},
  ...elevaciones.map((elevacion) => ({
    head: elevacion,
    tag: labelVerticeCoronamiento.value,
  })),
]);

const vertices = verticesAguasArriba.filter(utils.isDefined);

if (utils.isDefined(cotaLaguna) && vertices.length > 0) {
  // select the *lowest* delta
  const lowest = vertices.reduce((min, vertex) => min.value > vertex.value ? vertex : min);
  series.yield(lowest.value - cotaLaguna.value, {
    label: lowest.name,
    meta: {lowest}
  });
}

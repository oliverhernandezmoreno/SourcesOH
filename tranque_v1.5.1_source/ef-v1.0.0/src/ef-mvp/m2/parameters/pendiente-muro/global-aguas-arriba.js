const labelVerticeAguasArriba = await refs.getParameter("label-vertice-coronamiento-aguas-arriba");
const labelVerticeCubeta = await refs.getParameter("label-vertice-talud-cubeta");

const [
  verticeAguasArriba,
  verticeCubeta,
] = await series.query([
  {head: "*.elevacion", tag: labelVerticeAguasArriba.value},
  {head: "*.elevacion", tag: labelVerticeCubeta.value},
]);

if (utils.isDefined(verticeAguasArriba) &&
    utils.isDefined(verticeCubeta) &&
    utils.isDefined(verticeAguasArriba.coords) &&
    utils.isDefined(verticeCubeta.coords) &&
    utils.isDefined(verticeAguasArriba.coords.x) &&
    utils.isDefined(verticeCubeta.coords.x)) {
  const dx = Math.abs(verticeAguasArriba.coords.x - verticeCubeta.coords.x);
  const dy = verticeAguasArriba.value - verticeCubeta.value;
  if (dy !== 0) {
    series.yield(dx / dy);
  }
}

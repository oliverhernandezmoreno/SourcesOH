const labelVerticeAguasAbajo = await refs.getParameter("label-vertice-coronamiento-aguas-abajo");
const labelVerticeAguasArriba = await refs.getParameter("label-vertice-coronamiento-aguas-arriba");

const [
  verticeAguasAbajo,
  verticeAguasArriba,
] = await series.query([
  {head: "*.elevacion", tag: labelVerticeAguasAbajo.value},
  {head: "*.elevacion", tag: labelVerticeAguasArriba.value},
]);
if (utils.isDefined(verticeAguasAbajo) &&
    utils.isDefined(verticeAguasAbajo.coords) &&
    utils.isDefined(verticeAguasAbajo.coords.x) &&
    utils.isDefined(verticeAguasArriba) &&
    utils.isDefined(verticeAguasArriba.coords) &&
    utils.isDefined(verticeAguasArriba.coords.x)) {
  series.yield(Math.abs(verticeAguasAbajo.coords.x - verticeAguasArriba.coords.x));
}

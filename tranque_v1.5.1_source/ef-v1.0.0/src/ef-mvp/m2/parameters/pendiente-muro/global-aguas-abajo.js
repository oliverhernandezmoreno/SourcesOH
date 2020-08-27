const labelVerticeAguasAbajo = await refs.getParameter("label-vertice-coronamiento-aguas-abajo");
const labelVerticePieTalud = await refs.getParameter("label-vertice-pie-muro");

const [
  verticeAguasAbajo,
  pieTalud,
] = await series.query([
  {head: "*.elevacion", tag: labelVerticeAguasAbajo.value},
  {head: "*.elevacion", tag: labelVerticePieTalud.value},
]);

if (utils.isDefined(verticeAguasAbajo) &&
    utils.isDefined(pieTalud) &&
    utils.isDefined(verticeAguasAbajo.coords) &&
    utils.isDefined(pieTalud.coords) &&
    utils.isDefined(verticeAguasAbajo.coords.x) &&
    utils.isDefined(pieTalud.coords.x)) {
  const dx = Math.abs(verticeAguasAbajo.coords.x - pieTalud.coords.x);
  const dy = verticeAguasAbajo.value - pieTalud.value;
  if (dy !== 0) {
    series.yield(dx / dy);
  }
}

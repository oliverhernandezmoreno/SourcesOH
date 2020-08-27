const labelVerticeAguasAbajo = await refs.getParameter("label-vertice-coronamiento-aguas-abajo");
const labelSegmentoCoronamiento = await refs.getParameter("label-segmento-coronamiento");
const labelVerticeAguasArriba = await refs.getParameter("label-vertice-coronamiento-aguas-arriba");

const [
  verticeAguasAbajo,
  coronamiento,
  verticeAguasArriba,
] = await series.query([
  {head: "*.elevacion", tag: labelVerticeAguasAbajo.value},
  {slice: "*.elevacion", tag: labelSegmentoCoronamiento.value},
  {head: "*.elevacion", tag: labelVerticeAguasArriba.value},
]);
const points = [
  verticeAguasAbajo,
  ...(
    coronamiento.length === 0 ?
      [] :
      coronamiento.filter((event) => event["@timestamp"] === coronamiento[0]["@timestamp"])
  ),
  verticeAguasArriba,
].filter((event) => utils.isDefined(event));

if (points.length > 0) {
  // select the *lowest* height
  const lowest = points.reduce((min, point) => min.value > point.value ? point : min);
  series.yield(lowest.value, {coords: lowest.coords, meta: {lowest}});
}

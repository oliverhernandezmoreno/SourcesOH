const labelCoronamiento = await refs.getParameter("label-vertice-coronamiento-aguas-arriba");
const labelTalud = await refs.getParameter("label-segmento-talud-aguas-arriba");
const labelCubeta = await refs.getParameter("label-vertice-talud-cubeta");

const [
  verticeCoronamiento,
  talud,
  verticeCubeta,
] = await series.query([
  {head: "*.elevacion", tag: labelCoronamiento.value},
  {slice: "*.elevacion", count: 400, tag: labelTalud.value},
  {head: "*.elevacion", tag: labelCubeta.value},
]);
const points = [
  verticeCoronamiento,
  ...(
    talud.length === 0 ?
      [] :
      talud.filter((event) => event["@timestamp"] === talud[0]["@timestamp"])
  ),
  verticeCubeta,
]
      .filter((event) => utils.isDefined(event))
      .filter((event) => utils.isDefined(event.coords))
      .filter((event) => utils.isDefined(event.coords.x))
      .sort((a, b) => a.coords.x - b.coords.x);

if (points.length > 1) {
  points.slice(1).forEach((p2, index) => {
    const p1 = points[index];
    const dx = Math.abs(p2.coords.x - p1.coords.x);
    const dy = Math.abs(p1.value - p2.value);
    if (dy !== 0) {
      series.yield(dx / dy, {coords: {x: p1.coords.x}});
    }
  });
}

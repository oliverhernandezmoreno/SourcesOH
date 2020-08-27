const labelPieTalud = await refs.getParameter("label-vertice-pie-muro");
const labelTalud = await refs.getParameter("label-segmento-talud-aguas-abajo");
const labelCoronamiento = await refs.getParameter("label-vertice-coronamiento-aguas-abajo");

const [
  pieTalud,
  talud,
  verticeCoronamiento,
] = await series.query([
  {head: "*.elevacion", tag: labelPieTalud.value},
  {slice: "*.elevacion", count: 400, tag: labelTalud.value},  // enough events to cover the profile, hopefully
  {head: "*.elevacion", tag: labelCoronamiento.value},
]);
const points = [
  pieTalud,
  ...(
    talud.length === 0 ?
      [] :
      talud.filter((event) => event["@timestamp"] === talud[0]["@timestamp"])
  ),
  verticeCoronamiento,
]
      .filter((event) => utils.isDefined(event))
      .filter((event) => utils.isDefined(event.coords))
      .filter((event) => utils.isDefined(event.coords.x))
      .sort((a, b) => a.coords.x - b.coords.x);

if (points.length > 1) {
  points.slice(1).forEach((p2, index) => {
    const p1 = points[index];
    const dx = Math.abs(p2.coords.x - p1.coords.x);
    const dy = Math.abs(p2.value - p1.value);
    if (dy !== 0) {
      series.yield(dx / dy, {coords: {x: p1.coords.x}});
    }
  });
}

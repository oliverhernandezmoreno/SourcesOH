const labelVerticeAguasArriba = await refs.getParameter("label-vertice-coronamiento-aguas-arriba");

const [
  verticeCoronamiento,
  cotaLamas,
] = await series.query([
  {head: "*.elevacion", tag: labelVerticeAguasArriba.value},
  {head: "*.cota-lamas"},
]);

if (utils.isDefined(verticeCoronamiento) &&
    utils.isDefined(cotaLamas)) {
  series.yield(
    verticeCoronamiento.value - cotaLamas.value,
    {meta: {
      coronamiento: verticeCoronamiento.value,
      cotaLamas: cotaLamas.value
    }}
  );
}

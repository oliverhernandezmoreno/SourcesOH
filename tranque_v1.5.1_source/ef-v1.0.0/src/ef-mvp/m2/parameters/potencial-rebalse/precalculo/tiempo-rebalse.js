const ingresoPronosticoTotal = await series.query({head: "*.ingreso-pronosticado-total"});
const volumenDisponible = await series.query({head: "*.volumen-disponible"});

if (utils.isDefined(ingresoPronosticoTotal) &&
    utils.isDefined(volumenDisponible))
{
  const tasa = ingresoPronosticoTotal.meta.tasa;
  if (utils.isDefined(tasa) && tasa !== 0) {
    series.yield((volumenDisponible.value * 10 ** 6) / tasa, {meta: {
      tasa,
      volumenDisponible: volumenDisponible.value
    }});
  }
}

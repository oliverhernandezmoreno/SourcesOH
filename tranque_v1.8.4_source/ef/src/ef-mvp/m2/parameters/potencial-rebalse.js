const ingreso = await series.query({head: "*.ingreso-pronosticado-total"});
const volumenDisponible = await series.query({head: "*.volumen-disponible"});

if (utils.isDefined(ingreso) &&
    utils.isDefined(volumenDisponible) &&
    volumenDisponible.value !== 0)
{
  series.yield(ingreso.value / 10**6 / volumenDisponible.value, {meta: {
    ingreso: ingreso.value,
    volumenDisponible: volumenDisponible.value
  }});
}

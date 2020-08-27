const ingresoReal = (await series.query({head: "*.ingreso-real-acumulado"})) || {value: 0};
const ingresoPronostico = await series.query({head: "*.ingreso-pronosticado"});
const volumenDisponible = await series.query({head: "*.volumen-disponible"});

if (utils.isDefined(ingresoPronostico) &&
    utils.isDefined(volumenDisponible) &&
    ingresoPronostico.value !== 0)
{
  series.yield(((volumenDisponible.value * 10 ** 6) - ingresoReal.value) / ingresoPronostico.value, {meta: {
    ingresoReal: ingresoReal.value,
    ingresoPronostico: ingresoPronostico.value,
    volumenDisponible: volumenDisponible.value
  }});
}

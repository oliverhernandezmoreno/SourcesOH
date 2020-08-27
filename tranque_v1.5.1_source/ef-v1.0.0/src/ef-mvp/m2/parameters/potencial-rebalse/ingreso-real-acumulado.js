const tiempoLloviendo = await series.query({head: "*.tiempo-lloviendo"});
const ingresoReal = await series.query({
  slice: "*.ingreso-real",
  since: utils.secondsAgo(tiempoLloviendo["@timestamp"], tiempoLloviendo.value),
  count: 1000
});

let total = 0;
const ingresos = ingresoReal.map((e) => [(new Date(e["@timestamp"])).getTime() / 1000, e.value]).reverse();

if (ingresos.length === 0) {
  return;
}

const tf = ingresos[ingresos.length - 1][0];
for (let t = tiempoLloviendo.value; t >= 0; t--) {
  const timestamp = tf - tiempoLloviendo.value + t;
  total += ingresos.find(([ti]) => ti >= timestamp)[1] / 3600;
}

series.yield(total, {meta: {
  tiempoLloviendo: tiempoLloviendo.value,
  ingresos: ingresoReal.map((e) => ({"@timestamp": e["@timestamp"], "value": e.value}))
}});

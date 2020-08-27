const tiempoLloviendo = await series.query({head: "*.tiempo-lloviendo"});

const medidasLluvia = await (
  utils.isDefined(tiempoLloviendo) ?
    series.query({
      slice: "*.lluvia",
      since: utils.secondsAgo(tiempoLloviendo["@timestamp"], tiempoLloviendo.value),
      count: 1000
    }) :
    series.query({slice: "*.lluvia", count: 1})
);

if (tiempoLloviendo.value === 0) {
  return series.yield(0, {meta: {tiempoLloviendo: tiempoLloviendo.value}});
}

if (medidasLluvia.length === 0) {
  return;
}

// perform some sort of discrete integration, on a second-by-second
// basis
let total = 0;
const medidas = medidasLluvia.map((e) => [(new Date(e["@timestamp"])).getTime() / 1000, e.value]).reverse();
const tf = medidas[medidas.length - 1][0];
for (let second = tiempoLloviendo.value; second >= 0; second--) {
  // find the right timestamp for this iteration
  const timestamp = tf - tiempoLloviendo.value + second;
  // find the nearest future measurement
  const medida = medidas.find(([t]) => t >= timestamp);
  total += medida[1] / 3600;
}

series.yield(total, {meta: {tiempoLloviendo: tiempoLloviendo.value}});

const [
  pronosticoCantidad,
  pronosticoTiempo,
  volumenDisponible
] = await series.query([
  {head: "*.pronostico-cantidad-lluvia"},
  {head: "*.pronostico-tiempo-lluvia"},
  {head: "*.volumen-disponible"}
]);

if (utils.isUndefined(pronosticoCantidad) ||
    utils.isUndefined(pronosticoTiempo) ||
    pronosticoTiempo.value <= 0)
{
  const ingresoReal = await series.query({head: "*.ingreso-real"});
  if (utils.isUndefined(ingresoReal)) {
    return;
  }
  return series.yield(ingresoReal.value, {meta: {pronosticado: false, pronosticos: []}});
}

const pronostico = Math.abs(pronosticoCantidad.value / pronosticoTiempo.value);

const tiempoLloviendo = await series.query({head: "*.tiempo-lloviendo"});
const segundosLloviendo = utils.isDefined(tiempoLloviendo) ? tiempoLloviendo.value : 0;
const cotaLaguna = await series.query({head: "*.cota-laguna"});

const medidasLluvia = await (
  utils.isDefined(tiempoLloviendo) ?
    series.query({
      slice: "*.lluvia",
      since: utils.secondsAgo(tiempoLloviendo["@timestamp"], tiempoLloviendo.value),
      count: 1000
    }) :
    series.query({slice: "*.lluvia", count: 1})
);
// Build a consolidated rain measurements vector, mixing measurements
// with predictions
const lluvias = [
  // previous measurements
  ...medidasLluvia
    .map((e) => [(new Date(e["@timestamp"])).getTime() / 1000, e.value])
    .map(([t, v], index, arr) => [
      index === 0 ? segundosLloviendo : segundosLloviendo - (arr[0][0] - t),
      v
    ])
    .slice(1)  // remove the latest measurement to replace it with a prediction
    .reverse(),
  // a current measurement or forecast, whatever is higher
  [segundosLloviendo, medidasLluvia.length > 0 ? Math.max(medidasLluvia[0].value, pronostico) : pronostico],
  // forecasts
  ...Array.from({length: pronosticoTiempo.value}, (_, t) => t * 3600)
    .filter((t) => t > segundosLloviendo)
    .map((t) => [t, pronostico])
];

const lluviaPorArea = ({area, cr, p}, lluviaValue) => {
  const factor = (utils.isUndefined(cr) || cr === null) ? 1 : cr;
  const shift = (utils.isUndefined(p) || p === null) ? 0 : p;
  const efectiva = factor * (lluviaValue / 1000 + shift);
  return (efectiva < 0 ? 0 : efectiva) * area;
};

const areasAportantes = (await refs.param("areas-aportantes")) || [];
const areaDirecta = (await refs.param("area-aportante-directa")) || {area: 0};
const areaCubeta = (await refs.param("area-cubeta")) || {area: 0};
const canalesPerimetrales = (await refs.param("canales-perimetrales")) || [];
const embalses = (await refs.param("embalses")) || [];
const vertederos = (await refs.param("vertederos")) || [];

// memoize a computation-intensive function to better implement
// efficient recursive calls
const memoize = (fn) => {
  const results = new Map();
  return (t) => {
    if (!results.has(t)) {
      results.set(t, fn(t));
    }
    return results.get(t);
  };
};

// rain intake for an arbitrary time t, in seconds
const ingresoPorT = memoize((t) => {
  const embalsesT = embalses.map((embalse) => {
    const area = areasAportantes.find(({code}) => embalse.areaCode === code);
    if (utils.isUndefined(area)) {
      return {embalse, ocupado: 0};
    }
    if (lluvias.length === 0) {
      return {embalse, ocupado: 0};
    }
    let total = 0;
    for (let tiempo = t; tiempo >= 0; tiempo--) {
      total += lluviaPorArea(area, lluvias.find(([ti]) => ti >= tiempo)[1]) / 3600;
    }
    return {embalse, ocupado: Math.min(embalse.capacidad, total)};
  });

  const lluviaT = lluvias.find(([ti]) => ti >= t)[1];

  const positives = [
    {area: "directa", value: lluviaPorArea(areaDirecta, lluviaT)},
    {area: "cubeta", value: lluviaPorArea(areaCubeta, lluviaT)},
    ...areasAportantes.map((a) => ({area: a.code, value: lluviaPorArea(a, lluviaT)}))
  ];

  const negatives = [
    ...canalesPerimetrales
      .map((canal) => {
        const area = areasAportantes.find(({code}) => code === canal.areaCode);
        const volumenArea = utils.isDefined(area) ? lluviaPorArea(area, lluviaT) : 0;
        return {canal: canal.code, value: Math.min(canal.desvio, volumenArea)};
      }),

    ...embalsesT
      .map(({embalse: {areaCode, code, capacidad}, ocupado}) => {
        const desvioCanales = canalesPerimetrales
              .filter(({desvioConexion}) => desvioConexion.embalseCode === code)
              .map(({desvio}) => desvio)
              .reduce((partial, d) => partial + d, 0);
        const area = areasAportantes.find((a) => areaCode === a.code);
        const desvioArea = utils.isDefined(area) ? lluviaPorArea(area, lluviaT) : 0;
        return {embalse: code, value: Math.min(capacidad - ocupado, desvioArea + desvioCanales)};
      }),

    ...vertederos
      .filter(
        ({cotaInicioFuncionamiento}) => (
          utils.isDefined(cotaLaguna) && cotaInicioFuncionamiento <= cotaLaguna.value
        ) || (
          utils.isDefined(volumenDisponible) &&
            (volumenDisponible.meta.volumenDisponibleAntesDeMuro * (10 ** 6)) <=
            Array.from({length: t}, (_, x) => x)
            .filter((x) => (x % 3600 === 0))
            .map((x) => ingresoPorT(x).value)
            .reduce((partial, i) => partial + i, 0)
        )
      )
      .map((v) => ({vertedero: v.code, value: v.capacidadDesvio}))
  ];
  const totalPositive = positives.reduce((partial, p) => partial + p.value, 0);
  const totalNegative = negatives.reduce((partial, n) => partial + n.value, 0);
  return {
    t,
    tHora: t / 3600,
    lluvia: lluviaT,
    totalPositive,
    totalNegative,
    value: totalPositive < totalNegative ? 0 : totalPositive - totalNegative,
  };
});

const ingreso = ingresoPorT(segundosLloviendo);

series.yield(ingreso.value, {meta: {
  pronosticado: true,
  pronosticos: Array.from({length: pronosticoTiempo.value}, (_, t) => t * 3600)
    .filter((t) => t >= segundosLloviendo)
    .map((t) => ingresoPorT(t)),
  tiempoLloviendo: segundosLloviendo,
  pronosticoTiempo: pronosticoTiempo.value,
  pronosticoCantidad: pronosticoCantidad.value,
  ingreso,
}});

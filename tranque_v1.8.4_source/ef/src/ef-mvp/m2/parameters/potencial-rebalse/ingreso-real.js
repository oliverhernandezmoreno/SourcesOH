const lluvia = await series.query({head: "*.lluvia"});

if (utils.isUndefined(lluvia)) {
  return;
}

const [tiempoLloviendo, cotaLaguna] = await series.query([
  {head: "*.tiempo-lloviendo"},
  {head: "*.cota-laguna"}
]);

const medidasLluvia = await (
  utils.isDefined(tiempoLloviendo) ?
    series.query({
      slice: "*.lluvia",
      since: utils.secondsAgo(tiempoLloviendo["@timestamp"], tiempoLloviendo.value),
      count: 1000
    }) :
    series.query({slice: "*.lluvia", count: 1})
);

const lluvias = medidasLluvia.map((e) => [(new Date(e["@timestamp"])).getTime() / 1000, e.value]).reverse();

if (lluvias.length === 0) {
  return;
}

const lluviaPorArea = ({area, cr, p}, lluviaValue) => {
  const factor = (utils.isUndefined(cr) || cr === null) ? 1 : cr;
  const shift = (utils.isUndefined(p) || p === null) ? 0 : p;
  const efectiva = factor * ((utils.isDefined(lluviaValue) ? lluviaValue : lluvia.value) / 1000 + shift);
  return (efectiva < 0 ? 0 : efectiva) * area;
};

const areasAportantes = (await refs.param("areas-aportantes")) || [];
const areaDirecta = (await refs.param("area-aportante-directa")) || {area: 0};
const areaCubeta = (await refs.param("area-cubeta")) || {area: 0};
const canalesPerimetrales = (await refs.param("canales-perimetrales")) || [];
const vertederos = (await refs.param("vertederos")) || [];

const embalses = ((await refs.param("embalses")) || [])
      .map((embalse) => {
        const area = areasAportantes.find(({code}) => embalse.areaCode === code);
        if (utils.isUndefined(area)) {
          return {embalse, ocupado: 0};
        }
        if (lluvias.length === 0) {
          return {embalse, ocupado: 0};
        }
        let total = 0;
        const tf = lluvias[lluvias.length - 1][0];
        for (let t = tiempoLloviendo.value; t >= 0; t--) {
          const timestamp = tf - tiempoLloviendo.value + t;
          total += lluviaPorArea(area, lluvias.find(([ti]) => ti >= timestamp)[1]) / 3600;
        }
        return {embalse, ocupado: Math.min(embalse.capacidad, total)};
      });

const positives = [
  {area: "directa", value: lluviaPorArea(areaDirecta)},
  {area: "cubeta", value: lluviaPorArea(areaCubeta)},
  ...areasAportantes.map((a) => ({area: a.code, value: lluviaPorArea(a)}))
];

const negatives = [
  ...canalesPerimetrales
    .map((canal) => {
      const area = areasAportantes.find(({code}) => code === canal.areaCode);
      const volumenArea = utils.isDefined(area) ? lluviaPorArea(area) : 0;
      return {canal: canal.code, value: Math.min(canal.desvio, volumenArea)};
    }),

  ...embalses
    .map(({embalse: {areaCode, code, capacidad}, ocupado}) => {
      const desvioCanales = canalesPerimetrales
            .filter(({desvioConexion}) => desvioConexion.embalseCode === code)
            .map(({desvio}) => desvio)
            .reduce((partial, d) => partial + d, 0);
      const area = areasAportantes.find((a) => areaCode === a.code);
      const desvioArea = utils.isDefined(area) ? lluviaPorArea(area) : 0;
      return {embalse: code, value: Math.min(capacidad - ocupado, desvioArea + desvioCanales)};
    }),

  ...vertederos
    .filter(
      ({cotaInicioFuncionamiento}) => (
        utils.isDefined(cotaLaguna) && cotaInicioFuncionamiento <= cotaLaguna.value
      ))
    .map((v) => ({vertedero: v.code, value: v.capacidadDesvio}))
];

const totalPositive = positives.reduce((partial, p) => partial + p.value, 0);
const totalNegative = negatives.reduce((partial, n) => partial + n.value, 0);

series.yield(totalPositive < totalNegative ? 0 : totalPositive - totalNegative, {
  meta: {
    positives,
    negatives,
    lluvia: lluvia.value,
    tiempoLloviendo: tiempoLloviendo.value,
    cotaLaguna: utils.isDefined(cotaLaguna) ? cotaLaguna.value : null,
    areasAportantes,
    areaDirecta,
    areaCubeta,
    canalesPerimetrales,
    embalses,
    vertederos
  }
});

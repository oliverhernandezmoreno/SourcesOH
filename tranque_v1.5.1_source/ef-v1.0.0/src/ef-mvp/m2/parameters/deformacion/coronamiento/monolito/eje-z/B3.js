// Comparación con umbral y contar cuantos fueron superados para meta
// retornar > 0 si hay algun umbral superado
const DAYS = 36;

const timestamp_threshold = await series.query({head: "*.tendencia"});
const criticalTime = await refs.getOne("*.tendencia");


if (utils.isDefined(timestamp_threshold) && utils.isDefined(criticalTime) &&
    utils.isDefined(criticalTime.active_thresholds) && utils.isDefined(timestamp_threshold.meta) &&
    utils.isDefined(timestamp_threshold.meta.until)) {
  const calc = (Math.min(
      ...criticalTime.active_thresholds
        .map(({upper}) => upper)
        .filter((x) => utils.isDefined(x) && x !== null)
        .map((x) => parseFloat(x))
    ));

  const future = utils.daysAgo(utils.unixTimestampToDate(timestamp_threshold.value), DAYS + calc);

  const supera = utils.isAfter(timestamp_threshold.meta.until['@timestamp'], future);

  series.yield(~~supera, {meta: {
    timestamp_threshold,
    criticalTime: calc
  }});

}


// Comparación con umbral y contar cuantos fueron superados para meta
// retornar 1 si hay algun umbral superado


const event = await series.query({head: "*"});
const refMin = await refs.getOne("*");

if (utils.isDefined(event) && utils.isDefined(refMin) &&
    utils.isDefined(refMin.active_thresholds) && refMin.active_thresholds !== null) {
  const under = event.value < Math.max(
      ...refMin.active_thresholds
        .map(({lower}) => lower)
        .filter((x) => utils.isDefined(x) && x !== null)
        .map((x) => parseFloat(x))
    );

  series.yield(~~under, {meta: {
    thresholds: refMin.active_thresholds,
    value: event.value
  }});

}

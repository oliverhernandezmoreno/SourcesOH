
// Comparación con umbral y contar cuantos fueron superados para meta
// retornar 1 si hay algun umbral superado


const event = await series.query({head: "*"});
const refMax = await refs.getOne("*");


if (utils.isDefined(event) && utils.isDefined(refMax) &&
    utils.isDefined(refMax.active_thresholds)) {

  const maxThreshold = Math.min(
      ...refMax.active_thresholds
        .map(({upper}) => upper)
        .filter((x) => utils.isDefined(x) && x !== null)
        .map((x) => parseFloat(x))
    );

  series.yield(~~(event.value > maxThreshold),
    {meta: {
      thresholds: refMax.active_thresholds,
      value: event.value
    }
  });

}

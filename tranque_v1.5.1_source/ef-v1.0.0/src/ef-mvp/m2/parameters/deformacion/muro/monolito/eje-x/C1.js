
// Comparación con umbral y contar cuantos fueron superados para meta
// retornar > 0 si hay algun umbral superado


const event = await series.query({head: "*.deformacion-monolito"});
const refMax = await refs.getOne("*.deformacion-monolito-eje-x");

if (utils.isDefined(event) && utils.isDefined(refMax)) {
  const supera = utils.isDefined(refMax.active_thresholds) && event.value > Math.min(
      ...refMax.active_thresholds
        .map(({upper}) => upper)
        .filter((x) => utils.isDefined(x) && x !== null)
        .map((x) => parseFloat(x))
    );

  series.yield(~~supera, {meta: {
    thresholds: refMax.active_thresholds,
    value: event.value
  }});

}

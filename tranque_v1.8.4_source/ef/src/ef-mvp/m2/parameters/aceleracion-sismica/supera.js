
// Comparación con umbral y contar cuantos fueron superados para meta
// retornar > 0 si hay algun umbral superado

const events = await series.queryAll({head: "*"});
const refMax = await refs.getMany("*");

if (utils.isDefined(events) && utils.isDefined(refMax)) {
  const superaciones = refMax
    // // Pair threshold, Timeseries
    // .map((threshold) => ({
    //   threshold,
    //   eventRef: events.find(
    //     ({data_source}) => data_source &&
    //       threshold.data_source &&
    //       data_source.id === threshold.data_source.id
    //     )
    // }))
    // Pair threshold, event
    .map((threshold) => ({
      threshold,
      eventRef: events.find(({name}) => name === threshold.canonical_name)
    }))
    .filter(({threshold, eventRef}) => utils.isDefined(eventRef) && utils.isDefined(threshold.active_thresholds) )
    // Only upper threshold
    .filter(({threshold, eventRef}) => eventRef.value > Math.min(
      ...threshold.active_thresholds
        .map(({upper}) => upper)
        .filter((x) => utils.isDefined(x) && x !== null)
        .map((x) => parseFloat(x))
    ));

  // Supera umbral
  series.yield( ~~(superaciones.length > 0), {meta: {superaciones}});

  // const supera = utils.isDefined(refMax.active_thresholds) && event.value > Math.min(
  //     ...refMax.active_thresholds
  //       .map(({upper}) => upper)
  //       .filter((x) => utils.isDefined(x) && x !== null)
  //       .map((x) => parseFloat(x))
  //   );
  //
  //
  // series.yield(~~supera, {meta: {
  //   thresholds: refMax.active_thresholds,
  //   value: event.value
  // }});

}

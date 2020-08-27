
// Comparación con umbral y contar cuantos fueron superados para meta
// retornar > 0 si hay algun umbral superado

const events = await series.queryAll({head: "*.deformacion-inclinometro-z"});
const eventsRef = await refs.getMany("*.deformacion-inclinometro-z");
const refMax = await refs.getMany("*.deformacion-inclinometro-z-eje-x");

const superaciones = refMax
  // Pair threshold, Timeseries
  .map((threshold) => ({
    threshold,
    eventRef: eventsRef.find(
      ({data_source}) => data_source &&
        threshold.data_source &&
        data_source.id === threshold.data_source.id
      )
  }))
  .filter(({threshold, eventRef}) => utils.isDefined(eventRef) && utils.isDefined(threshold.active_thresholds) )
  // Pair threshold, event
  .map(({threshold, eventRef}) => ({
    threshold,
    event: events.find(({name}) => name === eventRef.canonical_name)
  }))
  .filter(({event}) => utils.isDefined(event))
  // Only upper threshold
  .filter(({threshold, event}) => event.value > Math.min(
    ...threshold.active_thresholds
      .map(({upper}) => upper)
      .filter((x) => utils.isDefined(x) && x !== null)
      .map((x) => parseFloat(x))
  ));

// Supera umbral
series.yield(~~(superaciones.length > 0), {meta: {superaciones}});

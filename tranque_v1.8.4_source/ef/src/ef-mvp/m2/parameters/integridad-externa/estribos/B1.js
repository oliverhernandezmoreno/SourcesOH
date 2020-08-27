const INESTABILIDAD_ESTRIBO = 1;

const event = await series.query({head: "*"});

if (utils.isDefined(event)) {
  series.yield(~~(event.value === INESTABILIDAD_ESTRIBO), {meta: {event}})
}

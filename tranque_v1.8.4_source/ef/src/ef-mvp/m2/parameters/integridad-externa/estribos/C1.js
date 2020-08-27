const RIESGO_INTEGRIDAD = 1;

const event = await series.query({head: "*"});

if (utils.isDefined(event)) {
  series.yield(~~(event.value === RIESGO_INTEGRIDAD), {meta: {event}})
}

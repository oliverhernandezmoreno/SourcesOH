const ACTIVACION_MANUAL = 1;

const event = await series.query({head: "*"});

if (utils.isDefined(event)) {
  series.yield(~~(event.value === ACTIVACION_MANUAL), {meta: {event}})
}

const PRESENCIA_GRIETA = 1;

const event = await series.query({head: "*"});

if (utils.isDefined(event)) {
  series.yield(~~(event.value === PRESENCIA_GRIETA), {meta: {event}})
}

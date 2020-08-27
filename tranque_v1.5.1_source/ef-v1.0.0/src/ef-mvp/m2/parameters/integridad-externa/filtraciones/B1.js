const EVENTO_GATILLADOR = 1;

const event = await series.query({head: "*"});

if (utils.isDefined(event)) {
  series.yield(~~(event.value === EVENTO_GATILLADOR), {meta: {event}})
}

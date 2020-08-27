const DESVIACION_RESPECTO_DISENO = 1;

const event = await series.query({head: "*"});

if (utils.isDefined(event)) {
  series.yield(
    ~~(event.value === DESVIACION_RESPECTO_DISENO),
    {meta: {event}}
  );
}

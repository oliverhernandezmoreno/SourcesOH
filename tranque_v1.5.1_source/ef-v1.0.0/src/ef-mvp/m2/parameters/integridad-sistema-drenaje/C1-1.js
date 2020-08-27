const {meta: {heads}} = utils.assert(await series.query({head: "*"}));
const events = heads.filter(({value}) => value > 0);
series.yield(
  events.length > 1,
  {meta: {events: events.map(({name}) => name)}}
);

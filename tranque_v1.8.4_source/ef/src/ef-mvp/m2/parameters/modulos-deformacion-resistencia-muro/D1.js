const DETECTA_D1_YES = + true;  // 1

const events = await series.queryAll({head: "*.detecta-D1"});

if (utils.isDefined(events) && events.length > 0) {
  const last = events[0];
  series.yield(last.value === DETECTA_D1_YES, {meta: {last}})
}

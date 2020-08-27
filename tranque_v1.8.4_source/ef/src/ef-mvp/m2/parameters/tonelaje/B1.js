const { getSuperation } = require("common-modules/superation");

const tonelaje = await refs.getOne("*");
const thresholds = tonelaje.active_thresholds
      .filter(({upper}) => upper !== null)
      .map(({upper}) => parseFloat(upper))
      .sort((u1, u2) => u1 - u2);
const threshold = thresholds[0];

const events = await series.queryAll({head: "*"});

const eventsSuperacion = getSuperation(threshold, events);

series.yield(eventsSuperacion.length > 0, {meta: {threshold, events, eventsSuperacion}});

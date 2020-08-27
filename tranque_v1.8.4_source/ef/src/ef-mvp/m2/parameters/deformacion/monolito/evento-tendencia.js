// Comparación con umbral y contar cuantos fueron superados para meta
// retornar > 0 si hay algun umbral superado
const DAYS = 36;

// const timestamp_threshold = await series.query({head: "*.tendencia"});
const {
  meta: {
    threshold,
    linear_regression,
    until
  }
} = await series.query({head: "*.tendencia"});

if (utils.isUndefined(threshold) ||
    utils.isUndefined(linear_regression) ||
    utils.isUndefined(linear_regression.critical_dates) ||
    utils.isUndefined(linear_regression.critical_dates[0]) ||
    utils.isUndefined(until)) {
      return series.yield(0);
}

const criticalTimeSerie = await refs.getOne("*.tendencia");

if (utils.isUndefined(criticalTimeSerie) ||
  utils.isUndefined(criticalTimeSerie.active_thresholds)
) {
  return series.yield(0);
}

const criticalTime = Math.min(
    ...criticalTimeSerie.active_thresholds
      .map(({upper}) => upper)
      .filter((x) => utils.isDefined(x) && x !== null)
      .map((x) => parseFloat(x))
  );


const daysAgo = utils.minutesAgo(linear_regression.critical_dates[0], (DAYS - criticalTime) * 24 * 60 + 1);
const supera = await utils.isAfter(until['@timestamp'], daysAgo);

// console.log("calcDaysAgo:", linear_regression.critical_dates[0], (DAYS - criticalTime) * 24 * 60);
// console.log("daysAgo:", daysAgo);
// console.log("supera:", supera);


series.yield(~~supera,
  {meta: {
    linear_regression,
    criticalTime,
    daysAgo,
    until
  }
});

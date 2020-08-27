// 1.- relacionas threholds con eventos
// 2.- encontrar menor threhold por evento
// 3.- traer por evento slice de 36 dias
// 4.- calcular regresion de tendencia por slice con threhold
// 5.- acumular superaciones de tendencia

const DAYSAGO = 36;

const until = await series.query({head: "*.inclinometro.*"});
// const refMax = await refs.getOne("*.deformacion-inclinometro-z-*");

if (utils.isDefined(until) && utils.isDefined(until['@timestamp']) && until['@timestamp'] !== null && utils.isDefined(until.meta)){
  const refMax = until.meta.ref;
  if (utils.isDefined(refMax) && utils.isDefined(refMax.active_thresholds)) {
    const threshold = Math.min(
        ...refMax.active_thresholds
          .map(({upper}) => upper)
          .filter((x) => utils.isDefined(x) && x !== null)
          .map((x) => parseFloat(x))
      );

    const since = utils.minutesAgo(until['@timestamp'], DAYSAGO * 60 * 24 + 1);
    const raws = await series.query({
      slice: "*.inclinometro.*",
      until: until['@timestamp'],
      since: since
    });

    if (raws.length >= 5) {
      const dates = raws
        .filter((event) => utils.isDefined(event['@timestamp']) && event['@timestamp'] !== null)
        .map((event) => event["@timestamp"])

      const values = raws
        .filter((event) => utils.isDefined(event.value) && event.value !== null)
        .map((event) => event.value);


      // Calcular la tendencia en R
      const linear_regression = await utils.stats("linear-regression", {
        dates: dates,
        values: values,
        critical_values: [threshold],
      });

      return series.yield(1, {
        timestamp: until['@timestamp'],
        meta: {
          threshold,
          linear_regression,
          until
        }
      });
    }
  }
}
return series.yield(0, {meta: {}});
